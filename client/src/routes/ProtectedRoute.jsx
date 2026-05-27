import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

/**
 * Route protection wrapper component.
 * Usage: <ProtectedRoute allowedRoles={['admin']}><AdminPage /></ProtectedRoute>
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center text-white">
        <Loader2 className="h-10 w-10 text-[#2563EB] animate-spin mb-4" />
        <span className="text-sm text-[#CBD5E1] tracking-wide">Validating session...</span>
      </div>
    );
  }

  // Redirect to login page if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified and user's role is not allowed, redirect to main dashboard
  if (allowedRoles && user.role !== "⚡ god_admin" && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
