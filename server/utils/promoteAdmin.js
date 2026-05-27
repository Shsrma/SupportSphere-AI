/**
 * CLI Script to promote a user to any role in MongoDB
 * Usage: node promoteAdmin.js <user-email> [role-name]
 * Example: node promoteAdmin.js test@example.com "👑 super_admin"
 */

require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");

const email = process.argv[2];
let role = process.argv[3];

const validRoles = [
  "⚡ god_admin",
  "👑 super_admin",
  "🛡️ admin",
  "⚜️ support_manager",
  "⚙️ support_agent",
  "🤖 ai_reviewer",
  "📊 analytics_manager",
  "📁 organization_manager",
  "📁 verified_user",
  "🔹 guest_user"
];

if (!email) {
  console.error("❌ Error: Please specify the email address of the account to promote.");
  console.log("Usage: node promoteAdmin.js example@email.com [role]");
  console.log("Available Roles:");
  validRoles.forEach(r => console.log(`  - "${r}"`));
  process.exit(1);
}

// Default to super_admin if not specified
if (!role) {
  role = "👑 super_admin";
  console.log(`ℹ️ No role specified. Defaulting to "${role}".`);
} else {
  // If user passed a role name without the symbol, auto-map it for convenience
  const matchedRole = validRoles.find(r => r.toLowerCase().includes(role.toLowerCase().trim()));
  if (matchedRole) {
    role = matchedRole;
  }
}

if (!validRoles.includes(role)) {
  console.error(`❌ Error: "${role}" is not a valid role.`);
  console.log("Available Roles:");
  validRoles.forEach(r => console.log(`  - "${r}"`));
  process.exit(1);
}

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/support_sphere";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("🔌 Connected to database...");
    
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      console.error(`❌ Error: User with email '${email}' not found in database.`);
      mongoose.disconnect();
      process.exit(1);
    }

    if (user.role === role) {
      console.log(`ℹ️ User '${user.name}' (${email}) already has the role "${role}".`);
      mongoose.disconnect();
      process.exit(0);
    }

    user.role = role;
    await user.save({ validateBeforeSave: false });

    console.log(`✅ Success: User '${user.name}' (${email}) has been successfully updated to "${role}".`);
    
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err.message);
    process.exit(1);
  });
