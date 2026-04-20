const API = "http://localhost:3000";
let currentStudent = null;
let allAvailableCourses = [];
let currentEnrolledCourses = [];

// ─── Auth Guard & Init ───────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  if (!requireLogin()) return;
  renderUserBar();
  applyNavPermissions();
  initPage();

  // filter listeners
  document
    .getElementById("searchCourse")
    ?.addEventListener("input", renderAvailableCourses);
  document
    .getElementById("filterDay")
    ?.addEventListener("change", renderAvailableCourses);
  document
    .getElementById("filterStatus")
    ?.addEventListener("change", renderAvailableCourses);
  document
    .getElementById("filterConflict")
    ?.addEventListener("change", renderAvailableCourses);
});

async function initPage() {
  const user = getUser();

  if (isAdmin()) {
    await renderAdminStudentDropdown();
  } else {
    const studentData = user.student;
    if (!studentData) {
      document.getElementById("student-info-area").innerHTML =
        `<p style="color:red">❌ Tài khoản chưa liên kết sinh viên</p>`;
      return;
    }
    currentStudent = studentData;
    renderStudentInfo(studentData);
    loadAvailableCourses();
    loadEnrolledCourses();
  }
}

// ─── Admin chọn sinh viên ─────────────────────────────
async function renderAdminStudentDropdown() {
  const area = document.getElementById("student-info-area");
  area.innerHTML = `
    <label><strong>👨‍🎓 Chọn sinh viên:</strong></label>
    <select id="studentSelect">
      <option value="">-- Chọn sinh viên --</option>
    </select>
    <span id="studentDetail"></span>
  `;

  try {
    const res = await fetch(`${API}/students`, { headers: authHeaders() });
    const json = await res.json();
    const students = json.data;

    const select = document.getElementById("studentSelect");

    students.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = JSON.stringify(s);
      opt.textContent = `${s.studentId} - ${s.fullName}`;
      select.appendChild(opt);
    });

    select.onchange = () => {
      if (!select.value) return;

      currentStudent = JSON.parse(select.value);
      document.getElementById("studentDetail").innerHTML =
        `${currentStudent.fullName}`;

      loadAvailableCourses();
      loadEnrolledCourses();
    };
  } catch (err) {
    area.innerHTML += `<p style="color:red">❌ Lỗi load sinh viên</p>`;
  }
}

// ─── Student info ─────────────────────────────────────
function renderStudentInfo(s) {
  document.getElementById("student-info-area").innerHTML = `
    <p>
      <strong>${s.fullName}</strong> (${s.studentId})<br>
      ${s.email}
    </p>
  `;
}

// ─── Load courses ─────────────────────────────────────
async function loadAvailableCourses() {
  if (!currentStudent) return;

  try {
    const [cRes, eRes] = await Promise.all([
      fetch(`${API}/courses`),
      fetch(`${API}/enrollments?studentId=${currentStudent._id}`, {
        headers: authHeaders(),
      }),
    ]);

    const cJson = await cRes.json();
    const eJson = await eRes.json();

    const allCourses = cJson.data || [];
    const enrollments = eJson.data || [];

    const enrolledIds = enrollments.map((e) => e.course?._id);

    currentEnrolledCourses = enrollments
      .filter((e) => e.status !== "Đã hủy")
      .map((e) => e.course)
      .filter(Boolean);

    allAvailableCourses = allCourses.filter(
      (c) => !enrolledIds.includes(c._id) && c.status === "Mở",
    );

    renderAvailableCourses();
  } catch (err) {
    console.error(err);
  }
}

// ─── Render available ─────────────────────────────────
function renderAvailableCourses() {
  const container = document.getElementById("courseList");

  if (!container) return;

  if (!allAvailableCourses.length) {
    container.innerHTML = "<p>Không có môn nào</p>";
    return;
  }

  container.innerHTML = allAvailableCourses
    .map(
      (c) => `
    <div class="course-item">
      <strong>${c.courseCode} - ${c.courseName}</strong><br>
      Tín chỉ: ${c.credits}<br>
      Trạng thái: <span class="status-badge">${c.status || "Không rõ"}</span>
      <br>
      <button class="btn-reg" data-id="${c._id}">Đăng ký</button>
    </div>
  `,
    )
    .join("");

  document.querySelectorAll(".btn-reg").forEach((btn) => {
    btn.onclick = () => enrollCourse(btn.dataset.id);
  });
}

// ─── Enroll ───────────────────────────────────────────
async function enrollCourse(courseId) {
  try {
    const res = await fetch(`${API}/enrollments`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        student: currentStudent._id,
        course: courseId,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    alert("✅ Đăng ký thành công");
    loadAvailableCourses();
    loadEnrolledCourses();
  } catch (err) {
    alert("❌ " + err.message);
  }
}

// ─── Load enrolled ────────────────────────────────────
async function loadEnrolledCourses() {
  if (!currentStudent) return;

  try {
    const res = await fetch(
      `${API}/enrollments?studentId=${currentStudent._id}`,
      {
        headers: authHeaders(),
      },
    );

    const json = await res.json();
    renderEnrolledCourses(json.data || []);
    calculateTotalCredits(json.data || []);
  } catch (err) {
    console.error(err);
  }
}

// ─── FIX CHÍNH Ở ĐÂY ─────────────────────────────────
function renderEnrolledCourses(enrollments) {
  const container = document.getElementById("enrolledCourses");

  if (!enrollments.length) {
    container.innerHTML = "<p>Chưa đăng ký</p>";
    return;
  }

  container.innerHTML = enrollments
    .map((e) => {
      const course = e.course || {};
      const status = e.status || "Không rõ";

      const getStatusClass = (status) => {
        switch (status) {
          case "Đã đăng ký":
            return "status-active";
          case "Đã hủy":
            return "status-cancel";
          case "Mở":
            return "status-open";
          case "Đóng":
            return "status-closed";
          default:
            return "status-default";
        }
      };

      return `
      <div class="course-item">
        <strong>${course.courseCode || "??"} - ${course.courseName || "??"}</strong><br>
        Tín chỉ: ${course.credits || 0}<br>
        
        <!-- FIX: hiển thị status rõ -->
        Trạng thái: 
        <span class="status-badge">${status}</span>
        
        <br>
        <button class="btn-cancel" data-id="${e._id}">
          Hủy
        </button>
      </div>
    `;
    })
    .join("");

  document.querySelectorAll(".btn-cancel").forEach((btn) => {
    btn.onclick = () => cancelEnrollment(btn.dataset.id);
  });
}

// ─── Cancel ───────────────────────────────────────────
async function cancelEnrollment(id) {
  try {
    const res = await fetch(`${API}/enrollments/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message);

    alert("Đã hủy");
    loadAvailableCourses();
    loadEnrolledCourses();
  } catch (err) {
    alert(err.message);
  }
}

// ─── Credits ──────────────────────────────────────────
function calculateTotalCredits(enrollments) {
  const total = enrollments.reduce((sum, e) => {
    if (e.status === "Đã hủy") return sum;
    return sum + (e.course?.credits || 0);
  }, 0);

  document.getElementById("totalCredits").innerHTML =
    `Tổng tín chỉ: <strong>${total}</strong>`;
}
