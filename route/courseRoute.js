const express = require('express');
const router = express.Router();
const Course = require('../models/course');

// GET /courses - Lấy tất cả môn học
router.get('/all', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /courses/:id - Lấy môn học theo ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Môn học không tồn tại' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /courses - Tạo môn học mới
router.post('/create', async (req, res) => {
  try {
    const course = new Course(req.body);

    const newCourse = await course.save();

    res.status(201).json({
      message: "Tạo môn học thành công",
      data: newCourse,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /courses/:id - Cập nhật môn học
router.put('/update/:courseCode', async (req, res) => {
  try {
    const course = await Course.findOneAndUpdate({ courseCode: req.params.courseCode.toUpperCase() }, req.body, { new: true });
    if (!course){
        return res.status(404).json({ message: 'Môn học không tồn tại' });
    } 
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /courses/:id - Xóa môn học
router.delete('/delete/:courseCode', async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({ courseCode: req.params.courseCode.toUpperCase() });
    if (!course){
        return res.status(404).json({ message: 'Môn học không tồn tại' });
    } 
    res.json({ message: 'Môn học đã được xóa' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;