const User = require("../models/User");
const AppError = require("../utils/errorUtils");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHelper");
const jwt = require("jsonwebtoken");

/**
 * Generate a JWT token containing userId, role, and email
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phoneNumber } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError("User with this email already exists", 400));
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    role: role || "user", // defaults to user
    phoneNumber: phoneNumber || "",
  });

  if (user) {
    const token = generateToken(user);
    
    sendSuccess(
      res,
      "User registered successfully",
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      },
      201
    );
  } else {
    return next(new AppError("Invalid user data", 400));
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new AppError("Invalid credentials", 401));
  }

  // Check user status
  if (user.status === "suspended") {
    return next(new AppError("Your account has been suspended. Please contact admin.", 403));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new AppError("Invalid credentials", 401));
  }

  // Update lastLogin timestamp
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user);

  sendSuccess(res, "Login successful", {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  sendSuccess(res, "Profile retrieved successfully", {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phoneNumber: user.phoneNumber,
      isVerified: user.isVerified,
      status: user.status,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    },
  });
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
