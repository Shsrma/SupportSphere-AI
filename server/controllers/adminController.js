const User = require("../models/User");
const Ticket = require("../models/Ticket");
const AppError = require("../utils/errorUtils");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHelper");

// @desc    Get all staff members (Admins and Support staff)
// @route   GET /api/admin/staff
// @access  Private (Admin & Support only)
const getStaffMembers = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") {
    return next(new AppError("Not authorized to view staff list", 403));
  }

  const staff = await User.find({
    role: { $in: ["admin", "support"] },
    status: "active",
  }).select("name email role");

  sendSuccess(res, "Staff list retrieved successfully", staff);
});

// @desc    Get system-wide analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
const getAnalytics = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
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

module.exports = {
  getStaffMembers,
  getAnalytics,
};
