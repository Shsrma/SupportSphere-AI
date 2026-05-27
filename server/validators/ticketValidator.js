const { body } = require("express-validator");

const createTicketValidator = [
  body("title")
    .notEmpty()
    .withMessage("Ticket title is required")
    .trim()
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),
  body("description")
    .notEmpty()
    .withMessage("Ticket description is required")
    .trim(),
  body("category")
    .optional()
    .isIn(["technical", "hostel", "academic", "administrative", "security", "other"])
    .withMessage("Invalid category selection"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Invalid priority selection"),
];

const updateTicketStatusValidator = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["pending", "in_progress", "resolved", "closed"])
    .withMessage("Invalid status value"),
];

const updateTicketAssignmentValidator = [
  body("assignedTo")
    .notEmpty()
    .withMessage("Assignee ID is required")
    .isMongoId()
    .withMessage("Invalid assignee User ID"),
];

const createCommentValidator = [
  body("message")
    .notEmpty()
    .withMessage("Comment message cannot be empty")
    .trim(),
];

module.exports = {
  createTicketValidator,
  updateTicketStatusValidator,
  updateTicketAssignmentValidator,
  createCommentValidator,
};
