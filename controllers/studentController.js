const Student = require("../models/student");

// ─── GET ALL ──────────────────────────────────────────────
exports.getAllStudents = async (req, res, next) => {
  try {
    // Hỗ trợ tìm kiếm theo query ?q=
    const query = req.query.q;
    const filter = query
      ? {
          $or: [
            { studentId: { $regex: query, $options: "i" } },
            { fullName: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        }
      : {};
    const students = await Student.find(filter);
    res.json({ success: true, data: students });
  } catch (err) {
    next(err);
  }
};

// ─── GET BY ID ────────────────────────────────────────────
exports.getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      const err = new Error("Sinh viên không tồn tại");
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// ─── CREATE ───────────────────────────────────────────────
exports.createStudent = async (req, res, next) => {
  try {
    const student = new Student(req.body);
    const newStudent = await student.save();
    res.status(201).json({ success: true, message: "Tạo sinh viên thành công", data: newStudent });
  } catch (err) {
    next(err);
  }
};

// ─── UPDATE ───────────────────────────────────────────────
exports.updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!student) {
      const err = new Error("Sinh viên không tồn tại");
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, message: "Cập nhật thành công", data: student });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE ───────────────────────────────────────────────
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      const err = new Error("Sinh viên không tồn tại");
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, message: "Sinh viên đã được xóa" });
  } catch (err) {
    next(err);
  }
};
