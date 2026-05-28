const Ticket = require("../models/Ticket");
const Comment = require("../models/Comment");
const User = require("../models/User");
const Notification = require("../models/Notification");
const AppError = require("../utils/errorUtils");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHelper");
const { analyzeTicket } = require("../services/geminiService");
const { uploadToCloudinary } = require("../services/cloudinaryService");

// @desc    Create a new support ticket
// @route   POST /api/tickets
// @access  Private (All authenticated users)
const createTicket = asyncHandler(async (req, res, next) => {
  const { title, description, category, priority } = req.body;

  // Process uploaded file paths if present
  let attachmentPaths = [];
  const filesToProcess = req.files && req.files.length > 0 ? req.files : (req.file ? [req.file] : []);

  for (const file of filesToProcess) {
    let fileUrl = await uploadToCloudinary(file.path);
    if (!fileUrl) {
      fileUrl = `/uploads/${file.filename}`;
    }
    attachmentPaths.push(fileUrl);
  }

  // Trigger Gemini AI Analysis
  const aiResult = await analyzeTicket(title, description);

  // Map fields, allowing user overrides for category/priority, otherwise falling back to AI predictions
  const ticketData = {
    title,
    description,
    category: category || aiResult.category,
    priority: priority || aiResult.priority,
    aiSummary: aiResult.summary,
    aiSuggestion: aiResult.suggestion,
    createdBy: req.user._id,
    attachments: attachmentPaths,
  };

  // Create ticket in database
  const ticket = await Ticket.create(ticketData);

  // Notify administrative and support staff about the new ticket
  try {
    const staffMembers = await User.find({
      role: { $in: ["⚡ god_admin", "👑 super_admin", "🛡️ admin", "⚜️ support_manager", "⚙️ support_agent", "🤖 ai_reviewer"] }
    });
    for (const staff of staffMembers) {
      await Notification.create({
        recipient: staff._id,
        sender: req.user._id,
        ticketId: ticket._id,
        type: "ticket_created",
        message: `New ticket created: "${ticket.title}" by ${req.user.name}`,
      });
    }
  } catch (err) {
    console.error("Failed to generate ticket creation notifications:", err);
  }

  sendSuccess(res, "Ticket created successfully", ticket, 201);
});

// @desc    Get all tickets (Users get own, Admin/Support get all with filter/search/page)
// @route   GET /api/tickets
// @access  Private
const getTickets = asyncHandler(async (req, res, next) => {
  const { status, category, priority, search, page = 1, limit = 10 } = req.query;

  // Initialize query filters
  let query = {};

  // Enforce role-based viewing boundaries (include tickets where user is a creator or collaborator)
  if (req.user.role === "📁 verified_user" || req.user.role === "🔹 guest_user") {
    query.$or = [
      { createdBy: req.user._id },
      { collaborators: req.user._id }
    ];
  }

  // Filter conditions
  if (status) query.status = status;
  if (category) query.category = category;
  if (priority) query.priority = priority;

  // Search keyword check (looks in title or description)
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Calculate pagination parameters
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skipNum = (pageNum - 1) * limitNum;

  // Execute database query
  const tickets = await Ticket.find(query)
    .populate("createdBy", "name email role avatar")
    .populate("assignedTo", "name email role avatar")
    .sort({ createdAt: -1 })
    .skip(skipNum)
    .limit(limitNum);

  const totalTickets = await Ticket.countDocuments(query);

  sendSuccess(res, "Tickets retrieved successfully", {
    tickets,
    pagination: {
      total: totalTickets,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(totalTickets / limitNum),
    },
  });
});

// @desc    Get a single ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
const getTicketById = asyncHandler(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate("createdBy", "name email role avatar")
    .populate("collaborators", "name email role avatar")
    .populate("assignedTo", "name email role avatar");

  if (!ticket) {
    return next(new AppError("Ticket not found", 404));
  }

  // Enforce resource protection boundaries (allow creators and collaborators)
  if (
    ["📁 verified_user", "🔹 guest_user"].includes(req.user.role) &&
    ticket.createdBy._id.toString() !== req.user._id.toString() &&
    !ticket.collaborators.some((c) => c._id.toString() === req.user._id.toString())
  ) {
    return next(new AppError("Not authorized to view this ticket", 403));
  }

  sendSuccess(res, "Ticket retrieved successfully", ticket);
});

