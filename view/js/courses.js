const API = "http://localhost:3000/courses";

async function loadCourses() {
  try {
    //  FIX endpoint
    const res = await fetch(`${API}/all?ts=` + Date.now());
    const courses = await res.json();

    const container = document.getElementById("courseList");
    container.innerHTML = "";

    if (!courses || courses.length === 0) {
      container.innerHTML = "<p>Không có môn học nào</p>";
      return;
    }

    courses.forEach(course => {
      const div = document.createElement("div");
      div.className = "course";

      let scheduleHTML = "<i>Chưa có lịch</i>";

      if (course.schedule?.length > 0) {
        scheduleHTML = course.schedule.map(s => `
          <li>
            ${s.type} |
            ${s.dayOfWeek} |
            ${formatTime(s.startTime)} - ${formatTime(s.endTime)} |
            ${s.location}
          </li>
        `).join("");
      }

      div.innerHTML = `
        <h3>${course.courseName}</h3>

        <p><b>Mã:</b> ${course.courseCode}</p>
        <p><b>Giảng viên:</b> ${course.instructor}</p>
        <p><b>Loại:</b> ${course.courseType}</p>
        <p><b>Sĩ số:</b> ${course.currentEnrollment || 0}/${course.maxCapacity}</p>
        <p><b>Trạng thái:</b> ${course.status}</p>

        <ul>${scheduleHTML}</ul>

        <button onclick="deleteCourse('${course.courseCode}')">🗑 Xóa</button>
        <button onclick="goEdit('${course.courseCode}')">✏️ Sửa</button>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error("Lỗi loadCourses:", err);
    alert("Không load được dữ liệu!");
  }
}

// format giờ
function formatTime(time) {
  if (!time) return "";
  if (/^\d{2}:\d{2}$/.test(time)) return time;

  const d = new Date(time);
  if (!isNaN(d)) return d.toTimeString().slice(0, 5);

  return time;
}

// DELETE
async function deleteCourse(code) {
  if (!confirm("Bạn chắc chắn muốn xóa?")) return;

  try {
    // FIX endpoint
    const res = await fetch(`${API}/delete/${code}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Delete failed");

    alert("Đã xóa!");
    loadCourses();

  } catch (err) {
    console.error(err);
    alert("Xóa thất bại!");
  }
}

// chuyển sang edit
function goEdit(code) {
  window.location.href = `edit-course.html?code=${code}`;
}

// load lần đầu
document.addEventListener("DOMContentLoaded", loadCourses);