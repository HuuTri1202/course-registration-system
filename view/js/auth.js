// ========================================================
// auth.js — Thư viện xác thực dùng chung cho mọi trang
// ========================================================

const AUTH_KEY  = "qldkmh_token";
const USER_KEY  = "qldkmh_user";

// ─── Lấy dữ liệu từ localStorage ─────────────────────────
const getToken = () => localStorage.getItem(AUTH_KEY);
const getUser  = () => JSON.parse(localStorage.getItem(USER_KEY) || "null");

// ─── Kiểm tra trạng thái ─────────────────────────────────
const isLoggedIn = () => !!getToken();
const isAdmin    = () => getUser()?.role === "admin";
const isStudent  = () => getUser()?.role === "student";

// ─── Header gửi kèm token ─────────────────────────────────
const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getToken()}`,
});

// ─── Lưu sau khi login thành công ────────────────────────
const saveAuth = (token, user) => {
  localStorage.setItem(AUTH_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// ─── Đăng xuất ────────────────────────────────────────────
const logout = () => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = "/login.html";
};

// ─── Redirect nếu chưa đăng nhập ─────────────────────────
const requireLogin = () => {
  if (!isLoggedIn()) {
    window.location.href = "/login.html";
    return false;
  }
  return true;
};

// ─── Redirect nếu không phải admin ───────────────────────
const requireAdmin = () => {
  if (!requireLogin()) return false;
  if (!isAdmin()) {
    alert("⛔ Bạn không có quyền truy cập trang này.");
    window.location.href = "/enroll.html";
    return false;
  }
  return true;
};

// ─── Render thanh thông tin user + nút logout ─────────────
const renderUserBar = () => {
  const user = getUser();
  if (!user) return;

  // Tạo thanh thông tin user
  const bar = document.createElement("div");
  bar.id = "user-bar";
  bar.innerHTML = `
    <span id="user-bar-info">
      ${user.role === "admin" ? "👑" : "🎓"} 
      <strong>${user.username}</strong>
      <span class="role-badge role-${user.role}">${user.role === "admin" ? "Admin" : "Sinh viên"}</span>
      ${user.student ? `· ${user.student.fullName || ""}` : ""}
    </span>
    <button id="btn-logout" onclick="logout()">🚪 Đăng xuất</button>
  `;
  document.body.insertBefore(bar, document.body.firstChild);
};

// ─── Ẩn/hiện nav items theo quyền ────────────────────────
const applyNavPermissions = () => {
  const user = getUser();
  if (!user) return;

  // Ẩn các item admin-only với sinh viên
  if (!isAdmin()) {
    document.querySelectorAll(".admin-only").forEach(el => (el.style.display = "none"));
  }

  // Ẩn các item student-only với admin
  if (!isStudent()) {
    document.querySelectorAll(".student-only").forEach(el => (el.style.display = "none"));
  }
};

// Khởi tạo sẽ được gọi từ từng trang cụ thể (vd: register.js, courses.js) thay vì gọi tự động ở đây.
