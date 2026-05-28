const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");

const User = require("../models/User");
const Passkey = require("../models/Passkey");
const Otp = require("../models/Otp");
const AppError = require("../utils/errorUtils");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHelper");
const jwt = require("jsonwebtoken");

// RP details for WebAuthn
const rpName = "SupportSphere AI";
const rpID = "localhost"; // Standard local RP ID
const origin = "http://localhost:5173"; // Frontend origin

// Helper to generate JWT token for verified passkey authentication
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

// @desc    Generate passkey registration options (for adding device credentials)
// @route   GET /api/passkey/register-options
// @access  Private
const getRegisterOptions = asyncHandler(async (req, res, next) => {
  const user = req.user;

  // Retrieve user's existing passkeys
  const existingPasskeys = await Passkey.find({ userId: user._id });

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: user._id.toString(),
    userName: user.email,
    userDisplayName: user.name,
    // Prevent registering same authenticator twice
    excludeCredentials: existingPasskeys.map((pk) => ({
      id: Buffer.from(pk.credentialID, "base64url"),
      type: "public-key",
      transports: pk.transports,
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
      // Allow internal platform keys (TouchID/FaceID/Hello) or security keys
    },
  });

  // Store registration challenge temporarily in Otp collection
  await Otp.deleteMany({ email: user.email });
  await Otp.create({
    email: user.email,
    otp: options.challenge, // Save challenge
  });

  sendSuccess(res, "Registration options generated", options);
});

// @desc    Verify passkey registration response (saving device credential)
// @route   POST /api/passkey/register-verify
// @access  Private
const verifyRegister = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const body = req.body;

  // Retrieve saved challenge
  const otpRecord = await Otp.findOne({ email: user.email }).sort({ createdAt: -1 });
  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    return next(new AppError("Registration challenge expired or not found. Try again.", 400));
  }

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: otpRecord.otp,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
  } catch (error) {
    console.error("Passkey verification error:", error);
    return next(new AppError(`Passkey registration failed: ${error.message}`, 400));
  }

  const { verified, registrationInfo } = verification;
  if (!verified || !registrationInfo) {
    return next(new AppError("Device registration verification failed.", 400));
  }

  const { credentialID, credentialPublicKey, counter, credentialDeviceType } = registrationInfo;

  // Save the new passkey credential linked to this user
  await Passkey.create({
    userId: user._id,
    credentialID: Buffer.from(credentialID).toString("base64url"),
    credentialPublicKey: Buffer.from(credentialPublicKey),
    counter,
    deviceType: credentialDeviceType || "Platform Authenticator",
  });

  // Clean up challenge
  await Otp.deleteMany({ email: user.email });

  sendSuccess(res, "Passkey device registered successfully!", null);
});

// @desc    Generate passkey authentication options (to verify credential challenge during login)
// @route   POST /api/passkey/login-options
// @access  Public
const getLoginOptions = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required to request passkey challenges", 400));
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return next(new AppError("Account not found with this email", 404));
  }

  const userPasskeys = await Passkey.find({ userId: user._id });
  if (userPasskeys.length === 0) {
    return next(new AppError("No passkey devices registered on this account", 400));
  }

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: userPasskeys.map((pk) => ({
      id: Buffer.from(pk.credentialID, "base64url"),
      type: "public-key",
      transports: pk.transports,
    })),
    userVerification: "preferred",
  });

  // Store login challenge temporarily in Otp collection
  await Otp.deleteMany({ email: user.email });
  await Otp.create({
    email: user.email,
    otp: options.challenge, // Save challenge
  });

  sendSuccess(res, "Login options generated", options);
});

// @desc    Verify passkey authentication response (complete login assertion)
// @route   POST /api/passkey/login-verify
// @access  Public
const verifyLogin = asyncHandler(async (req, res, next) => {
  const { email, credential } = req.body;

  if (!email || !credential) {
    return next(new AppError("Email and passkey credential response are required", 400));
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Retrieve saved challenge
  const otpRecord = await Otp.findOne({ email: user.email }).sort({ createdAt: -1 });
  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    return next(new AppError("Authentication challenge expired or not found.", 400));
  }

  // Retrieve the matching credential
  const parsedCredId = credential.id;
  const passkey = await Passkey.findOne({
    userId: user._id,
    credentialID: parsedCredId,
  });

  if (!passkey) {
    return next(new AppError("Registered device credential matching this ID not found.", 404));
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: otpRecord.otp,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: Buffer.from(passkey.credentialID, "base64url"),
        credentialPublicKey: passkey.credentialPublicKey,
        counter: passkey.counter,
        transports: passkey.transports,
      },
    });
  } catch (error) {
    console.error("Passkey authentication error:", error);
    return next(new AppError(`Biometric verification failed: ${error.message}`, 400));
  }

  const { verified, authenticationInfo } = verification;
  if (!verified || !authenticationInfo) {
    return next(new AppError("Device login verification failed.", 400));
  }

  // Update signature counter
  passkey.counter = authenticationInfo.newCounter;
  await passkey.save();

  // Clean up challenge
  await Otp.deleteMany({ email: user.email });

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Generate session token
  const token = generateToken(user);

  sendSuccess(res, "Biometric authentication successful", {
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

module.exports = {
  getRegisterOptions,
  verifyRegister,
  getLoginOptions,
  verifyLogin,
};
