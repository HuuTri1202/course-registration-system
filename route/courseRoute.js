const express = require('express');
const router = express.Router();
const Course = require('../models/course');

// ================== HELPER ==================
const validateCourse = (data) => {
  if (
    data.maxCapacity !== undefined &&
    data.currentEnrollment !== undefined &&
    data.currentEnrollment > data.maxCapacity
  ) {
    throw new Error("Số lượng đăng ký vượt quá sức chứa");
  }
};

const autoCloseCourse = (course) => {
  if (course.currentEnrollment >= course.maxCapacity) {
    course.status = "Đóng";
  }
};

// ================== GET ALL ==================
router.get('/all', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================== GET BY CODE ==================
router.get('/:courseCode', async (req, res) => {
  try {
    const course = await Course.findOne({
      courseCode: req.params.courseCode.toUpperCase()
    });

    if (!course) {
      return res.status(404).json({ message: 'Môn học không tồn tại' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================== CREATE ==================
router.post('/create', async (req, res) => {
  try {
    validateCourse(req.body);

    const course = new Course(req.body);

    autoCloseCourse(course);

    const newCourse = await course.save();

    res.status(201).json({
      message: "Tạo môn học thành công",
      data: newCourse,
    });

  } catch (error) {

    // duplicate courseCode
    if (error.code === 11000) {
      return res.status(400).json({ message: "Mã môn học đã tồn tại" });
    }

    res.status(400).json({ message: error.message });
  }
});

// ================== UPDATE ==================
router.put('/update/:courseCode', async (req, res) => {
  try {
    const code = req.params.courseCode.toUpperCase();

    console.log("BODY:", req.body); // debug

    const course = await Course.findOne({ courseCode: code });

    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy môn học" });
    }

    // update field
    course.courseName = req.body.courseName;
    course.instructor = req.body.instructor;
    course.courseType = req.body.courseType;
    course.maxCapacity = req.body.maxCapacity;
    course.status = req.body.status;

    // 🔥 FIX CỨNG (overwrite hoàn toàn)
    course.schedule = []; // clear trước

    if (Array.isArray(req.body.schedule)) {
      req.body.schedule.forEach(s => {
        course.schedule.push({
          type: s.type,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          location: s.location
        });
      });
    }

    await course.save();

    console.log("UPDATED:", course);

    res.json(course);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ================== DELETE ==================
router.delete('/delete/:courseCode', async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      courseCode: req.params.courseCode.toUpperCase()
    });

    if (!course) {
      return res.status(404).json({ message: 'Môn học không tồn tại' });
    }

    res.json({ message: 'Môn học đã được xóa' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;