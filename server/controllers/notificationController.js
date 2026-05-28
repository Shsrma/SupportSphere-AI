const Notification = require("../models/Notification");
const AppError = require("../utils/errorUtils");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHelper");

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate("sender", "name role avatar")
    .populate("ticketId", "title")
    .sort({ createdAt: -1 })
    .limit(50); // limit to last 50 alerts

  sendSuccess(res, "Notifications retrieved successfully", notifications);
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    return next(new AppError("Notification not found or access denied", 404));
  }

  notification.isRead = true;
  await notification.save();

  sendSuccess(res, "Notification marked as read", notification);
});

// @desc    Mark all user's notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  sendSuccess(res, "All notifications marked as read", null);
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
