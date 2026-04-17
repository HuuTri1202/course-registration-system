const API = "http://localhost:3000";
let currentStudent = null;
let allAvailableCourses = []; // ✅ Lưu trữ danh sách môn để lọc trên frontend
let currentEnrolledCourses = []; // ✅ Lưu lịch học của các môn đã đăng ký để kiểm tra trùng lịch

// ─── Auth Guard & Khởi tạo ───────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  if (!requireLogin()) return;
  renderUserBar();
  applyNavPermissions();
  initPage();
});

async function initPage() {
  const user = getUser();

  if (isAdmin()) {
    // Admin: hiển thị dropdown chọn sinh viên
    await renderAdminStudentDropdown();
  } else {
    // Sinh viên: tự động load thông tin từ token
    const studentData = user.student;
    if (!studentData) {
      document.getElementById("student-info-area").innerHTML =
        `<p style="color:red">❌ Tài khoản của bạn chưa được liên kết với hồ sơ sinh viên. Liên hệ Admin.</p>`;
      return;
    }
    currentStudent = studentData;
    renderStudentInfo(studentData);
    loadAvailableCourses();
    loadEnrolledCourses();
  }
}

// ─── Admin: dropdown chọn sinh viên ──────────────────────
async function renderAdminStudentDropdown() {
  const area = document.getElementById("student-info-area");
  area.innerHTML = `
    <label><strong>👨‍🎓 Chọn sinh viên:</strong></label>
    <select id="studentSelect" style="padding:8px; width:300px; margin-left:10px;">
      <option value="">-- Chọn sinh viên --</option>
    </select>
    <span id="studentDetail" style="margin-left:16px; color:#555;"></span>
  `;

  try {
    const res = await fetch(`${API}/students`, { headers: authHeaders() });
    const json = await res.json();
    const students = json.data;

    const select = document.getElementById("studentSelect");
    students.forEach(s => {
      const opt = document.createElement("option");
      opt.value = JSON.stringify({ _id: s._id, studentId: s.studentId, fullName: s.fullName, email: s.email, major: s.major });
      opt.textContent = `${s.studentId} - ${s.fullName} (${s.major})`;
      select.appendChild(opt);
    });

    select.onchange = () => {
      if (!select.value) {
        currentStudent = null;
        document.getElementById("courseList").innerHTML = "";
        document.getElementById("enrolledCourses").innerHTML = "";
        document.getElementById("totalCredits").innerHTML = "";
        return;
      }
      currentStudent = JSON.parse(select.value);
      document.getElementById("studentDetail").innerHTML =
        `<strong>${currentStudent.fullName}</strong> · ${currentStudent.email}`;
      loadAvailableCourses();
      loadEnrolledCourses();
    };
  } catch (err) {
    area.innerHTML += `<p style="color:red">❌ Không tải được danh sách sinh viên</p>`;
  }
}

// ─── Student: hiển thị thông tin cố định ─────────────────
function renderStudentInfo(s) {
  document.getElementById("student-info-area").innerHTML = `
    <p>
      Đang đăng ký cho: <strong>${s.fullName}</strong> (${s.studentId})<br>
      Email: ${s.email} | Ngành: ${s.major}
    </p>
  `;
}

// ─── Load môn có thể đăng ký ─────────────────────────────
async function loadAvailableCourses() {
  if (!currentStudent) return;
  try {
    const [cRes, eRes] = await Promise.all([
      fetch(`${API}/courses`),
      fetch(`${API}/enrollments?studentId=${currentStudent._id}`, { headers: authHeaders() }),
    ]);

    const cJson = await cRes.json();
    const eJson = await eRes.json();

    const allCourses  = cJson.data;
    const enrollments = eJson.data;
    const enrolledIds = enrollments.map(e => e.course._id);
    
    // Lưu các môn sinh viên đang học để lọc trùng lịch
    currentEnrolledCourses = enrollments.filter(e => e.status !== "Đã hủy").map(e => e.course);
    
    allAvailableCourses = allCourses.filter(c => !enrolledIds.includes(c._id) && c.status === "Mở");

    renderAvailableCourses();
  } catch (err) {
    console.error("Lỗi loadAvailableCourses:", err);
  }
}

