const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  // Sinh viên
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Sinh viên là bắt buộc"],
  },

  // Môn học
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: [true, "Môn học là bắt buộc"],
  },

  // Ngày đăng kí
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },

  // Trạng thái
  status: {
    type: String,
    enum: ["Đã đăng kí", "Hủy", "Hoàn thành", "Chờ duyệt"],
    default: "Chờ duyệt",
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

module.exports = Enrollment;
