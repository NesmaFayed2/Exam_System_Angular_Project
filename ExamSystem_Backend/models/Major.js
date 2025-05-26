const mongoose = require("mongoose");

const majorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Major name is required"],
    enum: ["mern", "dotnet", "python"],
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Major", majorSchema);
