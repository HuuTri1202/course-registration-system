// Middleware xử lý lỗi tập trung
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Lỗi trùng key unique của MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `Giá trị '${err.keyValue[field]}' của trường '${field}' đã tồn tại`,
    });
  }

  // Lỗi validation của Mongoose
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(", "),
    });
  }

  // Lỗi ObjectId không hợp lệ
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `ID không hợp lệ: ${err.value}`,
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Đã xảy ra lỗi máy chủ",
  });
};

module.exports = errorHandler;
