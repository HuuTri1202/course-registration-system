const API = "http://localhost:3000/courses";

// ─── Auth Guard ───────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  if (!requireAdmin()) return;
  renderUserBar();
  applyNavPermissions();
  renderSchedule(); // render lịch mặc định ban đầu
});

const typeSelect = document.getElementById("type");
const container  = document.getElementById("schedule-container");

// ─── Render block lịch học ────────────────────────────────
function renderSchedule() {
  const type = typeSelect.value;
  container.innerHTML = "";

  const createBlock = (label, defaultType) => `
    <div class="schedule-item">
      <h5>${label}</h5>
      <select class="sch-day">
        ${["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","Chủ nhật"]
          .map(d => `<option>${d}</option>`).join("")}
      </select>
      <input type="time" class="sch-start" required>
      <input type="time" class="sch-end" required>
      <input placeholder="Phòng học" class="sch-location" required>
      <input type="hidden" class="sch-type" value="${defaultType}">
    </div>
  `;

  if (type === "Lý thuyết") container.innerHTML += createBlock("📘 Lý thuyết", "Lý thuyết");
  if (type === "Thực hành") container.innerHTML += createBlock("🧪 Thực hành", "Thực hành");
  if (type === "Lý thuyết + Thực hành") {
    container.innerHTML += createBlock("📘 Lý thuyết", "Lý thuyết");
    container.innerHTML += createBlock("🧪 Thực hành", "Thực hành");
  }
}

typeSelect.addEventListener("change", renderSchedule);

// ─── Submit tạo môn học ───────────────────────────────────
document.getElementById("form").onsubmit = async (e) => {
  e.preventDefault();

  const schedules = [];
  document.querySelectorAll(".schedule-item").forEach(item => {
    schedules.push({
      type:      item.querySelector(".sch-type").value,
      dayOfWeek: item.querySelector(".sch-day").value,
      startTime: item.querySelector(".sch-start").value,
      endTime:   item.querySelector(".sch-end").value,
      location:  item.querySelector(".sch-location").value.trim(),
    });
  });

  const data = {
    courseCode:  document.getElementById("code").value.trim(),
    courseName:  document.getElementById("name").value.trim(),
    instructor:  document.getElementById("teacher").value.trim(),
    credits:     Number(document.getElementById("credits").value),
    courseType:  document.getElementById("type").value,
    maxCapacity: Number(document.getElementById("capacity").value),
    schedule: schedules,
  };

  try {
    const res = await fetch(`${API}/create`, {
      method: "POST",
      headers: authHeaders(),       // ✅ gửi kèm JWT
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message);

    alert("✅ Tạo môn học thành công!");
    window.location.href = "courses.html";
  } catch (err) {
    alert("❌ " + err.message);
  }
};