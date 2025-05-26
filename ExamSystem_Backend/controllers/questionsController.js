const Question = require("../models/Question");
const Exam = require("../models/Exam");
const asyncWrapper = require("../MiddleWares/asyncWrapper");
const httpStatusText = require("../utils/httpStatusText");

// Add Question to Exam
const addQuestion = asyncWrapper(async (req, res) => {
  const { examId } = req.params;
  const { question_text, options, correct_answer, marks } = req.body;

  // Check if exam exists
  const exam = await Exam.findById(examId);
  if (!exam) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      data: { message: "Exam not found" },
    });
  }

  // Get next order number
  const lastQuestion = await Question.findOne({ exam: examId }).sort({
    order: -1,
  });
  const order = lastQuestion ? lastQuestion.order + 1 : 1;

  const questionData = {
    exam: examId,
    question_text,
    options,
    correct_answer,
    marks,
    order,
  };

  const question = new Question(questionData);
  await question.save();

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { question },
  });
});

// Get All Questions for an Exam
const getExamQuestions = asyncWrapper(async (req, res) => {
  const { examId } = req.params;

  const exam = await Exam.findById(examId);
  if (!exam) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      data: { message: "Exam not found" },
    });
  }

  const questions = await Question.find({ exam: examId }).sort({ order: 1 });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { questions },
  });
});

// Get Single Question
const getQuestion = asyncWrapper(async (req, res) => {
  const { questionId } = req.params;

  const question = await Question.findById(questionId).populate(
    "exam",
    "title"
  );

  if (!question) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      data: { message: "Question not found" },
    });
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { question },
  });
});

// Update Question
const updateQuestion = asyncWrapper(async (req, res) => {
  const { questionId } = req.params;
  const { question_text, options, correct_answer, marks, order } = req.body;

  const question = await Question.findById(questionId);
  if (!question) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      data: { message: "Question not found" },
    });
  }

  const updateFields = {};
  if (question_text) updateFields.question_text = question_text;
  if (options) updateFields.options = options;
  if (correct_answer) updateFields.correct_answer = correct_answer;
  if (marks) updateFields.marks = marks;
  if (order) updateFields.order = order;

  const updatedQuestion = await Question.findByIdAndUpdate(
    questionId,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { question: updatedQuestion },
  });
});

// Delete Question
const deleteQuestion = asyncWrapper(async (req, res) => {
  const { questionId } = req.params;

  const question = await Question.findById(questionId);
  if (!question) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      data: { message: "Question not found" },
    });
  }

  await Question.findByIdAndDelete(questionId);

  // Reorder remaining questions
  const remainingQuestions = await Question.find({ exam: question.exam }).sort({
    order: 1,
  });

  for (let i = 0; i < remainingQuestions.length; i++) {
    remainingQuestions[i].order = i + 1;
    await remainingQuestions[i].save();
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { message: "Question deleted successfully" },
  });
});

module.exports = {
  addQuestion,
  getExamQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
};
