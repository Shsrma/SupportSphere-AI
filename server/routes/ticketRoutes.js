const express = require("express");
const router = express.Router();

const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  addComment,
  getComments,
} = require("../controllers/ticketController");

const {
  createTicketValidator,
  updateTicketStatusValidator,
  createCommentValidator,
} = require("../validators/ticketValidator");

const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const upload = require("../middleware/upload");

// All routes here are protected by JWT Auth
router.use(protect);

// @route   POST /api/tickets - Create a ticket (with optional file uploads)
// @route   GET /api/tickets - Get all tickets
router
  .route("/")
  .post(upload.array("attachments", 5), createTicketValidator, validate, createTicket)
  .get(getTickets);

// @route   GET /api/tickets/:id - Get ticket detail
// @route   PUT /api/tickets/:id - Update ticket
// @route   DELETE /api/tickets/:id - Delete ticket
router
  .route("/:id")
  .get(getTicketById)
  .put(updateTicket)
  .delete(deleteTicket);

// @route   POST /api/tickets/:id/comments - Add comment (with optional file uploads)
// @route   GET /api/tickets/:id/comments - Get comments
router
  .route("/:id/comments")
  .post(upload.array("attachments", 2), createCommentValidator, validate, addComment)
  .get(getComments);

module.exports = router;
