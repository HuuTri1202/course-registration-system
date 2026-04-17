const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/semesterController");
const { authenticate, authorizeAdmin } = require("../middleware/authenticate");

// ─── Public ───────────────────────────────────────────────
router.get("/", ctrl.getAllSemesters);
router.get("/active", ctrl.getActiveSemester);
router.get("/:semesterCode", ctrl.getSemesterByCode);

// ─── Admin only ───────────────────────────────────────────
router.post("/", authenticate, authorizeAdmin, ctrl.createSemester);
router.put("/:semesterCode", authenticate, authorizeAdmin, ctrl.updateSemester);
router.delete("/:semesterCode", authenticate, authorizeAdmin, ctrl.deleteSemester);

module.exports = router;
