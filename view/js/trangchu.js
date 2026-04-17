const API = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  if (!requireLogin()) return;
  renderUserBar();
  applyNavPermissions();
  
  const user = getUser();
  document.getElementById("welcome-msg").textContent = `Chào mừng trở lại, ${user.username}! 👋`;

  if (isAdmin()) {
    document.getElementById("admin-dashboard").style.display = "block";
    loadAdminStats();
  } else {
    document.getElementById("student-dashboard").style.display = "block";
    loadStudentProfile(user);
  }
});

async function loadAdminStats() {
  try {
    const [cRes, sRes, eRes] = await Promise.all([
      fetch(`${API}/courses`),
      fetch(`${API}/students`, { headers: authHeaders() }),
      fetch(`${API}/enrollments`, { headers: authHeaders() })
    ]);

    const cJson = await cRes.json();
    const sJson = await sRes.json();
    const eJson = await eRes.json();

    document.getElementById("stat-courses").textContent = cJson.data?.length || 0;
    document.getElementById("stat-students").textContent = sJson.data?.length || 0;
    document.getElementById("stat-enrollments").textContent = eJson.data?.length || 0;
  } catch (err) {
    console.error("Lỗi lấy thống kê Admin:", err);
  }
}

function loadStudentProfile(user) {
  const profileDiv = document.getElementById("student-profile-info");
  if (!user.student) {
    profileDiv.innerHTML = "<span style='color:red;'>❌ Tài khoản chưa được liên kết với hồ sơ sinh viên. Vui lòng liên hệ Admin.</span>";
    return;
  }
  
  const s = user.student;
  profileDiv.innerHTML = `
    <strong>Họ và tên:</strong> ${s.fullName} <br>
    <strong>Mã sinh viên:</strong> ${s.studentId} <br>
    <strong>Lớp:</strong> ${s.className || 'Chưa cập nhật'} <br>
    <strong>Chuyên ngành:</strong> ${s.major || 'Chưa cập nhật'} <br>
    <strong>Email:</strong> ${s.email}
  `;
}
