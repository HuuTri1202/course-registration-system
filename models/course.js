const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  // Mã môn học
  courseCode: {
    type: String,
    required: [true, "Mã môn học là bắt buộc"],
    unique: true,
    trim: true,
    uppercase: true,
  },

  // Tên môn
  courseName: {
    type: String,
    required: [true, "Tên môn học là bắt buộc"],
    trim: true,
  },

  // Giảng viên
  instructor: {
    type: String,
    required: [true, "Giảng viên là bắt buộc"],
    trim: true,
  },

  // Lịch học
  schedule: {
    dayOfWeek: {
      type: String,
      enum: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"],
      required: true,
    },
    startTime: {
      type: String,
      required: [true, "Giờ bắt đầu là bắt buộc"],
      match: [/^\d{2}:\d{2}$/, "Định dạng giờ không hợp lệ (HH:mm)"],
    },
    endTime: {
      type: String,
      required: [true, "Giờ kết thúc là bắt buộc"],
      match: [/^\d{2}:\d{2}$/, "Định dạng giờ không hợp lệ (HH:mm)"],
    },
    location: {
      type: String,
      required: [true, "Địa điểm học là bắt buộc"],
      trim: true,
    },
  },

  // Sức chứa
  maxCapacity: {
    type: Number,
    required: [true, "Sức chứa tối đa là bắt buộc"],
    min: [1, "Tối thiểu 1 học viên"],
  },
  currentEnrollment: {
    type: Number,
    default: 0,
    min: 0,
  },

  // Trạng thái
  status: {
    type: String,
    enum: ["Mở", "Đóng", "Hủy"],
    default: "Mở",
  },

  // Loại môn
  courseType: {
    type: String,
    enum: ["Lý thuyết", "Thực hành", "Lý thuyết + Thực hành"],
    default: "Lý thuyết",
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

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
