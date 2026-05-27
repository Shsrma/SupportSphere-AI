/**
 * CLI Script to create specific Super Admin user account
 * Usage: node createSpecificUser.js
 */

require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/support_sphere";

const userData = {
  name: "Ankur Sharma",
  email: "sharma20sep2003@outlook.com",
  password: "A7192S@#as*",
  role: "⚡ god_admin",
  phoneNumber: "9414407192",
  isVerified: true,
  status: "active"
};

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("🔌 Connected to database...");
    
    // Clear any existing records for this email
    await User.deleteMany({ email: userData.email.toLowerCase().trim() });
    console.log("🧹 Cleared existing profile matching this email.");

    // Create the specific account (Mongoose pre-save automatically hashes the password)
    const newUser = await User.create(userData);
    
    console.log("\n✅ Success: Account created successfully!");
    console.log(`👤 Name:  ${newUser.name}`);
    console.log(`📧 Email: ${newUser.email}`);
    console.log(`👑 Role:  ${newUser.role}`);
    console.log(`📱 Phone: ${newUser.phoneNumber}`);
    
    mongoose.disconnect();
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err.message);
    process.exit(1);
  });
