const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Ticket title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Ticket description is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: ["technical", "hostel", "academic", "administrative", "security", "other"],
        message: "{VALUE} is not a valid category",
      },
      default: "other",
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high", "critical"],
        message: "{VALUE} is not a valid priority",
      },
      default: "medium",
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "in_progress", "resolved", "closed"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
    },
    attachments: [
      {
        type: String, // URLs to files stored in Cloudinary/uploads
      },
    ],
    aiSummary: {
      type: String,
      default: "",
    },
    aiSuggestion: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Ticket creator is required"],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for query optimization
ticketSchema.index({ status: 1 });
ticketSchema.index({ category: 1 });
ticketSchema.index({ createdBy: 1 });
ticketSchema.index({ createdAt: -1 });

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;
