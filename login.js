// ===== Ambil elemen-elemen yang dibutuhkan dari HTML =====
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("errorMessage");
const loginBtn = document.getElementById("loginBtn");

// ===== Listener utama: saat form di-submit =====
loginForm.addEventListener("submit", async function (event) {
  event.preventDefault(); // supaya halaman tidak reload/refresh saat submit

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  // Reset pesan error tiap kali user coba submit lagi
  errorMessage.textContent = "";

  // ===== LOADING STATE =====
  // Nonaktifkan tombol dan ubah teksnya, supaya user tahu proses sedang berjalan
  loginBtn.disabled = true;
  loginBtn.textContent = "Memeriksa...";

  try {
    // ===== FETCH ke Users API =====
    const response = await fetch("https://dummyjson.com/users");

    // Kalau response tidak OK (misal server error), lempar error manual
    if (!response.ok) {
      throw new Error("Gagal terhubung ke server. Coba lagi.");
    }

    const data = await response.json();
    const users = data.users; // dummyjson.com/users mengembalikan { users: [...] }

    // ===== Cari user yang username & password-nya cocok =====
    const matchedUser = users.find(
      (user) => user.username === username && user.password === password
    );

    if (matchedUser) {
      // ===== SESSION PERSISTENCE =====
      // Simpan firstName ke localStorage, dipakai lagi di halaman katalog
      localStorage.setItem("currentUser", matchedUser.firstName);

      // ===== AUTO REDIRECT =====
      window.location.href = "index.html";
    } else {
      // Username/password tidak cocok dengan siapa pun di data
      errorMessage.textContent = "Username atau password salah. Coba lagi.";
    }
  } catch (error) {
    // ===== ERROR HANDLING =====
    // Ini menangkap 2 kemungkinan: fetch gagal total (misal tidak ada internet),
    // atau error yang kita lempar manual di atas (response tidak OK)
    console.error("Login error:", error);
    errorMessage.textContent = "Terjadi kesalahan koneksi. Periksa internet kamu dan coba lagi.";
  } finally {
    // ===== Matikan loading state, apa pun hasilnya (sukses/gagal) =====
    loginBtn.disabled = false;
    loginBtn.textContent = "Masuk";
  }
});
