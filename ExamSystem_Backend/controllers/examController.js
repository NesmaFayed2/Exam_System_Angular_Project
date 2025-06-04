const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Major = require("../models/Major");
const asyncWrapper = require("../MiddleWares/asyncWrapper");
const httpStatusText = require("../utils/httpStatusText");
const ExamResult = require("../models/ExamResult");
const User = require("../models/User");
const mongoose = require("mongoose");

// Create Exam (Admin only)
const createExam = asyncWrapper(async (req, res) => {
  let {
    title,
    description,
    major,
    duration,
    total_marks,
    passing_marks,
    start_date,
    end_date,
  } = req.body;

  // Validate date logic BEFORE saving
  if (start_date && end_date && new Date(end_date) <= new Date(start_date)) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      data: { message: "End date must be after start date" },
    });
  }

  let majorId = major;
  if (!mongoose.isValidObjectId(major)) {
    const majorDoc = await Major.findOne({ name: major.toLowerCase() });
    if (!majorDoc) {
      return res.status(400).json({
        status: httpStatusText.FAIL,
        data: { message: "Invalid major selected" },
      });
    }
    majorId = majorDoc._id;
  }

  const examData = {
    title,
    description,
    major: majorId,
    duration,
    total_marks,
    passing_marks,
    start_date,
    end_date,
    created_by: req.user.id,
  };

  const exam = new Exam(examData);
  await exam.save();
  await exam.populate(["major", "created_by"]);

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { exam },
  });
});

// Get All Exams (Admin)
const getAllExams = asyncWrapper(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.major) filter.major = req.query.major;
  if (req.query.is_active !== undefined) filter.is_active = req.query.is_active;

  const total = await Exam.countDocuments(filter);

  const exams = await Exam.find(filter)
    .populate("major", "name description")
    .populate("created_by", "first_name last_name")
    .sort({ created_at: -1 })
    .limit(limit)
    .skip(skip);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      exams,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// Get Single Exam
const getExam = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const exam = await Exam.findById(id)
    .populate("major", "name description")
    .populate("created_by", "first_name last_name email");

  if (!exam) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      data: { message: "Exam not found" },
    });
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { exam },
  });
});

// Update Exam
const updateExam = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  let {
    title,
    description,
    major,
    duration,
    total_marks,
    passing_marks,
    start_date,
    end_date,
    is_active,
  } = req.body;

  const exam = await Exam.findById(id);
  if (!exam) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      data: { message: "Exam not found" },
    });
  }

  start_date = start_date || exam.start_date;
  end_date = end_date || exam.end_date;

  if (start_date && end_date && new Date(end_date) <= new Date(start_date)) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      data: { message: "End date must be after start date" },
    });
  }

  const updateFields = {};
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;
  if (duration) updateFields.duration = duration;
  if (total_marks) updateFields.total_marks = total_marks;
  if (passing_marks) updateFields.passing_marks = passing_marks;
  if (start_date) updateFields.start_date = start_date;
  if (end_date) updateFields.end_date = end_date;
  if (is_active !== undefined) updateFields.is_active = is_active;

  if (major) {
    let majorId = major;
    if (!mongoose.isValidObjectId(major)) {
      const majorDoc = await Major.findOne({ name: major.toLowerCase() });
      if (!majorDoc) {
        return res.status(400).json({
          status: httpStatusText.FAIL,
          data: { message: "Invalid major selected" },
        });
      }
      majorId = majorDoc._id;
    }
    updateFields.major = majorId;
  }

  const updatedExam = await Exam.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).populate(["major", "created_by"]);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { exam: updatedExam },
  });
});

// Delete Exam
const deleteExam = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const exam = await Exam.findById(id);
  if (!exam) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      data: { message: "Exam not found" },
    });
  }

  // Delete all questions for this exam
  await Question.deleteMany({ exam: id });

  // Delete the exam
  await Exam.findByIdAndDelete(id);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { message: "Exam and all its questions deleted successfully" },
  });
});

// Get Available Exams for Students
const getAvailableExams = asyncWrapper(async (req, res) => {
  const studentMajor = req.user.major;
  const examIdsWithQuestions = await Question.find().distinct("exam");

  const currentDate = new Date();

  const exams = await Exam.find({
    major: studentMajor,
    is_active: true,
    start_date: { $lte: currentDate },
    end_date: { $gte: currentDate },
    _id: { $in: examIdsWithQuestions },
  }).populate("major", "name description");

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { exams },
  });
});

// Admin: Get all students' exam results
const getAllStudentsResults = asyncWrapper(async (req, res) => {
  // Find all exam results, populate student and exam info
  const results = await ExamResult.find({})
    .populate({
      path: "student",
      select: "first_name last_name email",
    })
    .populate({
      path: "exam",
      select: "title",
    })
    .sort({ submitted_at: -1 });

  // Format for frontend table
  const formattedResults = results.map((result) => ({
    student_name: result.student
      ? `${result.student.first_name} ${result.student.last_name}`
      : "Unknown",
    exam_title: result.exam ? result.exam.title : "Unknown",
    total_score: result.total_marks_obtained,
    submitted_at: result.submitted_at,
  }));

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { results: formattedResults },
  });
});

const getResultsForSpecificExam = asyncWrapper(async (req, res, next) => {
  const { examId } = req.params;

  if (!examId || !mongoose.Types.ObjectId.isValid(examId)) {
    const error = new Error("Invalid or missing exam ID");
    error.statusCode = 400;
    error.status = httpStatusText.FAIL;
    return next(error);
  }

  const results = await ExamResult.find({ exam: examId })
    .populate({
      path: "student",
      select: "first_name last_name email",
    })
    .populate({
      path: "exam",
      select: "title",
    })
    .sort({ submitted_at: -1 });

  if (!results || results.length === 0) {
    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { results: [], message: "No results found for this exam." },
    });
  }

  const formattedResults = results.map((result) => ({
    result_id: result._id,
    student_id: result.student ? result.student._id : null,
    student_name: result.student
      ? `${result.student.first_name} ${result.student.last_name}`
      : "N/A",
    student_email: result.student ? result.student.email : "N/A",
    exam_title: result.exam ? result.exam.title : "N/A",
    total_score: result.total_marks_obtained,
    max_marks: result.total_exam_marks,
    percentage: result.percentage,
    status: result.status,
    submitted_at: result.submitted_at,
  }));

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { results: formattedResults },
  });
});

module.exports = {
  createExam,
  getAllExams,
  getExam,
  updateExam,
  deleteExam,
  getAvailableExams,
  getAllStudentsResults,
  getResultsForSpecificExam,
};
