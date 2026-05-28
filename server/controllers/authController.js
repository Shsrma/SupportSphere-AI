const User = require("../models/User");
const Otp = require("../models/Otp");
const AppError = require("../utils/errorUtils");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHelper");
const sendEmail = require("../services/emailService");
const jwt = require("jsonwebtoken");

/**
 * Generate a JWT token containing userId, role, and email.
 * Normal users (verified_user) session ends in 10 minutes.
 * Administrators and support staff get 30 days session persistence.
 */
const generateToken = (user) => {
  const isStaffOrAdmin = [
    "⚡ god_admin",
    "👑 super_admin",
    "🛡️ admin",
    "⚜️ support_manager",
    "⚙️ support_agent",
    "🤖 ai_reviewer",
    "📊 analytics_manager",
    "📁 organization_manager"
  ].includes(user.role);

  // 10 minutes for normal users, 30 days for admin/staff
  const expiresIn = isStaffOrAdmin ? "30d" : "10m";

  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn,
    }
  );
};

// @desc    Send 6-digit OTP verification code to email (Signup validation)
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email address is required", 400));
  }

  // Check if user already exists with this email
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError("User with this email already exists", 400));
  }

  // Generate 6-digit random code
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP in database (Delete old ones for the same email first)
  await Otp.deleteMany({ email });
  await Otp.create({
    email,
    otp: generatedOtp,
  });

  // Log to console for development verification (50s validity)
  console.log(`\n📨 [OTP SIGNUP LOG] Code for ${email} is: ${generatedOtp} (Valid for 50 seconds)\n`);

  // Send email (triggers real sending or console logging fallback)
  await sendEmail({
    to: email,
    subject: "Verify Your Account - SupportSphere AI Registration",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #334155; border-radius: 10px; background-color: #0F172A; color: #F8FAFC;">
        <h2 style="color: #2563EB; font-weight: bold; margin-bottom: 20px;">Welcome to SupportSphere AI</h2>
        <p style="font-size: 14px; color: #CBD5E1;">Thank you for registering. Use the 6-digit verification code below to verify your email address:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; text-align: center; margin: 30px 0; color: #22D3EE;">${generatedOtp}</div>
        <p style="font-size: 11px; color: #64748B;">This code is valid for exactly 50 seconds and cannot be reused.</p>
      </div>
    `,
    text: `Your SupportSphere AI verification code is: ${generatedOtp}. It is valid for exactly 50 seconds.`
  });

  sendSuccess(res, "Verification code sent successfully. Check your email or local server console!", { email });
});

// @desc    Register a new user (with OTP verification)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, phoneNumber, otp, isOAuth } = req.body;

  if (!isOAuth && !otp) {
    return next(new AppError("Verification OTP code is required", 400));
  }

  // 1. Verify OTP first (only if not OAuth)
  if (!isOAuth) {
    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });
    if (!otpRecord || otpRecord.otp !== otp) {
      return next(new AppError("Invalid or expired verification code (50s limit)", 400));
    }
  }

  // 2. Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    if (isOAuth) {
      // For OAuth, if account already exists, log them in directly
      const token = generateToken(userExists);
      return sendSuccess(res, "User authenticated via social identity", {
        token,
        user: {
          id: userExists._id,
          name: userExists.name,
          email: userExists.email,
          role: userExists.role,
          avatar: userExists.avatar,
        },
      });
    }
    return next(new AppError("User with this email already exists", 400));
  }

  // 3. Create new user — SECURITY FIX: Role is hardcoded to '📁 verified_user' to prevent escalation
  const user = await User.create({
    name,
    email,
    password: password || Math.random().toString(36).substring(2, 12) + "A!", // secure dummy password
    role: "📁 verified_user",
    phoneNumber: phoneNumber || "",
    isVerified: true, // Mark verified after valid OTP match or OAuth
  });

  if (user) {
    // Clean up used OTP record (if not OAuth)
    if (!isOAuth) {
      await Otp.deleteMany({ email });
    }

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

// @desc    Authenticate user & check password (Initiate 2FA check)
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and password are required", 400));
  }

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

  // Generate 2FA code (50s validity)
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save to OTP database
  await Otp.deleteMany({ email });
  await Otp.create({
    email,
    otp: generatedOtp,
  });

  // Log to console for local testing
  console.log(`\n📨 [OTP 2FA LOGIN LOG] Code for ${email} is: ${generatedOtp} (Valid for 50 seconds)\n`);

  // Send 2FA email
  await sendEmail({
    to: email,
    subject: "2-Factor Authentication Code - SupportSphere AI Login",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #334155; border-radius: 10px; background-color: #0F172A; color: #F8FAFC;">
        <h2 style="color: #7C3AED; font-weight: bold; margin-bottom: 20px;">2-Factor Security Challenge</h2>
        <p style="font-size: 14px; color: #CBD5E1;">A sign-in request was made to your account. Use this security verification code to complete your login:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; text-align: center; margin: 30px 0; color: #C084FC;">${generatedOtp}</div>
        <p style="font-size: 11px; color: #64748B;">This code is valid for exactly 50 seconds. If you did not initiate this login request, please change your password immediately.</p>
      </div>
    `,
    text: `Your SupportSphere AI 2-Factor Authentication code is: ${generatedOtp}. It is valid for exactly 50 seconds.`
  });

  sendSuccess(res, "Credentials verified. Two-factor authentication code sent to email or local console.", {
    requires2FA: true,
    email: user.email,
    phoneNumber: user.phoneNumber || null,
  });
});

