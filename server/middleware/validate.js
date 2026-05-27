const { validationResult } = require("express-validator");
const { sendError } = require("../utils/responseHelper");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param, // handles older express-validator versions where param is used
      message: err.msg,
    }));
    return sendError(res, "Validation failed", 400, formattedErrors);
  }
  next();
};

module.exports = validate;
