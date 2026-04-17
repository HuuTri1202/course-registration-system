const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, "Mã sinh viên là bắt buộc"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "Họ tên là bắt buộc"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Nam", "Nữ", "Khác"],
      default: "Nam",
    },
    major: {
      type: String,
      required: [true, "Ngành học là bắt buộc"],
      trim: true,
    },
    className: {
      type: String,
      trim: true,
    },
    // Trạng thái học tập
    status: {
      type: String,
      enum: ["Đang học", "Bảo lưu", "Tốt nghiệp", "Đình chỉ"],
      default: "Đang học",
    },
    // GPA tích lũy
    gpa: {
      type: Number,
      min: 0,
      max: 4,
      default: 0,
    },
  },
  {
    timestamps: true, // tự thêm createdAt, updatedAt
  }
);

module.exports = mongoose.model("Student", studentSchema);
