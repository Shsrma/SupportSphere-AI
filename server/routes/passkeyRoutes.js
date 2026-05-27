const express = require("express");
const router = express.Router();

const {
  getRegisterOptions,
  verifyRegister,
  getLoginOptions,
  verifyLogin,
} = require("../controllers/passkeyController");

const protect = require("../middleware/authMiddleware");

// Public endpoints to trigger passkey login verification
router.post("/login-options", getLoginOptions);
router.post("/login-verify", verifyLogin);

// Protected endpoints to register user devices/biometrics
router.get("/register-options", protect, getRegisterOptions);
router.post("/register-verify", protect, verifyRegister);

module.exports = router;
