const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/errorUtils");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      
      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 3. Find user and select fields (exclude password)
      const currentUser = await User.findById(decoded.userId);
      if (!currentUser) {
        return next(
          new AppError("The user belonging to this token no longer exists.", 401)
        );
      }

      // 4. Check if account is suspended
      if (currentUser.status === "suspended") {
        return next(
          new AppError("Your account has been suspended. Please contact support.", 403)
        );
      }

      // 5. Attach user to the request object
      req.user = currentUser;
      next();
    } catch (error) {
      return next(new AppError("Not authorized, token failed", 401));
    }
  }

  if (!token) {
    return next(new AppError("Not authorized, no token provided", 401));
  }
});

module.exports = protect;
