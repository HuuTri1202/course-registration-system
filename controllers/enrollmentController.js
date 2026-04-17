const Enrollment = require("../models/enrollments");
const Course = require("../models/course");
const Student = require("../models/student");

// ─── GET ALL ──────────────────────────────────────────────
exports.getAllEnrollments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.studentId) filter.student = req.query.studentId;
    if (req.query.courseId) filter.course = req.query.courseId;
    if (req.query.status) filter.status = req.query.status;

    const enrollments = await Enrollment.find(filter)
      .populate("student", "studentId fullName email major")
      .populate("course", "courseCode courseName instructor credits schedule");
    res.json({ success: true, data: enrollments });
  } catch (err) {
    next(err);
  }
};

// ─── GET BY ID ────────────────────────────────────────────
exports.getEnrollmentById = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate("student")
      .populate("course");
    if (!enrollment) {
      const err = new Error("Đăng ký không tồn tại");
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, data: enrollment });
  } catch (err) {
    next(err);
  }
};

// ─── CREATE ───────────────────────────────────────────────
exports.createEnrollment = async (req, res, next) => {
  try {
    const { student, course } = req.body;

    // Kiểm tra sinh viên tồn tại
    const studentData = await Student.findById(student);
    if (!studentData) {
      const err = new Error("Sinh viên không tồn tại");
      err.statusCode = 404;
      return next(err);
    }

    // Kiểm tra môn học tồn tại và còn chỗ
    const courseData = await Course.findById(course);
    if (!courseData) {
      const err = new Error("Môn học không tồn tại");
      err.statusCode = 404;
      return next(err);
    }
    if (courseData.status === "Hủy") {
      const err = new Error("Môn học đã bị hủy");
      err.statusCode = 400;
      return next(err);
    }
    if (courseData.currentEnrollment >= courseData.maxCapacity) {
      const err = new Error("Môn học đã hết chỗ");
      err.statusCode = 400;
      return next(err);
    }

    // Kiểm tra đăng ký trùng
    const existing = await Enrollment.findOne({ student, course });
    if (existing) {
      const err = new Error("Sinh viên đã đăng ký môn này rồi");
      err.statusCode = 400;
      return next(err);
    }

    // Kiểm tra trùng lịch học (Time Conflict Detection)
    const currentEnrollments = await Enrollment.find({ student }).populate("course");
    const newSchedules = courseData.schedule || [];

    for (const enr of currentEnrollments) {
      if (!enr.course) continue; // Bỏ qua nếu course bị null
      const existSchedules = enr.course.schedule || [];

      for (const newSch of newSchedules) {
        for (const existSch of existSchedules) {
          if (newSch.dayOfWeek === existSch.dayOfWeek) {
            // Kiểm tra giao nhau: Bắt đầu môn A < Kết thúc môn B VÀ Kết thúc môn A > Bắt đầu môn B
            if (newSch.startTime < existSch.endTime && newSch.endTime > existSch.startTime) {
              const err = new Error(
                `Trùng lịch học! Môn này trùng giờ với môn '${enr.course.courseName}' vào ${newSch.dayOfWeek} (Từ ${existSch.startTime} - ${existSch.endTime})`
              );
              err.statusCode = 400;
              return next(err);
            }
          }
        }
      }
    }

    // Tạo đăng ký mới
    const enrollment = new Enrollment(req.body);
    await enrollment.save();

    // Tăng sĩ số và kiểm tra đóng lớp
    courseData.currentEnrollment += 1;
    if (courseData.currentEnrollment >= courseData.maxCapacity) {
      courseData.status = "Đóng";
    }
    await courseData.save();

    res.status(201).json({ success: true, message: "Đăng ký thành công", data: enrollment });
  } catch (err) {
    next(err);
  }
};

// ─── UPDATE STATUS ────────────────────────────────────────
exports.updateEnrollmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!enrollment) {
      const err = new Error("Đăng ký không tồn tại");
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, message: "Cập nhật trạng thái thành công", data: enrollment });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE ───────────────────────────────────────────────
exports.deleteEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      const err = new Error("Đăng ký không tồn tại");
      err.statusCode = 404;
      return next(err);
    }

    // Giảm sĩ số môn học khi hủy đăng ký
    const course = await Course.findById(enrollment.course);
    if (course) {
      course.currentEnrollment = Math.max(0, course.currentEnrollment - 1);
      // Mở lại lớp nếu trước đó đầy
      if (course.status === "Đóng" && course.currentEnrollment < course.maxCapacity) {
        course.status = "Mở";
      }
      await course.save();
    }

    await enrollment.deleteOne();
    res.json({ success: true, message: "Đã hủy đăng ký" });
  } catch (err) {
    next(err);
  }
};
