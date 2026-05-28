const multer = require("multer");
const path = require("path");
const AppError = require("../utils/errorUtils");

// Configure local disk storage destination and naming convention
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    // Generate unique name: fieldname-timestamp-random.ext
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter: accept images, PDFs, text, and code files
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|pdf|txt|log|json|js|jsx|ts|tsx|py|java|cpp|h|html|css|md/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

  // Check if standard image/PDF, or text-based code files
  const isTextOrCode = file.mimetype.startsWith("text/") || 
                       file.mimetype === "application/json" || 
                       file.mimetype === "application/javascript" ||
                       file.mimetype === "application/octet-stream";

  const isImageOrPdf = /jpeg|jpg|png|webp|pdf/.test(file.mimetype);

  if (extname && (isImageOrPdf || isTextOrCode)) {
    return cb(null, true);
  } else {
    cb(new AppError("Allowed formats: Images (JPEG, PNG, WEBP), PDFs, and text/code files (.txt, .js, .py, etc.)", 400), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum file size
  },
});

module.exports = upload;
