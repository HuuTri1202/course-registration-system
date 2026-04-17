const Semester = require("../models/Semester");

// ─── GET ALL ──────────────────────────────────────────────
exports.getAllSemesters = async (req, res, next) => {
  try {
    // Lọc theo trạng thái nếu có ?status=
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const semesters = await Semester.find(filter).sort({ startDate: -1 });
    res.json({ success: true, data: semesters });
  } catch (err) {
    next(err);
  }
};

// ─── GET BY CODE ──────────────────────────────────────────
exports.getSemesterByCode = async (req, res, next) => {
  try {
    const semester = await Semester.findOne({
      semesterCode: req.params.semesterCode.toUpperCase(),
    });
    if (!semester) {
      const err = new Error("Học kỳ không tồn tại");
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, data: semester });
  } catch (err) {
    next(err);
  }
};

// ─── GET ACTIVE SEMESTER ──────────────────────────────────
exports.getActiveSemester = async (req, res, next) => {
  try {
    const semester = await Semester.findOne({
      status: { $in: ["Đang mở ĐK", "Đang học"] },
    }).sort({ startDate: -1 });

    if (!semester) {
      return res.json({ success: true, data: null, message: "Không có học kỳ đang hoạt động" });
    }
    res.json({ success: true, data: semester });
  } catch (err) {
    next(err);
  }
};

// ─── CREATE ───────────────────────────────────────────────
exports.createSemester = async (req, res, next) => {
  try {
    const semester = new Semester(req.body);
    const newSemester = await semester.save();
    res.status(201).json({ success: true, message: "Tạo học kỳ thành công", data: newSemester });
  } catch (err) {
    next(err);
  }
};

// ─── UPDATE ───────────────────────────────────────────────
exports.updateSemester = async (req, res, next) => {
  try {
    const semester = await Semester.findOne({
      semesterCode: req.params.semesterCode.toUpperCase(),
    });
    if (!semester) {
      const err = new Error("Học kỳ không tồn tại");
      err.statusCode = 404;
      return next(err);
    }

    // Cập nhật từng field nếu có trong body
    const fields = ["name", "academicYear", "semesterNumber", "startDate", "endDate", "registrationStart", "registrationEnd", "note"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) semester[field] = req.body[field];
    });

    await semester.save(); // pre-save hook sẽ tự cập nhật status
    res.json({ success: true, message: "Cập nhật học kỳ thành công", data: semester });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE ───────────────────────────────────────────────
exports.deleteSemester = async (req, res, next) => {
  try {
    const semester = await Semester.findOneAndDelete({
      semesterCode: req.params.semesterCode.toUpperCase(),
    });
    if (!semester) {
      const err = new Error("Học kỳ không tồn tại");
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, message: "Đã xóa học kỳ" });
  } catch (err) {
    next(err);
  }
};
