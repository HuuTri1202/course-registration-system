const API = "http://localhost:3000/auth";

// Toggle hiện/ẩn mật khẩu
function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  btn.textContent = isHidden ? "🙈" : "👁";
}

// Ẩn/hiện field theo role
document.getElementById("role").addEventListener("change", function () {
  const isStudent = this.value === "student";
  document.getElementById("student-id-group").style.display = isStudent ? "block" : "none";
  document.getElementById("admin-secret-group").style.display = isStudent ? "none" : "block";
});

// Xử lý đăng ký
document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const role        = document.getElementById("role").value;
  const username    = document.getElementById("reg-username").value.trim();
  const password    = document.getElementById("reg-password").value;
  const studentId   = document.getElementById("studentId").value.trim();
  const adminSecret = document.getElementById("adminSecret").value;
  const btn         = document.getElementById("btn-register");
  const errEl       = document.getElementById("auth-error");
  const successEl   = document.getElementById("auth-success");

  btn.disabled = true;
  btn.textContent = "⏳ Đang xử lý...";
  errEl.style.display = "none";
  successEl.style.display = "none";

  const body = { username, password, role };
  if (role === "student") body.studentId = studentId;
  if (role === "admin")   body.adminSecret = adminSecret;

  try {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    localStorage.setItem("qldkmh_token", data.token);
    localStorage.setItem("qldkmh_user", JSON.stringify(data.user));

    successEl.textContent = "✅ Đăng ký thành công! Đang chuyển trang...";
    successEl.style.display = "block";

    setTimeout(() => {
      window.location.href = data.user.role === "admin" ? "/trangchu.html" : "/enroll.html";
    }, 1500);

  } catch (err) {
    errEl.textContent = "❌ " + err.message;
    errEl.style.display = "block";
    btn.disabled = false;
    btn.textContent = "Đăng ký";
  }
});
