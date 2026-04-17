const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/enrollmentController");
const { authenticate, authorizeAdmin } = require("../middleware/authenticate");

// ─── Phải đăng nhập mới dùng được ────────────────────────
router.get("/", authenticate, ctrl.getAllEnrollments);
router.get("/:id", authenticate, ctrl.getEnrollmentById);
router.post("/", authenticate, ctrl.createEnrollment);
router.delete("/:id", authenticate, ctrl.deleteEnrollment);

// ─── Admin only (duyệt/đổi trạng thái đăng ký) ───────────
router.put("/:id/status", authenticate, authorizeAdmin, ctrl.updateEnrollmentStatus);

module.exports = router;
