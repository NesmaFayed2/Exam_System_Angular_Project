const User = require("../models/User");
const mongoose = require("mongoose");
const asyncWrapper = require("../MiddleWares/asyncWrapper");
const httpStatusText = require("../utils/httpStatusText");
const Major = require("../models/Major");

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

const editProfile = asyncWrapper(async (req, res) => {
  const userId = req.user.id;
  const { first_name, last_name, profile_image, major, email } = req.body;

  const updateFields = {};
  if (first_name) updateFields.first_name = first_name;
  if (last_name) updateFields.last_name = last_name;
  if (req.file) {
    updateFields.profile_image = req.file.path;
  }
  if (email) {
    updateFields.email = email;
  }

  if (major) {
    const majorDoc = await Major.findOne({ name: major });
    if (!majorDoc) {
      return res.status(400).json({
        status: httpStatusText.ERROR,
        data: { message: `Major '${major}' not found` },
      });
    }
    updateFields.major = majorDoc._id;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).populate("major", "name description");

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { user: updatedUser },
  });
});

const bcrypt = require("bcryptjs");

const editPassword = asyncWrapper(async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      data: { message: "Old password and new password are required." },
    });
  }

  const user = await User.findById(userId).select("+password");
  if (!user) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      data: { message: "User not found." },
    });
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      data: { message: "Old password is incorrect." },
    });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { message: "Password updated successfully." },
  });
});

module.exports = {
  getProfile,
  editPassword,
  editProfile,
};
