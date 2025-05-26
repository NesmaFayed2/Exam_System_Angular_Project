const express = require("express");
const router = express.Router();

const {
  getAvailableExams,
  startExam,
  submitExam,
  getExamResult,
  getAllResults,
} = require("../controllers/studentExamController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../MiddleWares/authMiddleware");

// Student Exam Routes
router.get(
  "/exams",
  authenticateToken,
  authorizeRoles("student"),
  getAvailableExams
);

router.get(
  "/exams/:examId/start",
  authenticateToken,
  authorizeRoles("student"),
  startExam
);

router.post(
  "/exams/:examId/submit",
  authenticateToken,
  authorizeRoles("student"),
  submitExam
);

router.get(
  "/exams/:examId/result",
  authenticateToken,
  authorizeRoles("student"),
  getExamResult
);

router.get(
  "/results",
  authenticateToken,
  authorizeRoles("student"),
  getAllResults
);

module.exports = router;
