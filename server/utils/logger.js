const winston = require("winston");
const path = require("path");

// RFC5424 logging levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

// JSON formatting for file writing
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.json()
);

// Human-readable, colorized formatting for terminal console logging
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] [${info.level}]: ${info.message}`
  )
);

// Transports define output channels
const transports = [
  new winston.transports.Console({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: consoleFormat,
  }),
  new winston.transports.File({
    filename: path.join(__dirname, "../logs/error.log"),
    level: "error",
    format: fileFormat,
  }),
  new winston.transports.File({
    filename: path.join(__dirname, "../logs/combined.log"),
    level: "info",
    format: fileFormat,
  }),
];

const logger = winston.createLogger({
  levels,
  transports,
});

module.exports = logger;
