const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  // Sinh viên
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
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
    enum: ["Đã đăng ký", "Đã hủy"],
    default: "Đã đăng ký",
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

// Đảm bảo một sinh viên không đăng ký cùng môn hai lần
// enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Tự động cập nhật updatedAt mỗi khi lưu
enrollmentSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

module.exports = Enrollment;
