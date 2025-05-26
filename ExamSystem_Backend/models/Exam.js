const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Exam title is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Exam description is required"],
  },
  major: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Major",
    required: [true, "Major is required for exam"],
  },
  duration: {
    type: Number,
    required: [true, "Exam duration is required"],
    min: [1, "Duration must be at least 1 minute"],
  },
  total_marks: {
    type: Number,
    required: [true, "Total marks is required"],
    min: [1, "Total marks must be at least 1"],
  },
  passing_marks: {
    type: Number,
    required: [true, "Passing marks is required"],
    min: [0, "Passing marks cannot be negative"],
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  start_date: {
    type: Date,
    required: [true, "Start date is required"],
  },
  end_date: {
    type: Date,
    required: [true, "End date is required"],
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

examSchema.pre("save", function (next) {
  if (this.end_date <= this.start_date) {
    next(new Error("End date must be after start date"));
  }
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model("Exam", examSchema);
