const Course = require("../models/course");

// ─── Helpers ──────────────────────────────────────────────
const autoCloseCourse = (course) => {
  if (course.currentEnrollment >= course.maxCapacity) {
    course.status = "Đóng";
  }
};

// ─── GET ALL ──────────────────────────────────────────────
exports.getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find();
    res.json({ success: true, data: courses });
  } catch (err) {
    next(err);
  }
};

// ─── GET BY CODE ──────────────────────────────────────────
exports.getCourseByCode = async (req, res, next) => {
  try {
    const course = await Course.findOne({
      courseCode: req.params.courseCode.toUpperCase(),
    });
    if (!course) {
      const err = new Error("Môn học không tồn tại");
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

// ─── CREATE ───────────────────────────────────────────────
exports.createCourse = async (req, res, next) => {
  try {
    const course = new Course(req.body);
    autoCloseCourse(course);
    const newCourse = await course.save();
    res.status(201).json({ success: true, message: "Tạo môn học thành công", data: newCourse });
  } catch (err) {
    next(err);
  }
};

// ─── UPDATE ───────────────────────────────────────────────
exports.updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({
      courseCode: req.params.courseCode.toUpperCase(),
    });
    if (!course) {
      const err = new Error("Không tìm thấy môn học");
      err.statusCode = 404;
      return next(err);
    }

    // Cập nhật các trường
    const { courseName, instructor, courseType, maxCapacity, status, credits, schedule } = req.body;
    if (courseName !== undefined) course.courseName = courseName;
    if (instructor !== undefined) course.instructor = instructor;
    if (courseType !== undefined) course.courseType = courseType;
    if (maxCapacity !== undefined) course.maxCapacity = maxCapacity;
    if (status !== undefined) course.status = status;
    if (credits !== undefined) course.credits = credits;

    // Ghi đè lịch học
    if (Array.isArray(schedule)) {
      course.schedule = schedule.map((s) => ({
        type: s.type,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        location: s.location,
      }));
    }

    await course.save();
    res.json({ success: true, message: "Cập nhật thành công", data: course });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE ───────────────────────────────────────────────
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findOneAndDelete({
      courseCode: req.params.courseCode.toUpperCase(),
    });
    if (!course) {
      const err = new Error("Môn học không tồn tại");
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, message: "Môn học đã được xóa" });
  } catch (err) {
    next(err);
  }
};
