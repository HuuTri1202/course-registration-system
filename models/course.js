const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Lý thuyết", "Thực hành"],
    required: true,
  },
  dayOfWeek: {
    type: String,
    enum: ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","Chủ nhật"],
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
});

const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true, unique: true, uppercase: true },
  courseName: { type: String, required: true },
  instructor: { type: String, required: true },

  // FIX QUAN TRỌNG
  schedule: {
    type: [scheduleSchema],
    default: []
  },

  maxCapacity: { type: Number, required: true },
  currentEnrollment: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ["Mở", "Đóng", "Hủy"],
    default: "Mở",
  },

  courseType: String
});

module.exports = mongoose.model("Course", courseSchema);