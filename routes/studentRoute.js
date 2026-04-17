const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/studentController");
const { authenticate, authorizeAdmin } = require("../middleware/authenticate");

// ─── Admin only (quản lý sinh viên) ──────────────────────
router.get("/", authenticate, authorizeAdmin, ctrl.getAllStudents);
router.get("/:id", authenticate, authorizeAdmin, ctrl.getStudentById);
router.post("/", authenticate, authorizeAdmin, ctrl.createStudent);
router.put("/:id", authenticate, authorizeAdmin, ctrl.updateStudent);
router.delete("/:id", authenticate, authorizeAdmin, ctrl.deleteStudent);

module.exports = router;
