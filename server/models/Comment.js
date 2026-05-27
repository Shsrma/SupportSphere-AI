const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: [true, "Comment must belong to a ticket"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Comment must have an author"],
    },
    message: {
      type: String,
      required: [true, "Comment message cannot be empty"],
      trim: true,
    },
    attachments: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for conversation querying speed
commentSchema.index({ ticketId: 1, createdAt: 1 });

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
