const mongoose = require("mongoose");

const examResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
  },
  answers: [
    {
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
      selected_answer: {
        type: String,
        enum: ["A", "B", "C", "D"],
        required: true,
      },
      is_correct: {
        type: Boolean,
        default: false,
      },
      marks_obtained: {
        type: Number,
        default: 0,
      },
    },
  ],
  total_marks_obtained: {
    type: Number,
    required: true,
    default: 0,
  },
  total_possible_marks: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
    default: 0,
  },
  is_passed: {
    type: Boolean,
    default: false,
  },
  start_time: {
    type: Date,
    required: true,
  },
  end_time: {
    type: Date,
    required: true,
  },
  submitted_at: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a student can only take an exam once
examResultSchema.index({ student: 1, exam: 1 }, { unique: true });

module.exports = mongoose.model("ExamResult", examResultSchema);
