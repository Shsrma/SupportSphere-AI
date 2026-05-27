const express = require("express");
const router = express.Router();

// Placeholder for admin routes
router.get("/ping", (req, res) => {
  res.json({ success: true, message: "Admin routes active" });
});

module.exports = router;
