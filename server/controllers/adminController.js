const User = require("../models/User");
const Ticket = require("../models/Ticket");
const AppError = require("../utils/errorUtils");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHelper");

// Symbolic Role Hierarchy (index 0 = highest, index 9 = lowest)
const roleHierarchy = [
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

const getRoleRank = (roleName) => {
  const index = roleHierarchy.indexOf(roleName);
  return index === -1 ? 999 : index;
};

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

  if (!role || !roleHierarchy.includes(role)) {
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

  // God Admin bypass
  if (req.user.role === "⚡ god_admin") {
    user.role = role;
  } else {
    // Non-god admin hierarchy checks
    const requesterRank = getRoleRank(req.user.role);
    const targetCurrentRank = getRoleRank(user.role);
    const targetNewRank = getRoleRank(role);

    // 1. Can only change role of users strictly BELOW them in the hierarchy
    if (targetCurrentRank <= requesterRank) {
      return next(new AppError("You can only modify roles of users strictly below you in privilege", 403));
    }

    // 2. Cannot assign a role that is higher or equal to their own role
    if (targetNewRank <= requesterRank) {
      return next(new AppError("You cannot promote a user to your rank or above", 403));
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

// @desc    Get all users in the system
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = asyncHandler(async (req, res, next) => {
  if (!["⚡ god_admin", "👑 super_admin", "🛡️ admin"].includes(req.user.role)) {
    return next(new AppError("Not authorized to view user list", 403));
  }

  let users = await User.find({}).select("name email role status");

  // Filter based on role hierarchy: non-god admins can only see users equal or below them
  if (req.user.role !== "⚡ god_admin") {
    const requesterRank = getRoleRank(req.user.role);
    users = users.filter((u) => getRoleRank(u.role) >= requesterRank);
  }

  sendSuccess(res, "User list retrieved successfully", users);
});

module.exports = {
  getStaffMembers,
  getAnalytics,
  updateUserRole,
  getAllUsers,
};
