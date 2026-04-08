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

// Middleware: Cập nhật ngày chỉnh sửa
courseSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Phương thức: Kiểm tra còn chỗ trống
courseSchema.methods.hasAvailableSlots = function () {
  return this.currentEnrollment < this.maxCapacity;
};

// Phương thức: Đăng kí học
courseSchema.methods.enrollStudent = function () {
  if (!this.hasAvailableSlots()) {
    throw new Error("Môn học đã đầy, không thể đăng kí thêm");
  }
  this.currentEnrollment += 1;
  return this.save();
};

// Phương thức: Hủy đăng kí
courseSchema.methods.unenrollStudent = function () {
  if (this.currentEnrollment > 0) {
    this.currentEnrollment -= 1;
  }
  return this.save();
};

// Phương thức: Lấy thông tin lịch học
courseSchema.methods.getScheduleInfo = function () {
  return {
    dayOfWeek: this.schedule.dayOfWeek,
    time: `${this.schedule.startTime} - ${this.schedule.endTime}`,
    location: this.schedule.location,
  };
};

// Phương thức: Kiểm tra có thể đăng kí hay không
courseSchema.methods.canEnroll = function () {
  return this.status === "Mở" && this.hasAvailableSlots();
};

// Phương thức: Lấy tỷ lệ sức chứa
courseSchema.methods.getCapacityPercentage = function () {
  return Math.round((this.currentEnrollment / this.maxCapacity) * 100);
};

// Phương thức tĩnh: Tìm tất cả môn học công khai
courseSchema.statics.findOpenCourses = function () {
  return this.find({ status: "Mở" });
};

// Index
courseSchema.index({ courseCode: 1 });
courseSchema.index({ status: 1 });

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
