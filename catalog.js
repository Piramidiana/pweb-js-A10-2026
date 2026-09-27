
const currentUser = localStorage.getItem("currentUser");

if (!currentUser) {
  window.location.href = "login.html";
}

let allProducts = [];
let visibleProductsCount = 0;
const BATCH_SIZE = 12; 


let displayedProducts = [];

const userNameEl = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");
const productGrid = document.getElementById("productGrid");
const productCountEl = document.getElementById("productCount");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const errorMessageEl = document.getElementById("errorMessage");

userNameEl.textContent = currentUser;


logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
});


async function fetchProducts() {
  try {
    
    productGrid.innerHTML = `<p class="loading-text">Memuat produk...</p>`;
    errorMessageEl.classList.add("hidden");

    
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

    
    productGrid.innerHTML = "";

    
    loadMoreProducts();

  } catch (error) {
    console.error("Error fetching products:", error);
   
    productGrid.innerHTML = "";
    errorMessageEl.textContent = "Gagal memuat katalog produk. Periksa koneksi internet Anda dan coba lagi.";
    errorMessageEl.classList.remove("hidden");
  }
}


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


function loadMoreProducts() {
  

  const nextBatch = displayedProducts.slice(visibleProductsCount, visibleProductsCount + BATCH_SIZE);
  
  nextBatch.forEach(product => {
    productGrid.insertAdjacentHTML("beforeend", createProductCard(product));
  });

  visibleProductsCount += nextBatch.length;

 
  productCountEl.textContent = `${visibleProductsCount} dari ${displayedProducts.length} produk`;

 
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


loadMoreBtn.addEventListener("click", loadMoreProducts);


fetchProducts();