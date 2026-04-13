const API = "http://localhost:3000/courses";

const params = new URLSearchParams(window.location.search);
const code = params.get("code");

let container;

// ================== FORMAT TIME ==================
function formatTime(time) {
  if (!time) return "";
  if (/^\d{2}:\d{2}$/.test(time)) return time;

  const d = new Date(time);
  if (!isNaN(d)) return d.toTimeString().slice(0, 5);

  return "";
}

// ================== CREATE BLOCK ==================
function createScheduleBlock(s = {}) {
  const div = document.createElement("div");
  div.className = "schedule-item";

  div.innerHTML = `
    <select class="sch-type">
      <option ${s.type === "Lý thuyết" ? "selected" : ""}>Lý thuyết</option>
      <option ${s.type === "Thực hành" ? "selected" : ""}>Thực hành</option>
    </select>

    <select class="sch-day">
      ${["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","Chủ nhật"]
        .map(d => `<option ${s.dayOfWeek === d ? "selected":""}>${d}</option>`)
        .join("")}
    </select>

    <input type="time" class="sch-start" value="${formatTime(s.startTime)}" required>
    <input type="time" class="sch-end" value="${formatTime(s.endTime)}" required>
    <input class="sch-location" value="${s.location || ""}" placeholder="Phòng học" required>

    <button type="button" class="remove-btn">❌</button>
  `;

  // nút xóa
  div.querySelector(".remove-btn").onclick = () => {
    div.remove();
  };

  return div;
}

// ================== LOAD ==================
async function loadCourse() {
  try {
    const res = await fetch(`${API}/${code}`);
    const data = await res.json();

    document.getElementById("code").value = data.courseCode;
    document.getElementById("name").value = data.courseName;
    document.getElementById("teacher").value = data.instructor;
    document.getElementById("type").value = data.courseType;
    document.getElementById("capacity").value = data.maxCapacity;
    document.getElementById("status").value = data.status;

    container.innerHTML = "";

    if (data.schedule && data.schedule.length > 0) {
      data.schedule.forEach(s => {
        container.appendChild(createScheduleBlock(s));
      });
    } else {
      container.appendChild(createScheduleBlock());
    }

  } catch (err) {
    alert("❌ Không load được dữ liệu");
  }
}

// ================== VALIDATE ==================
function validateSchedules() {
  let valid = true;

  document.querySelectorAll(".schedule-item").forEach(item => {
    const start = item.querySelector(".sch-start").value;
    const end = item.querySelector(".sch-end").value;

    if (!start || !end || start >= end) {
      valid = false;
    }
  });

  if (!valid) alert("⚠️ Giờ học không hợp lệ");
  return valid;
}

// ================== SUBMIT ==================
async function handleSubmit(e) {
  e.preventDefault();

  if (!validateSchedules()) return;

  const schedules = [];

  document.querySelectorAll(".schedule-item").forEach(item => {
    schedules.push({
      type: item.querySelector(".sch-type").value,
      dayOfWeek: item.querySelector(".sch-day").value,
      startTime: item.querySelector(".sch-start").value,
      endTime: item.querySelector(".sch-end").value,
      location: item.querySelector(".sch-location").value.trim()
    });
  });

  const updated = {
    courseName: document.getElementById("name").value.trim(),
    instructor: document.getElementById("teacher").value.trim(),
    courseType: document.getElementById("type").value,
    maxCapacity: Number(document.getElementById("capacity").value),
    status: document.getElementById("status").value,
    schedule: schedules
  };

  try {
    const res = await fetch(`${API}/update/${code}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    });

    const result = await res.json();

    if (!res.ok) {
      alert("❌ " + result.message);
      return;
    }

    alert("✅ Cập nhật thành công");
    window.location.href = "courses.html?reload=" + Date.now();

  } catch (err) {
    alert("❌ Không kết nối được server");
  }
}

// ================== INIT ==================
document.addEventListener("DOMContentLoaded", () => {
  container = document.getElementById("schedule-container");

  document.getElementById("addSchedule").onclick = () => {
    container.appendChild(createScheduleBlock());
  };

  document.getElementById("form").onsubmit = handleSubmit;

  loadCourse();
});