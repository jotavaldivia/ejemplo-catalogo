let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let filtered = [];

document.getElementById("storeLogo").src = CONFIG.logo;

/* =========================
   FORMAT PRICE CLP
========================= */
function formatPrice(price) {

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0
  }).format(price);
}

/* =========================
   LOAD PRODUCTS
========================= */
async function loadProducts() {

  const res = await fetch("products.json");

  products = await res.json();

  filtered = products;

  renderProducts();

  updateCart();
}

/* =========================
   RENDER PRODUCTS
========================= */
function renderProducts() {

  const search =
    document.getElementById("searchInput").value?.toLowerCase() || "";

  filtered = products.filter(p =>
    p.name.toLowerCase().includes(search) ||
    p.category.toLowerCase().includes(search)
  );

  const catalog = document.getElementById("catalog");

  catalog.innerHTML = "";

  filtered.forEach((product, i) => {

    const selectedIndex = product.selected || 0;

    const v = product.variants[selectedIndex];

    const card = document.createElement("div");

    card.className = "card";

    card.innerHTML = `
    
      <img 
        id="img-${i}" 
        src="${v.image || 'https://via.placeholder.com/300x300'}"
      >

      <h3>${product.name}</h3>

      <span>${product.description}</span>

      <select onchange="changeVariant(${i}, this.value)">

        ${product.variants.map((variant, idx) => `
          
          <option value="${idx}">
            ${variant.name}
          </option>

        `).join("")}

      </select>

      <p id="price-${i}">
        ${formatPrice(v.price)}
      </p>

      <button onclick="addToCart(${i})">
        Agregar
      </button>

    `;

    catalog.appendChild(card);
  });
}

/* =========================
   VARIANTES
========================= */
function changeVariant(i, vIndex) {

  const product = filtered[i];

  const v = product.variants[vIndex];

  document.getElementById(`img-${i}`).src =
    v.image || "https://via.placeholder.com/300x300";

  document.getElementById(`price-${i}`).innerText =
    formatPrice(v.price);

  product.selected = Number(vIndex);
}

/* =========================
   ADD CART
========================= */
function addToCart(i) {

  const product = filtered[i];

  const vIndex = product.selected || 0;

  const v = product.variants[vIndex];

  const exist = cart.find(c =>
    c.name === product.name &&
    c.variant === v.name
  );

  if (exist) {

    exist.qty++;

  } else {

    cart.push({

      id: product.id,

      name: product.name,

      description: product.description,

      category: product.category,

      variant: v.name,

      price: v.price,

      image: v.image || "https://via.placeholder.com/80",

      qty: 1
    });
  }

  saveCart();

  updateCart();

  openCart();
}

/* =========================
   SAVE CART
========================= */
function saveCart() {

  localStorage.setItem("cart", JSON.stringify(cart));
}

/* =========================
   OPEN CART
========================= */
function openCart() {

  document.getElementById("cart")
    .classList.remove("hidden");
}

/* =========================
   CART
========================= */
function updateCart() {

  const list = document.getElementById("cartItems");

  list.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {

    total += item.price * item.qty;

    const li = document.createElement("li");

    li.className = "cart-item";

    li.innerHTML = `

      <div class="cart-item-left">

        <img 
          src="${item.image || 'https://via.placeholder.com/80'}" 
          class="cart-img"
        >

        <div class="cart-info">

          <strong>${item.name}</strong>

          <div>${item.variant}</div>

          <div>${formatPrice(item.price)}</div>

        </div>

      </div>

      <div class="qty-controls">

        <button onclick="decreaseQty(${index})">
          -
        </button>

        <span>${item.qty}</span>

        <button onclick="increaseQty(${index})">
          +
        </button>

        <button 
          class="delete-btn" 
          onclick="removeItem(${index})"
        >
          🗑️
        </button>

      </div>

    `;

    list.appendChild(li);
  });

  document.getElementById("total").innerText =
    "Total: " + formatPrice(total);

  document.getElementById("cartCount").innerText =
    cart.reduce((a, b) => a + b.qty, 0);
}

/* =========================
   CONTROLES
========================= */
function increaseQty(i) {

  cart[i].qty++;

  saveCart();

  updateCart();
}

function decreaseQty(i) {

  if (cart[i].qty > 1) {

    cart[i].qty--;

  } else {

    cart.splice(i, 1);
  }

  saveCart();

  updateCart();
}

function removeItem(i) {

  cart.splice(i, 1);

  saveCart();

  updateCart();
}

/* =========================
   CART TOGGLE
========================= */
function toggleCart() {

  document.getElementById("cart")
    .classList.toggle("hidden");
}

/* =========================
   WHATSAPP
========================= */
function sendWhatsApp() {

  let msg =
    "Hola, estoy interesado en adquirir los siguientes productos:%0A%0A";

  let total = 0;

  cart.forEach(item => {

    const subtotal = item.price * item.qty;

    total += subtotal;

    msg += `• Producto: ${item.name}%0A`;

    msg += `  Variante: ${item.variant}%0A`;

    msg += `  Cantidad: ${item.qty}%0A`;

    msg += `  Subtotal: ${formatPrice(subtotal)}%0A%0A`;
  });

  msg += `Total del pedido: ${formatPrice(total)}%0A%0A`;

  msg += "Quedo atento a la confirmación. Muchas gracias.";

  const url =
    `https://wa.me/${CONFIG.whatsapp}?text=${msg}`;

  window.open(url, "_blank");
}

/* =========================
   INIT
========================= */

// Limpia carritos antiguos rotos
if (
  cart.some(item => item.image === undefined)
) {

  localStorage.removeItem("cart");

  cart = [];
}

loadProducts();