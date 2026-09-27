/*
  Tugas yang ada di file ini:
  1. Pencarian Real-Time dengan Debounce (pakai Closure)
  2. Filter Kategori via <select> dropdown
  3. Sorting harga (termurah/termahal) & rating, pakai fungsi array (sort())
  4. Keranjang Belanja — CRUD ke localStorage, badge jumlah + total harga
  5. Modal Detail Produk — wajib pakai Event Delegation
*/

// ===== Elemen DOM yang dipakai di file ini =====
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const sortSelect = document.getElementById("sortSelect");

const cartBtn = document.getElementById("cartBtn");
const cartBadge = document.getElementById("cartBadge");
const cartModal = document.getElementById("cartModal");
const cartCloseBtn = document.getElementById("cartCloseBtn");
const cartItemsContainer = document.getElementById("cartItemsContainer");
const cartTotalEl = document.getElementById("cartTotal");

const productModal = document.getElementById("productModal");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalBody = document.getElementById("modalBody");

// ===========================================================================
// 2. Isi dropdown kategori secara dinamis
// (dipanggil dari fetchProducts() di catalog.js begitu data produk datang)
// ===========================================================================
function populateCategoryOptions(products) {
  const categories = [...new Set(products.map((p) => p.category))];

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

// ===========================================================================
// 1. Debounce (memanfaatkan Closure)
// Supaya pencarian tidak memicu re-render di setiap ketikan keyboard.
// ===========================================================================
function debounce(callback, delay) {
  let timeoutId; // disimpan lewat closure, tetap "hidup" antar pemanggilan

  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

// ===========================================================================
// 1 + 2 + 3. Gabungan Search + Filter Kategori + Sorting
// Selalu dihitung ulang dari allProducts (variabel dari catalog.js), lalu
// hasilnya dikirim ke refreshProductList() di catalog.js supaya pagination
// ikut direset dan grid dirender ulang dari nol.
// ===========================================================================
function applyFiltersAndSort() {
  const keyword = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value; // "" = semua kategori
  const sortBy = sortSelect.value; // "" = tanpa urutan khusus

  let result = allProducts.filter((product) => {
    const matchesKeyword =
      product.title.toLowerCase().includes(keyword) ||
      product.category.toLowerCase().includes(keyword);

    const matchesCategory = category === "" || product.category === category;

    return matchesKeyword && matchesCategory;
  });

  // Sorting pakai fungsi manipulasi array, tanpa ubah array asli (spread dulu)
  if (sortBy === "price-asc") {
    result = [...result].sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    result = [...result].sort((a, b) => b.price - a.price);
  } else if (sortBy === "rating-desc") {
    result = [...result].sort((a, b) => b.rating - a.rating);
  }

  refreshProductList(result); // dari catalog.js
}

const debouncedSearch = debounce(applyFiltersAndSort, 400);

searchInput.addEventListener("input", debouncedSearch);
categorySelect.addEventListener("change", applyFiltersAndSort);
sortSelect.addEventListener("change", applyFiltersAndSort);

// ===========================================================================
// 4. Keranjang Belanja (Local Storage CRUD)
// ===========================================================================
function getCart() {
  const cartData = localStorage.getItem("cart");
  return cartData ? JSON.parse(cartData) : [];
}

function saveCart(cart) {
  if (cart.length === 0) {
    localStorage.removeItem("cart");
  } else {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
}

function addToCart(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  const cart = getCart();
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      quantity: 1,
    });
  }

  saveCart(cart);
  updateCartBadge();
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== productId);
  saveCart(cart);
  updateCartBadge();
  renderCartItems();
}

function updateCartBadge() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalItems;
}

function renderCartItems() {
  const cart = getCart();
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<p class="cart-empty">Keranjang masih kosong.</p>`;
    cartTotalEl.textContent = "";
    return;
  }

  let total = 0;

  cart.forEach((item) => {
    total += item.price * item.quantity;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${item.thumbnail}" alt="${item.title}" class="cart-item-thumb">
      <div class="cart-item-info">
        <p class="cart-item-title">${item.title}</p>
        <p class="cart-item-qty">Qty: ${item.quantity} x $${item.price.toFixed(2)}</p>
      </div>
      <button class="cart-remove-btn" data-id="${item.id}">Hapus</button>
    `;
    cartItemsContainer.appendChild(row);
  });

  cartTotalEl.textContent = `Total: $${total.toFixed(2)}`;
}

cartBtn.addEventListener("click", function () {
  renderCartItems();
  cartModal.classList.remove("hidden");
});

cartCloseBtn.addEventListener("click", function () {
  cartModal.classList.add("hidden");
});

// Event delegation buat tombol "Hapus" di dalam cart modal
cartItemsContainer.addEventListener("click", function (event) {
  const removeBtn = event.target.closest(".cart-remove-btn");
  if (!removeBtn) return;

  const productId = Number(removeBtn.dataset.id);
  removeFromCart(productId);
});

// ===========================================================================
// 5. Modal Detail Produk (Event Delegation)
// Satu listener di elemen parent (productGrid), bukan satu-satu per kartu.
// ===========================================================================
productGrid.addEventListener("click", function (event) {
  const addCartBtn = event.target.closest(".btn-add-cart");
  const card = event.target.closest(".product-card");

  // Klik tombol "Tambah ke Keranjang" -> jangan buka modal
  if (addCartBtn) {
    const productId = Number(addCartBtn.dataset.id);
    addToCart(productId);
    return;
  }

  // Klik di mana pun di kartu (selain tombol keranjang) -> buka modal detail
  if (card) {
    const productId = Number(card.dataset.id);
    openProductModal(productId);
  }
});

function openProductModal(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  modalBody.innerHTML = `
    <span class="product-category">${product.category}</span>
    <h2>${product.title}</h2>
    <p class="modal-brand">Brand: ${product.brand || "Tidak diketahui"}</p>
    <div class="product-meta">
      <span class="product-price">$${product.price.toFixed(2)}</span>
      <span class="product-rating">★ ${product.rating}</span>
    </div>
    <p class="modal-stock">Stok tersedia: ${product.stock}</p>
    <p class="modal-description">${product.description}</p>
    <button class="btn-add-cart modal-add-btn" data-id="${product.id}">Tambah ke Keranjang</button>
  `;

  productModal.classList.remove("hidden");
}

modalCloseBtn.addEventListener("click", function () {
  productModal.classList.add("hidden");
});

// Tombol "Tambah ke Keranjang" di dalam modal detail (event delegation juga)
modalBody.addEventListener("click", function (event) {
  const addCartBtn = event.target.closest(".btn-add-cart");
  if (!addCartBtn) return;

  const productId = Number(addCartBtn.dataset.id);
  addToCart(productId);
});

// Klik area gelap di luar kartu modal -> tutup modal
[productModal, cartModal].forEach((overlay) => {
  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) {
      overlay.classList.add("hidden");
    }
  });
});

// ===========================================================================
// Inisialisasi badge keranjang saat halaman dimuat
// ===========================================================================
updateCartBadge();
