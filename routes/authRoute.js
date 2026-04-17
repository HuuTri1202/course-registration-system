const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/authController");
const { authenticate } = require("../middleware/authenticate");

// POST /auth/register  - Đăng ký tài khoản mới
router.post("/register", ctrl.register);

// POST /auth/login     - Đăng nhập
router.post("/login", ctrl.login);

// GET  /auth/me        - Lấy thông tin tài khoản hiện tại
router.get("/me", authenticate, ctrl.getMe);

module.exports = router;
