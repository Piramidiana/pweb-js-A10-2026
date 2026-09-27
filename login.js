
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("errorMessage");
const loginBtn = document.getElementById("loginBtn");


loginForm.addEventListener("submit", async function (event) {
  event.preventDefault(); 

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();


  errorMessage.textContent = "";


  loginBtn.disabled = true;
  loginBtn.textContent = "Memeriksa...";

  try {
  const response = await fetch("https://dummyjson.com/users?limit=0");

  if (!response.ok) {
    throw new Error("Gagal terhubung ke server. Coba lagi.");
  }

  const data = await response.json();
  const users = data.users;

  const matchedUser = users.find(
    (user) => user.username === username && user.password === password
  );

  if (matchedUser) {
    localStorage.setItem("currentUser", matchedUser.firstName);
    window.location.href = "index.html";
  } else {
    errorMessage.textContent =
      "Username atau password salah. Coba lagi.";
  }

  } catch (error) {

    console.error("Login error:", error);
    errorMessage.textContent = "Terjadi kesalahan koneksi. Periksa internet kamu dan coba lagi.";
  } finally {
   
    loginBtn.disabled = false;
    loginBtn.textContent = "Masuk";
  }
});
