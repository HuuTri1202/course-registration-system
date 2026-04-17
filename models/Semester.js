const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema(
  {
    // Mã học kỳ, ví dụ: "HK1-2024", "HK2-2025"
    semesterCode: {
      type: String,
      required: [true, "Mã học kỳ là bắt buộc"],
      unique: true,
      uppercase: true,
      trim: true,
    },

    // Tên đầy đủ học kỳ
    name: {
      type: String,
      required: [true, "Tên học kỳ là bắt buộc"],
      trim: true,
    },

    // Năm học, ví dụ: "2024-2025"
    academicYear: {
      type: String,
      required: [true, "Năm học là bắt buộc"],
    },

    // Học kỳ (1, 2, hoặc Hè)
    semesterNumber: {
      type: String,
      enum: ["1", "2", "Hè"],
      required: [true, "Số học kỳ là bắt buộc"],
    },

    // Ngày bắt đầu & kết thúc học kỳ
    startDate: {
      type: Date,
      required: [true, "Ngày bắt đầu là bắt buộc"],
    },
    endDate: {
      type: Date,
      required: [true, "Ngày kết thúc là bắt buộc"],
    },

    // Thời gian mở đăng ký môn học
    registrationStart: {
      type: Date,
      required: [true, "Ngày mở đăng ký là bắt buộc"],
    },
    registrationEnd: {
      type: Date,
      required: [true, "Ngày đóng đăng ký là bắt buộc"],
    },

    // Trạng thái học kỳ
    status: {
      type: String,
      enum: ["Sắp tới", "Đang mở ĐK", "Đang học", "Kết thúc"],
      default: "Sắp tới",
    },

    // Ghi chú
    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // tự thêm createdAt, updatedAt
  }
);

// Tự động cập nhật trạng thái dựa theo ngày hiện tại trước khi save
semesterSchema.pre("save", function (next) {
  const now = new Date();
  if (now < this.registrationStart) {
    this.status = "Sắp tới";
  } else if (now >= this.registrationStart && now <= this.registrationEnd) {
    this.status = "Đang mở ĐK";
  } else if (now > this.registrationEnd && now <= this.endDate) {
    this.status = "Đang học";
  } else {
    this.status = "Kết thúc";
  }
  next();
});

module.exports = mongoose.model("Semester", semesterSchema);
