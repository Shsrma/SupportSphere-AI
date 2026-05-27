const express = require("express");
const router = express.Router();

const {
  sendOtp,
  registerUser,
  loginUser,
  verify2Fa,
  forgotPassword,
  resetPassword,
  getUserProfile,
} = require("../controllers/authController");

const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidator");

const validate = require("../middleware/validate");
const protect = require("../middleware/authMiddleware");

// @route   POST /api/auth/send-otp - Send OTP verification code (Signup)
router.post("/send-otp", sendOtp);

// @route   POST /api/auth/register - Register user
router.post("/register", registerValidator, validate, registerUser);

// @route   POST /api/auth/login - Credentials check & initiate 2FA
router.post("/login", loginValidator, validate, loginUser);

// @route   POST /api/auth/verify-2fa - Finalize login with 2FA code
router.post("/verify-2fa", verify2Fa);

// @route   POST /api/auth/forgot-password - Send reset password code
router.post("/forgot-password", forgotPassword);

// @route   POST /api/auth/reset-password - Reset password using OTP
router.post("/reset-password", resetPassword);

// @route   GET /api/auth/profile - Fetch profile info
router.get("/profile", protect, getUserProfile);

module.exports = router;
