const API = "http://localhost:3000";
let currentStudentId = null;

document.addEventListener("DOMContentLoaded", () => {
  if (!requireLogin()) return;
  renderUserBar();
  applyNavPermissions();
  initTimetable();
});

async function initTimetable() {
  const user = getUser();
  const grid = document.getElementById("timetable-grid");

  if (isAdmin()) {
    document.getElementById("student-select-area").style.display = "block";
    await loadStudentList();
    grid.innerHTML = "<p style='text-align: center; color: #999; padding: 20px;'>👆 Vui lòng chọn sinh viên để xem lịch.</p>";
  } else {
    if (!user.student) {
      grid.innerHTML = "<p style='color:red; text-align: center;'>❌ Tài khoản chưa liên kết hồ sơ sinh viên.</p>";
      return;
    }
    currentStudentId = user.student._id || user.student; 
    loadTimetable();
  }
}

async function loadStudentList() {
  try {
    const res = await fetch(`${API}/students`, { headers: authHeaders() });
    const json = await res.json();
    const select = document.getElementById("studentSelect");
    
    json.data.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s._id;
      opt.textContent = `${s.studentId} - ${s.fullName}`;
      select.appendChild(opt);
    });

    select.onchange = () => {
      currentStudentId = select.value;
      if (!currentStudentId) {
        document.getElementById("timetable-grid").innerHTML = "<p style='text-align: center; color: #999; padding: 20px;'>👆 Vui lòng chọn sinh viên để xem lịch.</p>";
        return;
      }
      loadTimetable();
    };
  } catch (err) {
    console.error("Lỗi tải danh sách sinh viên:", err);
  }
}

async function loadTimetable() {
  const grid = document.getElementById("timetable-grid");
  grid.innerHTML = "<p style='text-align: center; color: #999; padding: 20px;'>⏳ Đang tải dữ liệu...</p>";

  try {
    const res = await fetch(`${API}/enrollments?studentId=${currentStudentId}`, {
      headers: authHeaders(),
    });
    const json = await res.json();
    renderTimetable(json.data);
  } catch (err) {
    grid.innerHTML = `<p style="color:red; text-align: center;">❌ Lỗi: ${err.message}</p>`;
  }
}

function renderTimetable(enrollments) {
  const grid = document.getElementById("timetable-grid");
  
  if (!enrollments || enrollments.length === 0) {
    grid.innerHTML = "<p style='text-align: center; color: #999; padding: 20px;'>Bạn chưa có lịch học nào.</p>";
    return;
  }

  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
  const colors = ["#4361ee", "#f72585", "#7209b7", "#3a0ca3", "#f8961e", "#4cc9f0", "#2ec4b6", "#e71d36"];

  let html = "";
  html += `<div class="tt-header">⏰</div>`;
  days.forEach(day => {
    html += `<div class="tt-header">${day}</div>`;
  });
  
  for (let i = 7; i <= 17; i++) {
    html += `<div class="tt-time-label" style="grid-column: 1; grid-row: ${i - 5};">${i < 10 ? '0'+i : i}:00</div>`;
  }

  const colsData = { "Thứ 2": "", "Thứ 3": "", "Thứ 4": "", "Thứ 5": "", "Thứ 6": "", "Thứ 7": "", "Chủ nhật": "" };

  let colorIdx = 0;
  let hasValidSchedule = false;

  enrollments.forEach(enr => {
    if (enr.status === "Đã hủy" || !enr.course || !enr.course.schedule) return;
    
    const bgColor = colors[colorIdx % colors.length];
    colorIdx++;

    enr.course.schedule.forEach(sch => {
      if (!colsData.hasOwnProperty(sch.dayOfWeek)) return;
      hasValidSchedule = true;

      const parseTime = (timeStr) => {
        const [h, m] = timeStr.split(":").map(Number);
        return (h - 7) * 60 + m; 
      };

      const startPx = parseTime(sch.startTime);
      const endPx = parseTime(sch.endTime);
      const heightPx = endPx - startPx;

      colsData[sch.dayOfWeek] += `
        <div class="tt-course-block" style="top: ${startPx}px; height: ${heightPx}px; background: ${bgColor};">
          <div class="tt-course-title">${enr.course.courseCode} - ${enr.course.courseName}</div>
          <div>${sch.startTime} - ${sch.endTime}</div>
          <div>📍 ${sch.location}</div>
        </div>
      `;
    });
  });

  if (!hasValidSchedule) {
    grid.innerHTML = "<p style='text-align: center; color: #999; padding: 20px;'>Các môn bạn đăng ký hiện chưa có lịch cụ thể.</p>";
    return;
  }

  days.forEach((day, index) => {
    html += `
      <div class="tt-col" style="grid-column: ${index + 2}; grid-row: 2 / span 11;">
        ${colsData[day]}
      </div>
    `;
  });

  grid.innerHTML = html;
}
