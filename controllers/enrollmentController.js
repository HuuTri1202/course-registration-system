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
      return next(new Error("Đăng ký không tồn tại"));
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

    // ─── CHECK STUDENT ───
    const studentData = await Student.findById(student);
    if (!studentData) {
      return next(new Error("Sinh viên không tồn tại"));
    }

    // ─── CHECK COURSE ───
    const courseData = await Course.findById(course);
    if (!courseData) {
      return next(new Error("Môn học không tồn tại"));
    }

    if (courseData.status === "Hủy") {
      return next(new Error("Môn học đã bị hủy"));
    }

    if (courseData.currentEnrollment >= courseData.maxCapacity) {
      return next(new Error("Môn học đã hết chỗ"));
    }

    // ─── CHECK EXISTING ───
    const existing = await Enrollment.findOne({ student, course });

    if (existing) {
      if (existing.status === "Đã đăng ký") {
        return next(new Error("Sinh viên đã đăng ký môn này rồi"));
      }

      // ✅ ĐÃ HỦY → CHO ĐĂNG KÝ LẠI
      existing.status = "Đã đăng ký";
      await existing.save();

      // cập nhật sĩ số
      courseData.currentEnrollment += 1;
      if (courseData.currentEnrollment >= courseData.maxCapacity) {
        courseData.status = "Đóng";
      }
      await courseData.save();

      return res.json({
        success: true,
        message: "Đăng ký lại thành công",
        data: existing,
      });
    }

    // ─── CHECK TRÙNG LỊCH ───
    const currentEnrollments = await Enrollment.find({
      student,
      status: "Đã đăng ký",
    }).populate("course");

    for (const enr of currentEnrollments) {
      if (!enr.course) continue;

      for (const newSch of courseData.schedule || []) {
        for (const existSch of enr.course.schedule || []) {
          if (
            newSch.dayOfWeek === existSch.dayOfWeek &&
            newSch.startTime < existSch.endTime &&
            newSch.endTime > existSch.startTime
          ) {
            return res.status(400).json({
              success: false,
              message: `❌ Trùng lịch với '${enr.course.courseName}' (${existSch.startTime}-${existSch.endTime})`,
            });
          }
        }
      }
    }

    // ─── CREATE NEW ───
    const enrollment = new Enrollment({
      student,
      course,
      status: "Đã đăng ký",
    });

    await enrollment.save();

    // ─── UPDATE COURSE ───
    courseData.currentEnrollment += 1;
    if (courseData.currentEnrollment >= courseData.maxCapacity) {
      courseData.status = "Đóng";
    }
    await courseData.save();

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: enrollment,
    });
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
      { new: true, runValidators: true },
    );

    if (!enrollment) {
      return next(new Error("Đăng ký không tồn tại"));
    }

    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: enrollment,
    });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE (HỦY ĐĂNG KÝ) ─────────────────────────────────
exports.deleteEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Đăng ký không tồn tại",
      });
    }

    // ❗ Nếu đã hủy rồi thì thôi
    if (enrollment.status === "Đã hủy") {
      return res.status(400).json({
        success: false,
        message: "Môn này đã được hủy trước đó",
      });
    }

    // 👉 cập nhật status thay vì delete
    enrollment.status = "Đã hủy";
    await enrollment.save();

    // 👉 giảm sĩ số
    const course = await Course.findById(enrollment.course);
    if (course) {
      course.currentEnrollment = Math.max(0, course.currentEnrollment - 1);

      if (
        course.status === "Đóng" &&
        course.currentEnrollment < course.maxCapacity
      ) {
        course.status = "Mở";
      }

      await course.save();
    }

    res.json({
      success: true,
      message: "Đã hủy đăng ký",
    });
  } catch (err) {
    next(err);
  }
};
