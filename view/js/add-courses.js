const API = "http://localhost:3000/courses";

const typeSelect = document.getElementById("type");
const container = document.getElementById("schedule-container");

// ================== RENDER LỊCH ==================
function renderSchedule() {
  const type = typeSelect.value;
  container.innerHTML = "";

  const createBlock = (label, defaultType) => `
    <div class="schedule-item">
      <h5>${label}</h5>

      <select class="sch-day">
        <option>Thứ 2</option>
        <option>Thứ 3</option>
        <option>Thứ 4</option>
        <option>Thứ 5</option>
        <option>Thứ 6</option>
        <option>Thứ 7</option>
        <option>Chủ nhật</option>
      </select>

      <input type="time" class="sch-start" required>
      <input type="time" class="sch-end" required>
      <input placeholder="Phòng học" class="sch-location" required>

      <input type="hidden" class="sch-type" value="${defaultType}">
    </div>
  `;

  if (type === "Lý thuyết") {
    container.innerHTML += createBlock("📘 Lý thuyết", "Lý thuyết");
  }

  if (type === "Thực hành") {
    container.innerHTML += createBlock("🧪 Thực hành", "Thực hành");
  }

  if (type === "Lý thuyết + Thực hành") {
    container.innerHTML += createBlock("📘 Lý thuyết", "Lý thuyết");
    container.innerHTML += createBlock("🧪 Thực hành", "Thực hành");
  }
}

// chạy lần đầu
renderSchedule();

// khi đổi loại môn
typeSelect.addEventListener("change", renderSchedule);

// ================== SUBMIT ==================
document.getElementById("form").onsubmit = async (e) => {
  e.preventDefault();

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

  const data = {
    courseCode: document.getElementById("code").value.trim(),
    courseName: document.getElementById("name").value.trim(),
    instructor: document.getElementById("teacher").value.trim(),
    courseType: document.getElementById("type").value,
    maxCapacity: Number(document.getElementById("capacity").value),
    schedule: schedules
  };

  try {
    const res = await fetch(`${API}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (!res.ok) {
      alert("❌ " + result.message);
      return;
    }

    alert("✅ Tạo môn học thành công");
    window.location.href = "courses.html";

  } catch (err) {
    alert("❌ Không kết nối được server");
  }
};