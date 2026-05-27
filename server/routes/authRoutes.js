const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserProfile,
} = require("../controllers/authController");

const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidator");

const validate = require("../middleware/validate");
const protect = require("../middleware/authMiddleware");

// @route   POST /api/auth/register
router.post("/register", registerValidator, validate, registerUser);

// @route   POST /api/auth/login
router.post("/login", loginValidator, validate, loginUser);

// @route   GET /api/auth/profile
router.get("/profile", protect, getUserProfile);

module.exports = router;
