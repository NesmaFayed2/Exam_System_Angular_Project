const express = require("express");
const router = express.Router();

const {
  createExam,
  getAllExams,
  getExam,
  updateExam,
  deleteExam,
  getAllStudentsResults,
  getResultsForSpecificExam,
} = require("../controllers/examController");

const {
  addQuestion,
  getExamQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questionsController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../MiddleWares/authMiddleware");

// Admin Exam Routes
router.post("/exams", authenticateToken, authorizeRoles("admin"), createExam);
router.get(
  "/admin/exams",
  authenticateToken,
  authorizeRoles("admin"),
  getAllExams
);
router.get("/exams/:id", authenticateToken, authorizeRoles("admin"), getExam);
router.patch(
  "/exams/:id",
  authenticateToken,
  authorizeRoles("admin"),
  updateExam
);
router.delete(
  "/exams/:id",
  authenticateToken,
  authorizeRoles("admin"),
  deleteExam
);

// Question Routes (Admin only)
router.post(
  "/exams/:examId/questions",
  authenticateToken,
  authorizeRoles("admin"),
  addQuestion
);
router.get(
  "/exams/:examId/questions",
  authenticateToken,
  authorizeRoles("admin"),
  getExamQuestions
);
router.get(
  "/questions/:questionId",
  authenticateToken,
  authorizeRoles("admin"),
  getQuestion
);
router.patch(
  "/questions/:questionId",
  authenticateToken,
  authorizeRoles("admin"),
  updateQuestion
);
router.delete(
  "/questions/:questionId",
  authenticateToken,
  authorizeRoles("admin"),
  deleteQuestion
);

// Admin: Get all students' exam results
router.get(
  "/admin/results",
  authenticateToken,
  authorizeRoles("admin"),
  getAllStudentsResults
);

// Admin: Get results for a specific exam
router.get(
  "/admin/results/:examId",
  authenticateToken,
  authorizeRoles("admin"),
  getResultsForSpecificExam
);

module.exports = router;
