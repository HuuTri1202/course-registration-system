const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/student");

// ─── Tạo JWT token ────────────────────────────────────────
const signToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role,
      student: user.student,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

// ─── POST /auth/register ──────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { username, password, role, studentId, adminSecret } = req.body;

    // Kiểm tra nếu đăng ký tài khoản admin
    if (role === "admin") {
      if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
        const err = new Error("Mã bí mật admin không đúng");
        err.statusCode = 403;
        return next(err);
      }
    }

    // Nếu là sinh viên, kiểm tra studentId hợp lệ
    let studentRef = null;
    let studentObj = null;
    if (!role || role === "student") {
      if (!studentId) {
        const err = new Error(
          "Mã sinh viên là bắt buộc khi đăng ký tài khoản sinh viên",
        );
        err.statusCode = 400;
        return next(err);
      }

      const student = await Student.findOne({
        studentId: studentId.toUpperCase(),
      });
      if (!student) {
        const err = new Error(
          "Mã sinh viên không tồn tại trong hệ thống. Liên hệ Admin để được thêm vào.",
        );
        err.statusCode = 404;
        return next(err);
      }

      // Kiểm tra sinh viên đã có tài khoản chưa
      const existingUser = await User.findOne({ student: student._id });
      if (existingUser) {
        const err = new Error(
          "Sinh viên này đã có tài khoản. Vui lòng đăng nhập.",
        );
        err.statusCode = 400;
        return next(err);
      }

      studentRef = student._id;
      studentObj = student;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      username: username.toLowerCase(),
      password: hashedPassword,
      role: role || "student",
      student: studentRef,
    });

    await user.save();

    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        student: studentObj, //  Trả về nguyên object student để localStorage lưu đầy đủ
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /auth/login ─────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      const err = new Error("Vui lòng nhập tên đăng nhập và mật khẩu");
      err.statusCode = 400;
      return next(err);
    }

    // Tìm user và populate thông tin sinh viên
    const user = await User.findOne({
      username: username.toLowerCase(),
    }).populate("student", "studentId fullName email major className");

    if (!user) {
      const err = new Error("Tên đăng nhập hoặc mật khẩu không đúng");
      err.statusCode = 401;
      return next(err);
    }

    if (!user.isActive) {
      const err = new Error(
        "Tài khoản đã bị khóa. Liên hệ Admin để được hỗ trợ.",
      );
      err.statusCode = 403;
      return next(err);
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const err = new Error("Tên đăng nhập hoặc mật khẩu không đúng");
      err.statusCode = 401;
      return next(err);
    }

    const token = signToken(user);

    res.json({
      success: true,
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        student: user.student, // object với studentId, fullName, ...
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /auth/me ─────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate(
        "student",
        "studentId fullName email major className gpa status",
      );

    if (!user) {
      const err = new Error("Không tìm thấy người dùng");
      err.statusCode = 404;
      return next(err);
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
