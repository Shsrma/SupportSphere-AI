const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");
const Otp = require("../models/Otp");

// Mock external services to prevent side effects
jest.mock("../services/emailService", () => jest.fn().mockResolvedValue({ success: true }));
jest.mock("../services/smsService", () => ({
  sendSms: jest.fn().mockResolvedValue({ success: true }),
  isSmsConfigured: false,
}));

beforeAll(async () => {
  process.env.JWT_SECRET = "test_jwt_secret_key_for_supportsphere_ai";
  const mongoUri = "mongodb://127.0.0.1:27017/support_sphere_test";
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Otp.deleteMany({});
});

describe("Authentication API Endpoints", () => {
  const testEmail = "testuser@domain.com";
  const testPassword = "Password123!";
  const testName = "Test User";

  describe("POST /api/auth/send-otp", () => {
    it("should send a 6-digit OTP code to the provided email", async () => {
      const res = await request(app)
        .post("/api/auth/send-otp")
        .send({ email: testEmail });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("Verification code sent");

      // Verify OTP was stored in the database
      const otpRecord = await Otp.findOne({ email: testEmail });
      expect(otpRecord).toBeDefined();
      expect(otpRecord.otp).toHaveLength(6);
    });

    it("should return 400 if user with email already exists", async () => {
      await User.create({
        name: testName,
        email: testEmail,
        password: testPassword,
        role: "📁 verified_user",
        isVerified: true,
      });

      const res = await request(app)
        .post("/api/auth/send-otp")
        .send({ email: testEmail });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user when given a valid email verification OTP", async () => {
      // Step 1: Request OTP
      await request(app)
        .post("/api/auth/send-otp")
        .send({ email: testEmail });

      const otpRecord = await Otp.findOne({ email: testEmail });
      const validOtp = otpRecord.otp;

      // Step 2: Register user using OTP
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: testName,
          email: testEmail,
          password: testPassword,
          phoneNumber: "+919876543210",
          otp: validOtp,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testEmail);
      expect(res.body.data.user.role).toBe("📁 verified_user");
      expect(res.body.data.token).toBeDefined();

      // Verify user exists in DB
      const user = await User.findOne({ email: testEmail });
      expect(user).toBeDefined();
      expect(user.isVerified).toBe(true);
    });

    it("should reject registration with invalid or expired OTP", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: testName,
          email: testEmail,
          password: testPassword,
          otp: "000000",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Register user for login tests
      await User.create({
        name: testName,
        email: testEmail,
        password: testPassword,
        role: "📁 verified_user",
        isVerified: true,
      });
    });

    it("should verify credentials and send a 2FA OTP code", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.requires2FA).toBe(true);
      expect(res.body.data.email).toBe(testEmail);

      // Verify 2FA OTP stored in database
      const otpRecord = await Otp.findOne({ email: testEmail });
      expect(otpRecord).toBeDefined();
    });

    it("should reject login with incorrect credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail,
          password: "WrongPassword!",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/verify-2fa", () => {
    beforeEach(async () => {
      await User.create({
        name: testName,
        email: testEmail,
        password: testPassword,
        role: "📁 verified_user",
        isVerified: true,
      });
    });

    it("should complete login and issue JWT token with valid 2FA OTP", async () => {
      const testOtp = "123456";
      await Otp.create({
        email: testEmail,
        otp: testOtp,
      });

      const res = await request(app)
        .post("/api/auth/verify-2fa")
        .send({
          email: testEmail,
          otp: testOtp,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(testEmail);
    });

    it("should reject verification with incorrect 2FA OTP", async () => {
      await Otp.create({
        email: testEmail,
        otp: "111111",
      });

      const res = await request(app)
        .post("/api/auth/verify-2fa")
        .send({
          email: testEmail,
          otp: "222222",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
