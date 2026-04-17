const jwt = require("jsonwebtoken");

// ─── Xác thực token ───────────────────────────────────────
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role, student }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
    });
  }
};

// ─── Chỉ Admin mới được phép ──────────────────────────────
const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền thực hiện thao tác này (yêu cầu Admin).",
    });
  }
  next();
};

module.exports = { authenticate, authorizeAdmin };
