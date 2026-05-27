const express = require("express");
const router = express.Router();

const { getStaffMembers, getAnalytics, updateUserRole } = require("../controllers/adminController");
const protect = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// All admin routes require JWT verification
router.use(protect);

// @route   GET /api/admin/staff - Retrieve administrative staff (Admins and Support)
router.get(
  "/staff", 
  authorizeRoles("👑 super_admin", "🛡️ admin", "⚜️ support_manager", "⚙️ support_agent"), 
  getStaffMembers
);

// @route   GET /api/admin/analytics - System-wide performance and metrics reports
router.get(
  "/analytics", 
  authorizeRoles("👑 super_admin", "🛡️ admin", "📊 analytics_manager"), 
  getAnalytics
);

// @route   PUT /api/admin/users/:id/role - Promote/demote a user
router.put(
  "/users/:id/role", 
  authorizeRoles("👑 super_admin", "🛡️ admin"), 
  updateUserRole
);

module.exports = router;
