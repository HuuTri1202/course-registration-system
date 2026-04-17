const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/courseController");
const { authenticate, authorizeAdmin } = require("../middleware/authenticate");

// ─── Public (ai cũng xem được) ───────────────────────────
router.get("/", ctrl.getAllCourses);
router.get("/:courseCode", ctrl.getCourseByCode);

// ─── Admin only ───────────────────────────────────────────
router.post("/create", authenticate, authorizeAdmin, ctrl.createCourse);
router.put("/update/:courseCode", authenticate, authorizeAdmin, ctrl.updateCourse);
router.delete("/delete/:courseCode", authenticate, authorizeAdmin, ctrl.deleteCourse);

module.exports = router;