// @desc    Update ticket details (status, priority, assignment)
// @route   PUT /api/tickets/:id
// @access  Private (Admin & Support Staff only)
const updateTicket = asyncHandler(async (req, res, next) => {
  const { title, description, category, priority, status, assignedTo } = req.body;
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    return next(new AppError("Ticket not found", 404));
  }

  const originalStatus = ticket.status;
  const originalAssignedTo = ticket.assignedTo ? ticket.assignedTo.toString() : null;

  const isCreator = ticket.createdBy.toString() === req.user._id.toString();
  const isAdminOrSupport = !["📁 verified_user", "🔹 guest_user"].includes(req.user.role);

  // If standard user, they can only edit their OWN tickets (or tickets they collaborate on)
  if (!isAdminOrSupport) {
    const isCollaborator = ticket.collaborators && ticket.collaborators.some(c => c.toString() === req.user._id.toString());
    if (!isCreator && !isCollaborator) {
      return next(new AppError("Not authorized to modify this ticket", 403));
    }

    // Standard users can only update title, description, category, priority, and status (if setting to resolved/closed)
    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (category) ticket.category = category;
    if (priority) ticket.priority = priority;

    if (status) {
      if (["resolved", "closed"].includes(status)) {
        ticket.status = status;
        if (status === "resolved") {
          ticket.resolvedAt = new Date();
        }
      } else {
        return next(new AppError("Standard users can only change ticket status to resolved or closed", 403));
      }
    }
  } else {
    // Admins and Support staff can update status, priority, assignment, or general fields
    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (category) ticket.category = category;
    if (priority) ticket.priority = priority;
    
    if (status) {
      ticket.status = status;
      if (status === "resolved") {
        ticket.resolvedAt = new Date();
      }
    }
    if (assignedTo !== undefined) {
      ticket.assignedTo = assignedTo === "" ? null : assignedTo;
    }
  }

  const updatedTicket = await ticket.save();

  // Create notifications for updates
  try {
    // 1. If status changed, notify creator and collaborators
    if (status && originalStatus !== status) {
      const recipients = new Set([ticket.createdBy.toString()]);
      if (ticket.collaborators && ticket.collaborators.length > 0) {
        ticket.collaborators.forEach(c => recipients.add(c.toString()));
      }
      recipients.delete(req.user._id.toString());

      for (const recipientId of recipients) {
        await Notification.create({
          recipient: recipientId,
          sender: req.user._id,
          ticketId: ticket._id,
          type: "status_updated",
          message: `Ticket status updated to "${status.replace("_", " ")}" by ${req.user.name}`,
        });
      }
    }

    // 2. If assignment changed, notify new assignee
    if (assignedTo !== undefined) {
      const newAssignedStr = assignedTo === "" ? null : assignedTo.toString();
      if (originalAssignedTo !== newAssignedStr && newAssignedStr) {
        await Notification.create({
          recipient: newAssignedStr,
          sender: req.user._id,
          ticketId: ticket._id,
          type: "status_updated",
          message: `You have been assigned to ticket: "${ticket.title}" by ${req.user.name}`,
        });
      }
    }
  } catch (err) {
    console.error("Failed to generate update notifications:", err);
  }

  // Populate references for return
  await updatedTicket.populate([
    { path: "createdBy", select: "name email role avatar" },
    { path: "assignedTo", select: "name email role avatar" }
  ]);

  sendSuccess(res, "Ticket updated successfully", updatedTicket);
});

// @desc    Delete a ticket (Hard delete)
// @route   DELETE /api/tickets/:id
// @access  Private (Admin only)
const deleteTicket = asyncHandler(async (req, res, next) => {
  if (!["⚡ god_admin", "👑 super_admin", "🛡️ admin"].includes(req.user.role)) {
    return next(new AppError("Only administrators are permitted to delete tickets", 403));
  }

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    return next(new AppError("Ticket not found", 404));
  }

  // Remove the ticket
  await Ticket.findByIdAndDelete(req.params.id);

  // Delete all comments associated with this ticket
  await Comment.deleteMany({ ticketId: req.params.id });

  sendSuccess(res, "Ticket and its conversation deleted successfully", null);
});

// @desc    Add a comment/reply to a ticket
// @route   POST /api/tickets/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res, next) => {
  const { message } = req.body;
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    return next(new AppError("Ticket not found", 404));
  }

  // Verify access authorization (allow creator and collaborators)
  if (
    ["📁 verified_user", "🔹 guest_user"].includes(req.user.role) &&
    ticket.createdBy.toString() !== req.user._id.toString() &&
    !ticket.collaborators.some((c) => c.toString() === req.user._id.toString())
  ) {
    return next(new AppError("Not authorized to reply to this ticket", 403));
  }

  // Process attachments for comments
  let commentAttachments = [];
  const commentFiles = req.files && req.files.length > 0 ? req.files : (req.file ? [req.file] : []);

  for (const file of commentFiles) {
    let fileUrl = await uploadToCloudinary(file.path);
    if (!fileUrl) {
      fileUrl = `/uploads/${file.filename}`;
    }
    commentAttachments.push(fileUrl);
  }

  const comment = await Comment.create({
    ticketId: req.params.id,
    userId: req.user._id,
    message,
    attachments: commentAttachments,
  });

  // Populate author details
  await comment.populate("userId", "name email role avatar");

  // Automatically mark ticket as 'in_progress' if support replies, or update timestamps
  if (!["📁 verified_user", "🔹 guest_user"].includes(req.user.role) && ticket.status === "pending") {
    ticket.status = "in_progress";
    await ticket.save();
  } else {
    // Save ticket anyway to update 'updatedAt' field
    await ticket.save();
  }

  // Notify recipients about the new comment (creator, collaborators, assignee)
  try {
    const recipients = new Set([ticket.createdBy.toString()]);
    if (ticket.collaborators && ticket.collaborators.length > 0) {
      ticket.collaborators.forEach(c => recipients.add(c.toString()));
    }
    if (ticket.assignedTo) {
      recipients.add(ticket.assignedTo.toString());
    }
    recipients.delete(req.user._id.toString());

    for (const recipientId of recipients) {
      await Notification.create({
        recipient: recipientId,
        sender: req.user._id,
        ticketId: ticket._id,
        type: "comment_added",
        message: `New reply added by ${req.user.name} on ticket: "${ticket.title}"`,
      });
    }
  } catch (err) {
    console.error("Failed to generate comment notifications:", err);
  }

  sendSuccess(res, "Comment added successfully", comment, 201);
});

