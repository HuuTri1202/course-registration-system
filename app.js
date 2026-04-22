require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTML pages
app.use(express.static(path.join(__dirname, "view", "public")));
// CSS files → /css/...
app.use("/css", express.static(path.join(__dirname, "view", "css")));
// JS files → /js/...
app.use("/js", express.static(path.join(__dirname, "view", "js")));

// ─── Trang chủ ────────────────────────────────────────────
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "public", "trangchu.html"));
});

// ─── Routes ───────────────────────────────────────────────
app.use("/auth", require("./routes/authRoute"));
app.use("/courses", require("./routes/courseRoute"));
app.use("/students", require("./routes/studentRoute"));
app.use("/enrollments", require("./routes/enrollmentRoute"));

// ─── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  res
    .status(404)
    .json({
      success: false,
      message: `Route ${req.originalUrl} không tồn tại`,
    });
});

// ─── Error Handler (phải đặt cuối cùng) ──────────────────
app.use(errorHandler);

// ─── Kết nối DB & Khởi động server ───────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  });
});
