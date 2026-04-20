// ─── Auth Guard ───────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  if (!requireLogin()) return;
  renderUserBar();
  applyNavPermissions();
  loadCourses();
});

const API = "http://localhost:3000/courses";

// ─── Helper: map status → class CSS ───────────────────────
function getStatusClass(status) {
  const map = {
    Mở: "mo",
    Đóng: "dong",
    Hủy: "huy",
  };
  return map[status] || "mo";
}

// ─── LOAD COURSES ─────────────────────────────────────────
async function loadCourses() {
  const container = document.getElementById("courseList");
  container.innerHTML = "<p>⏳ Đang tải...</p>";

  try {
    const res = await fetch(`${API}`);
    const json = await res.json();
    const courses = json.data;

    container.innerHTML = "";

    if (!courses || courses.length === 0) {
      container.innerHTML = "<p>Không có môn học nào.</p>";
      return;
    }

    const admin = isAdmin();

    courses.forEach((course) => {
      console.log("STATUS:", course.status); // debug nếu cần

      const div = document.createElement("div");
      div.className = "course";

      let scheduleHTML = "<i>Chưa có lịch</i>";
      if (course.schedule?.length > 0) {
        scheduleHTML = course.schedule
          .map(
            (s) => `
          <li>${s.type} | ${s.dayOfWeek} | ${formatTime(s.startTime)} - ${formatTime(s.endTime)} | ${s.location}</li>
        `,
          )
          .join("");
      }

      // Admin buttons
      const adminBtns = admin
        ? `
        <button onclick="deleteCourse('${course.courseCode}')" style="background:#dc3545">🗑 Xóa</button>
        <button onclick="goEdit('${course.courseCode}')">✏️ Sửa</button>
      `
        : "";

      const statusText = course.status || "Mở";
      const statusClass = getStatusClass(statusText);

      div.innerHTML = `
        <h3>${course.courseName}</h3>
        <p><b>Mã:</b> ${course.courseCode}</p>
        <p><b>Giảng viên:</b> ${course.instructor}</p>
        <p><b>Loại:</b> ${course.courseType || "—"}</p>
        <p><b>Tín chỉ:</b> ${course.credits || 0}</p>
        <p><b>Sĩ số:</b> ${course.currentEnrollment || 0}/${course.maxCapacity}</p>

        <p><b>Trạng thái:</b> 
          <span class="status-badge status-${statusClass}">
            ${statusText}
          </span>
        </p>

        <ul>${scheduleHTML}</ul>
        ${adminBtns}
      `;

      container.appendChild(div);
    });
  } catch (err) {
    container.innerHTML = `<p style="color:red">❌ Lỗi tải dữ liệu: ${err.message}</p>`;
  }
}

// ─── FORMAT TIME ──────────────────────────────────────────
function formatTime(time) {
  if (!time) return "";
  if (/^\d{2}:\d{2}$/.test(time)) return time;

  const d = new Date(time);
  if (!isNaN(d)) return d.toTimeString().slice(0, 5);

  return time;
}

// ─── DELETE ───────────────────────────────────────────────
async function deleteCourse(code) {
  if (!confirm(`Bạn chắc chắn muốn xóa môn ${code}?`)) return;

  try {
    const res = await fetch(`${API}/delete/${code}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message);

    alert("✅ Đã xóa môn học!");
    loadCourses();
  } catch (err) {
    alert("❌ " + err.message);
  }
}

// ─── GO EDIT ──────────────────────────────────────────────
function goEdit(code) {
  window.location.href = `edit-course.html?code=${code}`;
}
