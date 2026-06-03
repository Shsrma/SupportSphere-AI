const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const morgan = require("morgan");
const logger = require("./utils/logger");

const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const adminRoutes = require("./routes/adminRoutes");
const passkeyRoutes = require("./routes/passkeyRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.use(helmet());

app.use(cors());

// Configure morgan HTTP request logging streamed through Winston logger
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Serve uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Running"
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/tickets", ticketRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/passkey", passkeyRoutes);

app.use("/api/notifications", notificationRoutes);

// Centralized Error Handler Middleware
const errorMiddleware = require("./middleware/errorMiddleware");
app.use(errorMiddleware);

module.exports = app;