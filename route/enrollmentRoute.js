const express = require('express');
const router = express.Router();
const Enrollment = require('../models/enrollments');

// GET /enrollments - Lấy tất cả đăng ký
router.get('/all', async (req, res) => {
  try {
    const enrollments = await Enrollment.find().populate('student').populate('course');
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /enrollments/:id - Lấy đăng ký theo ID
router.get('/:id', async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id).populate('student').populate('course');
    if (!enrollment) return res.status(404).json({ message: 'Đăng ký không tồn tại' });
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /enrollments - Tạo đăng ký mới
router.post('/create', async (req, res) => {
  const enrollment = new Enrollment(req.body);
  try {
    const newEnrollment = await enrollment.save();
    res.status(201).json(newEnrollment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /enrollments/:id - Cập nhật đăng ký
router.put('/update/:id', async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!enrollment) return res.status(404).json({ message: 'Đăng ký không tồn tại' });
    res.json(enrollment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /enrollments/:id - Xóa đăng ký
router.delete('/delete/:id', async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
    if (!enrollment) return res.status(404).json({ message: 'Đăng ký không tồn tại' });
    res.json({ message: 'Đăng ký đã được xóa' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;