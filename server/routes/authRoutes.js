const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

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

// Stricter rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 auth requests per 15 minutes
  message: {
    success: false,
    message: "Too many authentication attempts from this IP. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// @route   POST /api/auth/send-otp - Send OTP verification code (Signup)
router.post("/send-otp", authLimiter, sendOtp);

// @route   POST /api/auth/register - Register user
router.post("/register", authLimiter, registerValidator, validate, registerUser);

// @route   POST /api/auth/login - Credentials check & initiate 2FA
router.post("/login", authLimiter, loginValidator, validate, loginUser);

// @route   POST /api/auth/verify-2fa - Finalize login with 2FA code
router.post("/verify-2fa", authLimiter, verify2Fa);

// @route   POST /api/auth/forgot-password - Send reset password code
router.post("/forgot-password", authLimiter, forgotPassword);

// @route   POST /api/auth/reset-password - Reset password using OTP
router.post("/reset-password", authLimiter, resetPassword);

// @route   GET /api/auth/profile - Fetch profile info
router.get("/profile", protect, getUserProfile);

module.exports = router;