// @desc    Get comment thread for a ticket
// @route   GET /api/tickets/:id/comments
// @access  Private
const getComments = asyncHandler(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    return next(new AppError("Ticket not found", 404));
  }

  // Verify access authorization (allow creator and collaborators)
  if (
    ["📁 verified_user", "🔹 guest_user"].includes(req.user.role) &&
    ticket.createdBy.toString() !== req.user._id.toString() &&
    !ticket.collaborators.some((c) => c.toString() === req.user._id.toString())
  ) {
    return next(new AppError("Not authorized to view this ticket's comments", 403));
  }

  const comments = await Comment.find({ ticketId: req.params.id })
    .populate("userId", "name email role avatar")
    .sort({ createdAt: 1 }); // Oldest first (chronological thread)

  sendSuccess(res, "Comments retrieved successfully", comments);
});

// @desc    Add a collaborator to a ticket
// @route   POST /api/tickets/:id/collaborators
// @access  Private
const addCollaborator = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    return next(new AppError("Ticket not found", 404));
  }

  // Only the ticket creator or admins/support can add collaborators
  const isCreator = ticket.createdBy.toString() === req.user._id.toString();
  const isAdminOrSupport = !["📁 verified_user", "🔹 guest_user"].includes(req.user.role);

  if (!isCreator && !isAdminOrSupport) {
    return next(new AppError("Not authorized to add collaborators to this ticket", 403));
  }

  const targetUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (!targetUser) {
    return next(new AppError("User with this email not found", 404));
  }

  // Check if already a collaborator or the creator
  if (ticket.createdBy.toString() === targetUser._id.toString()) {
    return next(new AppError("User is already the creator of this ticket", 400));
  }

  if (ticket.collaborators.includes(targetUser._id)) {
    return next(new AppError("User is already a collaborator on this ticket", 400));
  }

  ticket.collaborators.push(targetUser._id);
  await ticket.save();

  // Create notification for the added collaborator
  try {
    await Notification.create({
      recipient: targetUser._id,
      sender: req.user._id,
      ticketId: ticket._id,
      type: "collaborator_added",
      message: `You have been added as a collaborator on ticket: "${ticket.title}" by ${req.user.name}`,
    });
  } catch (err) {
    console.error("Failed to generate collaborator notification:", err);
  }

  // Populate references for return
  await ticket.populate([
    { path: "createdBy", select: "name email role avatar" },
    { path: "assignedTo", select: "name email role avatar" },
    { path: "collaborators", select: "name email role avatar" }
  ]);

  sendSuccess(res, "Collaborator added successfully", ticket);
});

// @desc    Remove a collaborator from a ticket
// @route   DELETE /api/tickets/:id/collaborators/:userId
// @access  Private
const removeCollaborator = asyncHandler(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    return next(new AppError("Ticket not found", 404));
  }

  // Only the ticket creator or admins/support can remove collaborators
  const isCreator = ticket.createdBy.toString() === req.user._id.toString();
  const isAdminOrSupport = !["📁 verified_user", "🔹 guest_user"].includes(req.user.role);

  if (!isCreator && !isAdminOrSupport) {
    return next(new AppError("Not authorized to remove collaborators from this ticket", 403));
  }

  ticket.collaborators = ticket.collaborators.filter(c => c.toString() !== req.params.userId);
  await ticket.save();

  // Populate references for return
  await ticket.populate([
    { path: "createdBy", select: "name email role avatar" },
    { path: "assignedTo", select: "name email role avatar" },
    { path: "collaborators", select: "name email role avatar" }
  ]);

  sendSuccess(res, "Collaborator removed successfully", ticket);
});

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  addComment,
  getComments,
  addCollaborator,
  removeCollaborator,
};
