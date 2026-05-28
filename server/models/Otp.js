const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: [true, "OTP code is required"],
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes validity
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for faster lookups and automatic expiration cleanup
otpSchema.index({ email: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.model("Otp", otpSchema);

module.exports = Otp;
