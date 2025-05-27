const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
    minlength: [2, "First name must be at least 2 characters"],
    maxlength: [50, "First name cannot exceed 50 characters"],
  },
  last_name: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
    minlength: [2, "Last name must be at least 2 characters"],
    maxlength: [50, "Last name cannot exceed 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    validate: [validator.isEmail, "Please provide a valid email address"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false,
  },
  role: {
    type: String,
    enum: ["student", "admin"],
    default: "student",
  },
  major: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Major",
    required: function () {
      return this.role === "student";
    },
  },
  profile_image: {
    type: String,
    default: "uploads/user.png",
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  last_login: {
    type: Date,
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

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Update timestamp before saving
userSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
      major: this.major,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
  );
};

userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email, is_active: true }).select(
    "+password"
  );

  if (!user) {
    throw new Error("Invalid Email or Password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid Email or Password");
  }

  return user;
};

module.exports = mongoose.model("User", userSchema);
