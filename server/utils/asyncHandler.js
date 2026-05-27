/**
 * Async Handler to wrap controller actions and catch unhandled promise rejections,
 * forwarding them to the express error-handling middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
