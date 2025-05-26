const express = require("express");
const router = express.Router();
const {
  login,
  register,
  getAllStudents,
  logout,
} = require("../controllers/authController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../MiddleWares/authMiddleware");

const {
  getProfile,
  editPassword,
  editProfile,
} = require("../controllers/profileController");
const { upload } = require("../MiddleWares/multerSetup");

// Authentication routes
router.post("/login", login);
router.post("/register", register);
router.post("/logout", authenticateToken, logout);

// Admin-only student management
router.get(
  "/students",
  authenticateToken,
  authorizeRoles("admin"),
  getAllStudents
);

// User profile route
router.get("/profile", authenticateToken, getProfile);
router.patch(
  "/edit-profile",
  authenticateToken,
  upload.single("profile_image"),
  editProfile
);
router.patch("/edit-password", authenticateToken, editPassword);

module.exports = router;
