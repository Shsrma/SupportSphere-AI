const AppError = require("../utils/errorUtils");

/**
 * Middleware to restrict access based on user roles.
 * Usage: authorizeRoles('admin', 'support')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("User context missing. Authentication required.", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role '${req.user.role}' is not authorized to access this resource`,
          403
        )
      );
    }

    next();
  };
};

module.exports = authorizeRoles;
