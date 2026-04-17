const API = "http://localhost:3000/auth";

// Nếu đã đăng nhập thì redirect luôn
const token = localStorage.getItem("qldkmh_token");
const savedUser = JSON.parse(localStorage.getItem("qldkmh_user") || "null");
if (token && savedUser) {
  window.location.href = savedUser.role === "admin" ? "/trangchu.html" : "/enroll.html";
}

// Toggle hiện/ẩn mật khẩu
document.getElementById("toggle-pw").addEventListener("click", function () {
  const pwInput = document.getElementById("password");
  const isHidden = pwInput.type === "password";
  pwInput.type = isHidden ? "text" : "password";
  this.textContent = isHidden ? "🙈" : "👁";
});

// Xử lý form đăng nhập
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const btn = document.getElementById("btn-login");
  const errEl = document.getElementById("auth-error");

  btn.disabled = true;
  btn.textContent = "⏳ Đang đăng nhập...";
  errEl.style.display = "none";

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Lỗi đăng nhập");

    // Lưu vào localStorage
    localStorage.setItem("qldkmh_token", data.token);
    localStorage.setItem("qldkmh_user", JSON.stringify(data.user));

    // Redirect theo role
    window.location.href = data.user.role === "admin" ? "/trangchu.html" : "/enroll.html";

  } catch (err) {
    errEl.textContent = "❌ " + err.message;
    errEl.style.display = "block";
    btn.disabled = false;
    btn.textContent = "Đăng nhập";
  }
});
