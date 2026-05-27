const AppError = require("../utils/errorUtils");

// Symbolic role constants
const ROLES = {
  GOD_ADMIN: "⚡ god_admin",
  SUPER_ADMIN: "👑 super_admin",
  ADMIN: "🛡️ admin",
  SUPPORT_MANAGER: "⚜️ support_manager",
  SUPPORT_AGENT: "⚙️ support_agent",
  AI_REVIEWER: "🤖 ai_reviewer",
  ANALYTICS_MANAGER: "📊 analytics_manager",
  ORGANIZATION_MANAGER: "📁 organization_manager",
  VERIFIED_USER: "📁 verified_user",
  GUEST_USER: "🔹 guest_user",
};

// Granular permissions mapping matrix
const ROLE_PERMISSIONS = {
  [ROLES.GOD_ADMIN]: [
    "manage_everything", "delete_users", "manage_roles", "access_analytics",
    "manage_ai_settings", "export_reports", "manage_tickets", "manage_support_agents",
    "update_statuses", "manage_users", "assign_tickets", "monitor_resolutions",
    "respond_to_complaints", "resolve_tickets", "review_ai_suggestions",
    "manage_institution_users", "view_org_complaints", "create_complaints",
    "upload_screenshots", "track_own_complaints"
  ],
  [ROLES.SUPER_ADMIN]: [
    "manage_everything", "delete_users", "manage_roles", "access_analytics",
    "manage_ai_settings", "export_reports", "manage_tickets", "manage_support_agents",
    "update_statuses", "manage_users", "assign_tickets", "monitor_resolutions",
    "respond_to_complaints", "resolve_tickets", "review_ai_suggestions",
    "manage_institution_users", "view_org_complaints", "create_complaints",
    "upload_screenshots", "track_own_complaints"
  ],
  [ROLES.ADMIN]: [
    "manage_tickets", "manage_support_agents", "update_statuses", "manage_users",
    "assign_tickets", "monitor_resolutions", "respond_to_complaints", "resolve_tickets",
    "review_ai_suggestions", "access_analytics", "export_reports", "create_complaints",
    "upload_screenshots", "track_own_complaints"
  ],
  [ROLES.SUPPORT_MANAGER]: [
    "assign_tickets", "manage_support_agents", "monitor_resolutions",
    "manage_tickets", "update_statuses", "respond_to_complaints", "resolve_tickets",
    "create_complaints", "upload_screenshots", "track_own_complaints"
  ],
  [ROLES.SUPPORT_AGENT]: [
    "respond_to_complaints", "update_statuses", "resolve_tickets",
    "create_complaints", "upload_screenshots", "track_own_complaints"
  ],
  [ROLES.AI_REVIEWER]: [
    "review_ai_suggestions", "create_complaints", "upload_screenshots", "track_own_complaints"
  ],
  [ROLES.ANALYTICS_MANAGER]: [
    "access_analytics", "export_reports", "create_complaints", "upload_screenshots", "track_own_complaints"
  ],
  [ROLES.ORGANIZATION_MANAGER]: [
    "manage_institution_users", "view_org_complaints", "create_complaints", "upload_screenshots", "track_own_complaints"
  ],
  [ROLES.VERIFIED_USER]: [
    "create_complaints", "upload_screenshots", "track_own_complaints"
  ],
  [ROLES.GUEST_USER]: []
};

/**
 * Middleware to restrict access based on user roles.
 * Usage: authorizeRoles('👑 super_admin', '🛡️ admin')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("User context missing. Authentication required.", 401));
    }

    // God Admin bypasses all checks
    if (req.user.role === ROLES.GOD_ADMIN) {
      return next();
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

/**
 * Middleware to restrict access based on granular permissions.
 * Usage: authorizePermission('delete_users')
 */
const authorizePermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("User context missing. Authentication required.", 401));
    }

    // God Admin bypasses all checks
    if (req.user.role === ROLES.GOD_ADMIN) {
      return next();
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    if (!userPermissions.includes(requiredPermission)) {
      return next(
        new AppError(
          `User role '${req.user.role}' does not have the required permission '${requiredPermission}' to access this resource`,
          403
        )
      );
    }

    next();
  };
};

module.exports = {
  ROLES,
  ROLE_PERMISSIONS,
  authorizeRoles,
  authorizePermission,
};
