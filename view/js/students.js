const API = "http://localhost:3000";
let allStudents = [];

document.addEventListener("DOMContentLoaded", () => {
  if (!requireLogin()) return;
  // Trang này chỉ dành cho Admin
  if (!isAdmin()) {
    alert("🚫 Bạn không có quyền truy cập trang này!");
    window.location.href = "/trangchu.html";
    return;
  }
  
  renderUserBar();
  applyNavPermissions();
  loadStudents();

  // Sự kiện tìm kiếm
  document.getElementById("search-student").addEventListener("input", renderStudents);

  // Sự kiện Form Submit (Thêm/Sửa)
  document.getElementById("student-form").addEventListener("submit", handleSaveStudent);

  // Sự kiện nút Hủy
  document.getElementById("btn-cancel").addEventListener("click", resetForm);
});

async function loadStudents() {
  try {
    const res = await fetch(`${API}/students`, { headers: authHeaders() });
    const json = await res.json();
    if (res.ok) {
      allStudents = json.data;
      renderStudents();
    } else {
      throw new Error(json.message);
    }
  } catch (err) {
    document.getElementById("student-tbody").innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">Lỗi: ${err.message}</td></tr>`;
  }
}

function renderStudents() {
  const tbody = document.getElementById("student-tbody");
  const keyword = document.getElementById("search-student").value.trim().toLowerCase();

  const filtered = allStudents.filter(s => 
    s.studentId.toLowerCase().includes(keyword) || 
    s.fullName.toLowerCase().includes(keyword)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">Không tìm thấy sinh viên nào.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(s => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px; font-weight: bold;">${s.studentId}</td>
      <td style="padding: 10px;">
        ${s.fullName} <br>
        <span style="font-size: 12px; color: #666;">${s.email}</span>
      </td>
      <td style="padding: 10px;">${s.className || '-'}</td>
      <td style="padding: 10px;">${s.major || '-'}</td>
      <td style="padding: 10px; text-align: center;">
        <button onclick="editStudent('${s._id}')" style="background:#f8961e; padding:5px 10px; font-size:12px;">Sửa</button>
        <button onclick="deleteStudent('${s._id}')" style="background:#e71d36; padding:5px 10px; font-size:12px;">Xóa</button>
      </td>
    </tr>
  `).join("");
}

async function handleSaveStudent(e) {
  e.preventDefault();
  
  const id = document.getElementById("student-id-db").value;
  const data = {
    studentId: document.getElementById("stu-code").value.trim(),
    fullName: document.getElementById("stu-name").value.trim(),
    email: document.getElementById("stu-email").value.trim(),
    className: document.getElementById("stu-class").value.trim(),
    major: document.getElementById("stu-major").value.trim()
  };

  const method = id ? "PUT" : "POST";
  const url = id ? `${API}/students/${id}` : `${API}/students`;

  try {
    const res = await fetch(url, {
      method,
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Lỗi khi lưu");

    alert(id ? "✅ Đã cập nhật thành công!" : "✅ Đã thêm sinh viên mới!");
    resetForm();
    loadStudents();
  } catch (err) {
    alert("❌ Lỗi: " + err.message);
  }
}

function editStudent(id) {
  const student = allStudents.find(s => s._id === id);
  if (!student) return;

  document.getElementById("form-title").textContent = "✏️ Sửa Sinh viên";
  document.getElementById("student-id-db").value = student._id;
  document.getElementById("stu-code").value = student.studentId;
  document.getElementById("stu-name").value = student.fullName;
  document.getElementById("stu-email").value = student.email;
  document.getElementById("stu-class").value = student.className || "";
  document.getElementById("stu-major").value = student.major || "";

  document.getElementById("btn-cancel").style.display = "block";
  document.getElementById("btn-save").textContent = "Lưu thay đổi";
}

async function deleteStudent(id) {
  if (!confirm("⚠️ Bạn có chắc chắn muốn xóa sinh viên này? Toàn bộ đăng ký môn của họ có thể bị ảnh hưởng!")) return;
  
  try {
    const res = await fetch(`${API}/students/${id}`, {
      method: "DELETE",
      headers: authHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Lỗi khi xóa");

    alert("✅ Đã xóa sinh viên.");
    loadStudents();
  } catch (err) {
    alert("❌ Lỗi: " + err.message);
  }
}

function resetForm() {
  document.getElementById("student-form").reset();
  document.getElementById("student-id-db").value = "";
  document.getElementById("form-title").textContent = "➕ Thêm Sinh viên mới";
  document.getElementById("btn-cancel").style.display = "none";
  document.getElementById("btn-save").textContent = "💾 Lưu thông tin";
}
