const Exam = require("../models/Exam");
const Question = require("../models/Question");
const ExamResult = require("../models/ExamResult");
const asyncWrapper = require("../MiddleWares/asyncWrapper");
const httpStatusText = require("../utils/httpStatusText");

// Get Available Exams for Student
const getAvailableExams = asyncWrapper(async (req, res) => {
  const studentMajor = req.user.major;
  const currentDate = new Date();

  const exams = await Exam.find({
    major: studentMajor,
    is_active: true,
    start_date: { $lte: currentDate },
    end_date: { $gte: currentDate },
  })
    .populate("major", "name description")
    .select("-created_by")
    .sort({ created_at: -1 });

  // Check which exams student has already taken
  const examIds = exams.map((exam) => exam._id);
  const takenExams = await ExamResult.find({
    student: req.user.id,
    exam: { $in: examIds },
  }).select("exam");

  const takenExamIds = takenExams.map((result) => result.exam.toString());

  // Mark exams as taken/available
  const availableExams = exams.map((exam) => ({
    ...exam.toObject(),
    is_taken: takenExamIds.includes(exam._id.toString()),
  }));

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { exams: availableExams },
  });
});

// Start Exam - Get Questions (without correct answers)
const startExam = asyncWrapper(async (req, res) => {
  const { examId } = req.params;
  const studentId = req.user.id;
  const studentMajor = req.user.major;

  // Check if exam exists and is available
  const exam = await Exam.findOne({
    _id: examId,
    major: studentMajor,
    is_active: true,
    start_date: { $lte: new Date() },
    end_date: { $gte: new Date() },
  }).populate("major", "name");

  if (!exam) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      data: { message: "Exam not found or not available" },
    });
  }

  // Check if student already took this exam
  const existingResult = await ExamResult.findOne({
    student: studentId,
    exam: examId,
  });

  if (existingResult) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      data: { message: "You have already taken this exam" },
    });
  }

  // Get questions (hide correct answers and is_correct fields)
  const questions = await Question.find({ exam: examId })
    .select("-correct_answer")
    .sort({ order: 1 });

  // Remove is_correct from options
  const cleanQuestions = questions.map((question) => ({
    ...question.toObject(),
    options: question.options.map((option) => ({
      option_text: option.option_text,
      option_label: option.option_label,
    })),
  }));

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      exam: {
        _id: exam._id,
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        total_marks: exam.total_marks,
        major: exam.major,
      },
      questions: cleanQuestions,
    },
  });
});

// Submit Exam
const submitExam = asyncWrapper(async (req, res) => {
  const { examId } = req.params;
  const { answers, start_time } = req.body; // answers: [{ questionId, selected_answer }]
  const studentId = req.user.id;

  // Validate exam
  const exam = await Exam.findById(examId);
  if (!exam) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      data: { message: "Exam not found" },
    });
  }

  // Check if student already submitted
  const existingResult = await ExamResult.findOne({
    student: studentId,
    exam: examId,
  });

  if (existingResult) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      data: { message: "Exam already submitted" },
    });
  }

  // Get all questions for this exam
  const questions = await Question.find({ exam: examId });

  // Calculate results
  let totalMarksObtained = 0;
  const processedAnswers = [];

  for (const answer of answers) {
    const question = questions.find(
      (q) => q._id.toString() === answer.questionId
    );

    if (question) {
      const isCorrect = question.correct_answer === answer.selected_answer;
      const marksObtained = isCorrect ? question.marks : 0;

      totalMarksObtained += marksObtained;

      processedAnswers.push({
        question: question._id,
        selected_answer: answer.selected_answer,
        is_correct: isCorrect,
        marks_obtained: marksObtained,
      });
    }
  }

  // Calculate percentage and pass/fail
  const percentage = Math.round((totalMarksObtained / exam.total_marks) * 100);
  const isPassed = totalMarksObtained >= exam.passing_marks;

  // Create exam result
  const examResult = new ExamResult({
    student: studentId,
    exam: examId,
    answers: processedAnswers,
    total_marks_obtained: totalMarksObtained,
    total_possible_marks: exam.total_marks,
    percentage,
    is_passed: isPassed,
    start_time: new Date(start_time),
    end_time: new Date(),
    submitted_at: new Date(),
  });

  await examResult.save();

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: {
      message: "Exam submitted successfully",
      result: {
        total_marks_obtained: totalMarksObtained,
        total_possible_marks: exam.total_marks,
        percentage,
        is_passed: isPassed,
        submitted_at: examResult.submitted_at,
      },
    },
  });
});

// Get Student's Exam Result
const getExamResult = asyncWrapper(async (req, res) => {
  const { examId } = req.params;
  const studentId = req.user.id;

  const result = await ExamResult.findOne({
    student: studentId,
    exam: examId,
  })
    .populate("exam", "title description total_marks passing_marks")
    .populate("answers.question", "question_text options correct_answer marks");

  if (!result) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      data: { message: "Result not found" },
    });
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { result },
  });
});

// Get All Student Results
const getAllResults = asyncWrapper(async (req, res) => {
  const studentId = req.user.id;

  const results = await ExamResult.find({ student: studentId })
    .populate("exam", "title description major total_marks passing_marks")
    .populate("exam.major", "name")
    .sort({ submitted_at: -1 });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { results },
  });
});

module.exports = {
  getAvailableExams,
  startExam,
  submitExam,
  getExamResult,
  getAllResults,
};
