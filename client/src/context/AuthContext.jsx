import { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token by calling profile API to ensure session is still valid
          const response = await api.get("/auth/profile");
          if (response.data.success) {
            setUser(response.data.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.data.user));
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          // If profile check fails (e.g. token expired/invalid), log user out
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen for custom token expiration events from Axios interceptor
    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener("auth-expired", handleAuthExpired);
    return () => {
      window.removeEventListener("auth-expired", handleAuthExpired);
    };
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user: userData } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(token);
      setUser(userData);
      setLoading(false);
      return { success: true, user: userData };
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || "Login failed. Please check your credentials.";
      return { success: false, error: message };
    }
  };

  // Register handler
  const register = async (name, email, password, phoneNumber) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        phoneNumber,
      });
      const { token, user: userData } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(token);
      setUser(userData);
      setLoading(false);
      return { success: true, user: userData };
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || "Registration failed.";
      return { success: false, error: message };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isSupport: user?.role === "support",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
