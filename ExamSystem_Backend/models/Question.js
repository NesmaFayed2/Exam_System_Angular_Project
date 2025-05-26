const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: [true, "Exam reference is required"],
  },
  question_text: {
    type: String,
    required: [true, "Question text is required"],
    trim: true,
  },
  options: [
    {
      option_text: {
        type: String,
        required: [true, "Option text is required"],
        trim: true,
      },
      option_label: {
        type: String,
        required: [true, "Option label is required"],
        enum: ["A", "B", "C", "D"],
      },
      is_correct: {
        type: Boolean,
        default: false,
      },
    },
  ],
  correct_answer: {
    type: String,
    required: [true, "Correct answer is required"],
    enum: ["A", "B", "C", "D"],
  },
  marks: {
    type: Number,
    required: [true, "Question marks is required"],
    min: [1, "Marks must be at least 1"],
    default: 1,
  },
  order: {
    type: Number,
    required: [true, "Question order is required"],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

questionSchema.pre("save", function (next) {
  if (this.options.length !== 4) {
    return next(
      new Error("Multiple choice questions must have exactly 4 options")
    );
  }

  const expectedLabels = ["A", "B", "C", "D"];
  const actualLabels = this.options.map((opt) => opt.option_label).sort();

  if (JSON.stringify(actualLabels) !== JSON.stringify(expectedLabels)) {
    return next(new Error("Options must have labels A, B, C, and D"));
  }

  const correctOptions = this.options.filter((opt) => opt.is_correct);
  if (correctOptions.length !== 1) {
    return next(
      new Error(
        "Multiple choice questions must have exactly one correct answer"
      )
    );
  }

  const correctOption = correctOptions[0];
  if (this.correct_answer !== correctOption.option_label) {
    return next(
      new Error("correct_answer must match the label of the correct option")
    );
  }

  next();
});

questionSchema.index({ exam: 1, order: 1 });

module.exports = mongoose.model("Question", questionSchema);
