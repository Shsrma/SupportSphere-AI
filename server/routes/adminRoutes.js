const express = require("express");
const router = express.Router();

const { getStaffMembers, getAnalytics } = require("../controllers/adminController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// All admin routes require JWT verification
router.use(protect);

// @route   GET /api/admin/staff - Retrieve administrative staff (Admins and Support)
router.get("/staff", authorizeRoles("admin", "support"), getStaffMembers);

// @route   GET /api/admin/analytics - System-wide performance and metrics reports
router.get("/analytics", authorizeRoles("admin"), getAnalytics);

module.exports = router;