// ─── Lọc & Render môn học ────────────────────────────────
function renderAvailableCourses() {
  const container = document.getElementById("courseList");
  
  // Lấy giá trị bộ lọc
  const keyword = (document.getElementById("searchCourse")?.value || "").toLowerCase();
  const dayFilter = document.getElementById("filterDay")?.value || "";
  const statusFilter = document.getElementById("filterStatus")?.value || "";

  // Áp dụng bộ lọc
  const filteredCourses = allAvailableCourses.filter(c => {
    // 1. Lọc theo từ khóa (tên hoặc mã)
    const matchKeyword = c.courseCode.toLowerCase().includes(keyword) || 
                         c.courseName.toLowerCase().includes(keyword);
    
    // 2. Lọc theo ngày
    let matchDay = true;
    if (dayFilter) {
      matchDay = c.schedule?.some(s => s.dayOfWeek === dayFilter);
    }

    // 3. Lọc theo trạng thái chỗ trống
    let matchStatus = true;
    if (statusFilter === "available") {
      matchStatus = c.currentEnrollment < c.maxCapacity;
    }

    // 4. Lọc môn trùng lịch
    const filterConflict = document.getElementById("filterConflict")?.checked;
    let matchConflict = true;
    if (filterConflict && c.schedule) {
      for (const newSch of c.schedule) {
        for (const enrolledCourse of currentEnrolledCourses) {
          const existSchedules = enrolledCourse?.schedule || [];
          for (const existSch of existSchedules) {
            if (newSch.dayOfWeek === existSch.dayOfWeek) {
              if (newSch.startTime < existSch.endTime && newSch.endTime > existSch.startTime) {
                matchConflict = false; // Bị trùng lịch
              }
            }
          }
        }
      }
    }

    return matchKeyword && matchDay && matchStatus && matchConflict;
  });

  if (!filteredCourses.length) {
    container.innerHTML = "<p>🎉 Không tìm thấy môn học nào phù hợp.</p>";
    return;
  }

  const grouped = filteredCourses.reduce((acc, c) => {
    const type = c.courseType || "Khác";
    if (!acc[type]) acc[type] = [];
    acc[type].push(c);
    return acc;
  }, {});

  container.innerHTML = Object.keys(grouped).map(type => `
    <h3>${type}</h3>
    ${grouped[type].map(c => `
      <div class="course-item">
        <strong>${c.courseCode} - ${c.courseName}</strong><br>
        Tín chỉ: ${c.credits} | GV: ${c.instructor}<br>
        Lịch: ${c.schedule?.map(s => `${s.dayOfWeek} ${s.startTime}-${s.endTime} (${s.location})`).join(", ") || "Chưa có"}<br>
        Chỗ còn: <strong>${c.maxCapacity - c.currentEnrollment}/${c.maxCapacity}</strong>
        <br><button class="btn-reg" data-id="${c._id}">➕ Đăng ký</button>
      </div>
    `).join("")}
  `).join("");

  document.querySelectorAll(".btn-reg").forEach(btn => {
    btn.addEventListener("click", () => enrollCourse(btn.dataset.id));
  });
}

// Lắng nghe sự kiện thay đổi bộ lọc
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchCourse")?.addEventListener("input", renderAvailableCourses);
  document.getElementById("filterDay")?.addEventListener("change", renderAvailableCourses);
  document.getElementById("filterStatus")?.addEventListener("change", renderAvailableCourses);
  document.getElementById("filterConflict")?.addEventListener("change", renderAvailableCourses);
});

async function enrollCourse(courseId) {
  try {
    const res = await fetch(`${API}/enrollments`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ student: currentStudent._id, course: courseId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    alert("✅ Đăng ký thành công!");
    loadAvailableCourses();
    loadEnrolledCourses();
  } catch (err) {
    alert("❌ " + err.message);
  }
}

// ─── Load môn đã đăng ký ─────────────────────────────────
async function loadEnrolledCourses() {
  if (!currentStudent) return;
  try {
    const res = await fetch(`${API}/enrollments?studentId=${currentStudent._id}`, {
      headers: authHeaders(),
    });
    const json = await res.json();
    const enrollments = json.data;
    renderEnrolledCourses(enrollments);
    calculateTotalCredits(enrollments);
  } catch (err) {
    console.error("Lỗi loadEnrolledCourses:", err);
  }
}

function renderEnrolledCourses(enrollments) {
  const container = document.getElementById("enrolledCourses");
  if (!enrollments?.length) {
    container.innerHTML = "<p>Chưa đăng ký môn nào.</p>";
    return;
  }
  container.innerHTML = enrollments.map(e => `
    <div class="course-item">
      <strong>${e.course.courseCode} - ${e.course.courseName}</strong><br>
      Tín chỉ: ${e.course.credits} | Lịch: ${e.course.schedule?.map(s => `${s.dayOfWeek} ${s.startTime}-${s.endTime}`).join(", ") || "Chưa có"}<br>
      Trạng thái: <span class="status-badge">${e.status}</span>
      <br><button class="btn-reg btn-cancel" data-enroll="${e._id}">❌ Hủy đăng ký</button>
    </div>
  `).join("");

  document.querySelectorAll(".btn-cancel").forEach(btn => {
    btn.addEventListener("click", () => {
      if (confirm("Bạn có chắc muốn hủy đăng ký môn này?")) cancelEnrollment(btn.dataset.enroll);
    });
  });
}

async function cancelEnrollment(enrollId) {
  try {
    const res = await fetch(`${API}/enrollments/${enrollId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    alert("🗑️ Đã hủy đăng ký");
    loadAvailableCourses();
    loadEnrolledCourses();
  } catch (err) {
    alert("❌ " + err.message);
  }
}

function calculateTotalCredits(enrollments) {
  const total = (enrollments || []).reduce((sum, e) => {
    if (e.status === "Đã hủy") return sum;
    return sum + (e.course?.credits || 0);
  }, 0);
  document.getElementById("totalCredits").innerHTML =
    `📊 Tổng số tín chỉ đã đăng ký: <strong>${total}</strong>`;
}
