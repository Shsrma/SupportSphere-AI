import { createContext, useState, useEffect } from "react";
import api from "../services/api";
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";

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

  // Login credentials check
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      
      // If 2FA challenge is required, return flag to trigger OTP view
      if (response.data.data.requires2FA) {
        setLoading(false);
        return { success: true, requires2FA: true, email: response.data.data.email };
      }

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

  // Verify 2FA OTP & complete login
  const verify2fa = async (email, otp) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/verify-2fa", { email, otp });
      const { token, user: userData } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(token);
      setUser(userData);
      setLoading(false);
      return { success: true, user: userData };
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || "2FA verification code failed.";
      return { success: false, error: message };
    }
  };

  // Register passkey device (biometric / security key)
  const registerPasskey = async () => {
    try {
      // 1. Get options from backend
      const optionsResponse = await api.get("/passkey/register-options");
      const optionsJSON = optionsResponse.data.data;

      // 2. Browser start registration
      const regResponse = await startRegistration({ optionsJSON });

      // 3. Send response to backend for verification
      const verifyResponse = await api.post("/passkey/register-verify", regResponse);
      return { success: true, message: verifyResponse.data.message };
    } catch (error) {
      console.error("Passkey registration failed:", error);
      const message = error.response?.data?.message || error.message || "Passkey registration failed.";
      return { success: false, error: message };
    }
  };

  // Authenticate (login) using passkey
  const loginWithPasskey = async (emailAddress) => {
    setLoading(true);
    try {
      // 1. Get options from backend
      const optionsResponse = await api.post("/passkey/login-options", { email: emailAddress });
      const optionsJSON = optionsResponse.data.data;

      // 2. Browser start authentication
      const authResponse = await startAuthentication({ optionsJSON });

      // 3. Send signature verification to backend
      const verifyResponse = await api.post("/passkey/login-verify", {
        email: emailAddress,
        credential: authResponse,
      });

      const { token, user: userData } = verifyResponse.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(token);
      setUser(userData);
      setLoading(false);
      return { success: true, user: userData };
    } catch (error) {
      setLoading(false);
      console.error("Passkey authentication failed:", error);
      const message = error.response?.data?.message || error.message || "Passkey login failed.";
      return { success: false, error: message };
    }
  };

  // Register handler (passing OTP code and optional isOAuth)
  const register = async (name, email, password, phoneNumber, otp, isOAuth) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        phoneNumber,
        otp,
        isOAuth,
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
        verify2fa,
        registerPasskey,
        loginWithPasskey,
        register,
        logout,
        isAuthenticated: !!user,
        // Map symbolic roles to existing layout privileges
        isAdmin: ["⚡ god_admin", "👑 super_admin", "🛡️ admin", "📊 analytics_manager", "📁 organization_manager"].includes(user?.role),
        isSupport: ["⚜️ support_manager", "⚙️ support_agent", "🤖 ai_reviewer"].includes(user?.role),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
