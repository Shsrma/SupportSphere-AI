const express = require("express");
const router = express.Router();

// Placeholder for ticket routes
router.get("/ping", (req, res) => {
  res.json({ success: true, message: "Ticket routes active" });
});

module.exports = router;