// @desc    Verify 2FA OTP & complete login
// @route   POST /api/auth/verify-2fa
// @access  Public
const verify2Fa = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new AppError("Email and OTP code are required", 400));
  }

  // 1. Verify 2FA OTP code
  const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });
  if (!otpRecord || otpRecord.otp !== otp) {
    return next(new AppError("Invalid or expired 2FA verification code (50s limit)", 400));
  }

  // 2. Fetch User profile
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User account not found", 404));
  }

  // Check status
  if (user.status === "suspended") {
    return next(new AppError("Your account has been suspended. Please contact admin.", 403));
  }

  // 3. Clean up OTP
  await Otp.deleteMany({ email });

  // 4. Update lastLogin timestamp
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // 5. Generate appropriate session duration JWT token
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

// @desc    Forgot Password - Request reset verification code
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email address is required", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("No account found with this email address", 404));
  }

  // Generate 6-digit random code (50s validity)
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store in Otp database
  await Otp.deleteMany({ email });
  await Otp.create({
    email,
    otp: generatedOtp,
  });

  // Log to console for development verification
  console.log(`\n📨 [OTP PASSWORD RESET LOG] Code for ${email} is: ${generatedOtp} (Valid for 50 seconds)\n`);

  // Send reset email
  await sendEmail({
    to: email,
    subject: "Reset Your Password - SupportSphere AI",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #334155; border-radius: 10px; background-color: #0F172A; color: #F8FAFC;">
        <h2 style="color: #EF4444; font-weight: bold; margin-bottom: 20px;">Password Reset Request</h2>
        <p style="font-size: 14px; color: #CBD5E1;">We received a request to reset your password. Use the following code to complete the recovery process:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; text-align: center; margin: 30px 0; color: #FCA5A5;">${generatedOtp}</div>
        <p style="font-size: 11px; color: #64748B;">This code is valid for exactly 50 seconds. If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `,
    text: `Your SupportSphere AI password recovery code is: ${generatedOtp}. It is valid for exactly 50 seconds.`
  });

  sendSuccess(res, "Password reset verification code sent successfully.", { email });
});

// @desc    Reset Password - Verify code and update password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return next(new AppError("Email, verification code, and new password are required", 400));
  }

  // 1. Verify OTP code
  const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });
  if (!otpRecord || otpRecord.otp !== otp) {
    return next(new AppError("Invalid or expired verification code (50s limit)", 400));
  }

  // 2. Fetch User profile
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User account not found", 404));
  }

  // 3. Update password (hashes automatically via pre-save hook in User.js)
  user.password = newPassword;
  await user.save();

  // 4. Clean up OTP
  await Otp.deleteMany({ email });

  sendSuccess(res, "Password reset successfully. You can now sign in with your new password.", null);
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
  sendOtp,
  registerUser,
  loginUser,
  verify2Fa,
  forgotPassword,
  resetPassword,
  getUserProfile,
};
