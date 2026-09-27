// ==========================================
// 1. AUTH GUARD
// ==========================================
// Cek nama user yang disimpan oleh Piramidiana di login.js
const currentUser = localStorage.getItem("currentUser");

if (!currentUser) {
  // Jika belum login, redirect paksa kembali ke login.html
  window.location.href = "login.html";
}

// ==========================================
// STATE MANAGEMENT & ELEMEN DOM
// ==========================================
let allProducts = [];
let visibleProductsCount = 0;
const BATCH_SIZE = 12; // Jumlah produk per batch

// Daftar produk yang LAGI AKTIF ditampilkan (berubah kalau user search/filter/sort)
let displayedProducts = [];

const userNameEl = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");
const productGrid = document.getElementById("productGrid");
const productCountEl = document.getElementById("productCount");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const errorMessageEl = document.getElementById("errorMessage");

// ==========================================
// 2. NAVBAR & LOGOUT
// ==========================================
// Tampilkan nama user dari localStorage
userNameEl.textContent = currentUser;

// Fitur Logout: Hapus session dan redirect ke halaman login
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
});

// ==========================================
// 3. RENDER PRODUK DINAMIS & 5. GLOBAL ERROR HANDLING
// ==========================================
async function fetchProducts() {
  try {
    // Tampilkan status loading awal
    productGrid.innerHTML = `<p class="loading-text">Memuat produk...</p>`;
    errorMessageEl.classList.add("hidden");

    // Fetch data produk dari API DummyJSON
    const response = await fetch("https://dummyjson.com/products?limit=100");
    
    if (!response.ok) {
      throw new Error("Gagal mengambil data produk dari server.");
    }

    const data = await response.json();
    allProducts = data.products || [];

    displayedProducts = allProducts;

    if (typeof populateCategoryOptions === "function") {
      populateCategoryOptions(allProducts);
    }

    // Bersihkan teks loading
    productGrid.innerHTML = "";

    // Render batch pertama (12 produk awal)
    loadMoreProducts();

  } catch (error) {
    console.error("Error fetching products:", error);
    
    // Tampilkan pesan error visual jika proses fetch() gagal
    productGrid.innerHTML = "";
    errorMessageEl.textContent = "Gagal memuat katalog produk. Periksa koneksi internet Anda dan coba lagi.";
    errorMessageEl.classList.remove("hidden");
  }
}

// Fungsi pembantu untuk membuat HTML Kartu Produk
function createProductCard(product) {
  const discountText = product.discountPercentage 
    ? `-${Math.round(product.discountPercentage)}%` 
    : '';

  return `
    <div class="product-card" data-id="${product.id}">
      ${discountText ? `<span class="discount-badge">${discountText}</span>` : ''}
      <div class="product-image-container">
        <img src="${product.thumbnail}" alt="${product.title}" loading="lazy">
      </div>
      <div class="product-details">
        <span class="product-category">${product.category}</span>
        <h3 class="product-title">${product.title}</h3>
        <div class="product-meta">
          <span class="product-price">$${product.price.toFixed(2)}</span>
          <span class="product-rating">★ ${product.rating}</span>
        </div>
        <button class="btn-add-cart" data-id="${product.id}">Tambah ke Keranjang</button>
      </div>
    </div>
  `;
}

// ==========================================
// 4. LOAD MORE / PAGINATION (ARRAY SLICING)
// ==========================================
function loadMoreProducts() {
  // Mengambil batch berikutnya menggunakan teknik Array Slicing
  const nextBatch = displayedProducts.slice(visibleProductsCount, visibleProductsCount + BATCH_SIZE);
  
  nextBatch.forEach(product => {
    productGrid.insertAdjacentHTML("beforeend", createProductCard(product));
  });

  visibleProductsCount += nextBatch.length;

  // Update indikator teks jumlah produk yang sedang tampil
  productCountEl.textContent = `${visibleProductsCount} dari ${displayedProducts.length} produk`;

  // Sembunyikan tombol jika seluruh produk sudah ditampilkan
  if (visibleProductsCount >= displayedProducts.length) {
    loadMoreBtn.classList.add("hidden");
  } else {
    loadMoreBtn.classList.remove("hidden");
  }
}

function refreshProductList(newList) {
  displayedProducts = newList;
  visibleProductsCount = 0;
  productGrid.innerHTML = "";
  loadMoreProducts();
}

// Event Listener tombol "Muat lebih banyak"
loadMoreBtn.addEventListener("click", loadMoreProducts);

// Jalankan fetch saat halaman dimuat
fetchProducts();