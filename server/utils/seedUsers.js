/**
 * CLI Script to seed 10 dummy test users with symbolic roles in MongoDB
 * Usage: node seedUsers.js
 */

require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/support_sphere";

const dummyUsers = [
  {
    name: "Super Admin User",
    email: "superadmin@supportsphere.ai",
    password: "TestPass123!",
    role: "👑 super_admin",
    isVerified: true
  },
  {
    name: "Admin User",
    email: "admin@supportsphere.ai",
    password: "TestPass123!",
    role: "🛡️ admin",
    isVerified: true
  },
  {
    name: "Support Manager User",
    email: "supportmanager@supportsphere.ai",
    password: "TestPass123!",
    role: "⚜️ support_manager",
    isVerified: true
  },
  {
    name: "Support Agent User",
    email: "supportagent@supportsphere.ai",
    password: "TestPass123!",
    role: "⚙️ support_agent",
    isVerified: true
  },
  {
    name: "AI Reviewer User",
    email: "aireviewer@supportsphere.ai",
    password: "TestPass123!",
    role: "🤖 ai_reviewer",
    isVerified: true
  },
  {
    name: "Analytics Manager User",
    email: "analytics@supportsphere.ai",
    password: "TestPass123!",
    role: "📊 analytics_manager",
    isVerified: true
  },
  {
    name: "Organization Manager User",
    email: "orgmanager@supportsphere.ai",
    password: "TestPass123!",
    role: "📁 organization_manager",
    isVerified: true
  },
  {
    name: "Verified User One",
    email: "user1@supportsphere.ai",
    password: "TestPass123!",
    role: "📁 verified_user",
    isVerified: true
  },
  {
    name: "Verified User Two",
    email: "user2@supportsphere.ai",
    password: "TestPass123!",
    role: "📁 verified_user",
    isVerified: true
  },
  {
    name: "Guest User",
    email: "guest@supportsphere.ai",
    password: "TestPass123!",
    role: "🔹 guest_user",
    isVerified: true
  }
];

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("🔌 Connected to database...");
    
    // Clear existing dummy test users first to prevent conflicts
    const emails = dummyUsers.map(u => u.email);
    await User.deleteMany({ email: { $in: emails } });
    console.log("🧹 Cleaned old dummy user records.");

    // Create new users (Mongoose pre-save middleware will automatically hash 'TestPass123!')
    for (const userData of dummyUsers) {
      await User.create(userData);
      console.log(`👤 Created user: ${userData.name} (${userData.email}) with role: "${userData.role}"`);
    }

    console.log("\n✅ Success: 10 dummy test users seeded successfully!");
    mongoose.disconnect();
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err.message);
    process.exit(1);
  });
