const User = require("../models/User");
const asyncWrapper = require("../MiddleWares/asyncWrapper");
const httpStatusText = require("../utils/httpStatusText");
const mongoose = require("mongoose");
const Major = require("../models/Major");
const { generateRefreshToken } = require("../utils/generateJWT");

const getAllStudents = asyncWrapper(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const skip = (page - 1) * limit;

  const filter = { role: "student", is_active: true };

  // Total count for pagination
  const total = await User.countDocuments(filter);

  // Fetch students with pagination, exclude __v and password, and populate major
  const students = await User.find(filter, { __v: 0, password: 0 })
    .populate("major")
    .limit(limit)
    .skip(skip);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      students,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

const register = asyncWrapper(async (req, res) => {
  let { first_name, last_name, email, password, role, major } = req.body;

  if (!role) {
    role = "student";
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      status: httpStatusText.FAIL,
      data: { message: "User with this email already exists" },
    });
  }

  let majorId = major;
  if (role === "student") {
    if (!mongoose.isValidObjectId(major)) {
      const majorDoc = await Major.findOne({ name: major.toLowerCase() });
      if (!majorDoc) {
        return res.status(400).json({
          status: httpStatusText.FAIL,
          data: { message: "Invalid major selected" },
        });
      }
      majorId = majorDoc._id;
    } else {
      // If it's a valid ObjectId, check if it exists
      const majorDoc = await Major.findById(major);
      if (!majorDoc) {
        return res.status(400).json({
          status: httpStatusText.FAIL,
          data: { message: "Invalid major selected" },
        });
      }
    }
  }

  // Build user data
  const userData = {
    first_name,
    last_name,
    email,
    password,
    role,
  };
  if (role === "student") {
    userData.major = majorId; // Make sure this is the ObjectId!
  }

  const user = new User(userData);
  await user.save();

  // Generate tokens
  const accessToken = user.generateAuthToken();
  const refreshToken = generateRefreshToken({ userId: user._id });

  // Set refresh token cookie
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Prepare response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: {
      accessToken,
      user: userResponse,
    },
  });
});

const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  // Find user by credentials
  const user = await User.findByCredentials(email, password);

  // Update last login
  user.last_login = new Date();
  await user.save();

  // Generate tokens
  const accessToken = user.generateAuthToken();
  const refreshToken = generateRefreshToken({ userId: user._id });

  // Set refresh token cookie
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Populate major if student
  if (user.role === "student") await user.populate("major");

  // Prepare response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      accessToken,
      user: userResponse,
    },
  });
});

const getProfile = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user.id).populate("major");

  if (!user) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      data: { message: "User not found" },
    });
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { user },
  });
});

const logout = asyncWrapper(async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { message: "Logout successful" },
  });
});

module.exports = {
  login,
  register,
  getAllStudents,
  getProfile,
  logout,
};
