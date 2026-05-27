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
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 50, // MongoDB TTL: document will automatically expire and delete after 50 seconds
    },
  },
  {
    timestamps: false,
  }
);

// Indexing for faster lookups
otpSchema.index({ email: 1 });

const Otp = mongoose.model("Otp", otpSchema);

module.exports = Otp;
