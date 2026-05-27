const User = require("../models/User");
const Ticket = require("../models/Ticket");
const AppError = require("../utils/errorUtils");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHelper");

// @desc    Get all staff members (Admins and Support staff)
// @route   GET /api/admin/staff
// @access  Private (Admin & Support only)
const getStaffMembers = asyncHandler(async (req, res, next) => {
  if (["📁 verified_user", "🔹 guest_user"].includes(req.user.role)) {
    return next(new AppError("Not authorized to view staff list", 403));
  }

  const staff = await User.find({
    role: { $in: ["⚡ god_admin", "👑 super_admin", "🛡️ admin", "⚜️ support_manager", "⚙️ support_agent", "🤖 ai_reviewer", "📊 analytics_manager", "📁 organization_manager"] },
    status: "active",
  }).select("name email role");

  sendSuccess(res, "Staff list retrieved successfully", staff);
});

// @desc    Get system-wide analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
const getAnalytics = asyncHandler(async (req, res, next) => {
  if (!["⚡ god_admin", "👑 super_admin", "🛡️ admin", "📊 analytics_manager"].includes(req.user.role)) {
    return next(new AppError("Not authorized to view system analytics", 403));
  }

  // 1. Status aggregates
  const total = await Ticket.countDocuments();
  const resolved = await Ticket.countDocuments({ status: "resolved" });
  const pending = await Ticket.countDocuments({ status: "pending" });
  const inProgress = await Ticket.countDocuments({ status: "in_progress" });
  const closed = await Ticket.countDocuments({ status: "closed" });

  // 2. Average resolution time (in hours)
  const resolvedTickets = await Ticket.find({ 
    status: { $in: ["resolved", "closed"] }, 
    resolvedAt: { $ne: null } 
  });
  
  let avgResolutionTime = 0;
  if (resolvedTickets.length > 0) {
    const totalDuration = resolvedTickets.reduce((acc, t) => {
      return acc + (new Date(t.resolvedAt) - new Date(t.createdAt));
    }, 0);
    // Convert ms to hours and round
    avgResolutionTime = Math.round((totalDuration / resolvedTickets.length / (1000 * 60 * 60)) * 10) / 10;
  }

  // 3. Category distribution count
  const categoryAgg = await Ticket.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  const categoryStats = {
    technical: 0,
    hostel: 0,
    academic: 0,
    administrative: 0,
    security: 0,
    other: 0,
  };

  categoryAgg.forEach((item) => {
    if (item._id in categoryStats) {
      categoryStats[item._id] = item.count;
    }
  });

  // 4. Monthly trends (grouped by year/month)
  const monthlyAgg = await Ticket.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
        resolved: {
          $sum: {
            $cond: [
              { $in: ["$status", ["resolved", "closed"]] },
              1,
              0
            ]
          }
        }
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    { $limit: 6 } // show last 6 active months
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyStats = monthlyAgg.map((item) => ({
    month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    tickets: item.count,
    resolved: item.resolved,
  }));

  sendSuccess(res, "Analytics compiled successfully", {
    kpis: {
      total,
      resolved,
      pending: pending + inProgress,
      closed,
      avgResolutionTime, // in hours
    },
    categoryStats,
    monthlyStats,
  });
});

// @desc    Update a user's role (Promote / Demote)
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
const updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  if (!["⚡ god_admin", "👑 super_admin", "🛡️ admin"].includes(req.user.role)) {
    return next(new AppError("Only administrators can update user roles", 403));
  }

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

  if (!role || !validRoles.includes(role)) {
    return next(new AppError("Please provide a valid role with symbol", 400));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Prevent admin from demoting themselves by accident
  if (user._id.toString() === req.user._id.toString() && !["⚡ god_admin", "👑 super_admin", "🛡️ admin"].includes(role)) {
    return next(new AppError("You cannot demote yourself from the admin role", 400));
  }

  // If the target is the God Admin, enforce strict protection rules
  if (user.role === "⚡ god_admin") {
    if (req.user.role !== "⚡ god_admin") {
      return next(new AppError("Only the God Admin can modify God Admin permissions or roles", 403));
    }
    
    // Even if they attempt to change their own role, they still remain God Admin
    user.role = "⚡ god_admin";
  } else {
    // If promoting someone to God Admin, only the current God Admin can do it
    if (role === "⚡ god_admin" && req.user.role !== "⚡ god_admin") {
      return next(new AppError("Only the God Admin can create another God Admin", 403));
    }
    user.role = role;
  }

  await user.save();

  sendSuccess(res, `User role updated successfully`, {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

module.exports = {
  getStaffMembers,
  getAnalytics,
  updateUserRole,
};
