import { createContext, useState, useEffect } from "react";
import api from "../services/api";
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { 
  auth, 
  googleProvider, 
  githubProvider, 
  microsoftProvider, 
  signInWithPopup, 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from "../firebase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);

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
        return { 
          success: true, 
          requires2FA: true, 
          email: response.data.data.email,
          phoneNumber: response.data.data.phoneNumber 
        };
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

  // Social authentication via Firebase (Google, Microsoft, GitHub)
  const loginWithFirebaseSocial = async (providerName) => {
    setLoading(true);
    try {
      let provider;
      if (providerName === "Google") provider = googleProvider;
      else if (providerName === "GitHub") provider = githubProvider;
      else if (providerName === "Microsoft") provider = microsoftProvider;
      else throw new Error("Unsupported provider");

      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const name = firebaseUser.displayName || `${providerName} User`;
      const email = firebaseUser.email || `${providerName.toLowerCase()}_user_${firebaseUser.uid}@supportsphere.ai`;
      const phoneNumber = firebaseUser.phoneNumber || "";

      // Register or sign in via our backend using the isOAuth flag
      const backendResponse = await register(name, email, "", phoneNumber, "", true);
      setLoading(false);
      return backendResponse;
    } catch (error) {
      setLoading(false);
      console.error("Firebase social login error:", error);
      return { success: false, error: error.message || "Social authentication failed." };
    }
  };

  // Firebase SMS OTP verification initiation
  const sendFirebaseSms = async (phoneNumber, recaptchaContainerId) => {
    setLoading(true);
    try {
      // Clear previous verifier if any
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
      
      window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
        size: "invisible",
        callback: (response) => {
          // reCAPTCHA solved, direct SMS trigger
        }
      });

      const confirmResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      setConfirmationResult(confirmResult);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      console.error("Firebase SMS send error:", error);
      return { success: false, error: error.message || "Failed to send SMS verification code." };
    }
  };

  // Confirm Firebase SMS OTP code
  const verifyFirebaseSms = async (smsCode, customEmail) => {
    setLoading(true);
    try {
      if (!confirmationResult) {
        throw new Error("No pending SMS verification challenge found.");
      }
      
      const result = await confirmationResult.confirm(smsCode);
      const firebaseUser = result.user;

      const name = firebaseUser.displayName || "Verified Mobile User";
      const phoneNumber = firebaseUser.phoneNumber;
      const email = customEmail || `phone_${phoneNumber.replace("+", "")}_${firebaseUser.uid}@supportsphere.ai`;

      // Call unified register/login with isOAuth flag
      const backendResponse = await register(name, email, "", phoneNumber, "", true);
      setLoading(false);
      return backendResponse;
    } catch (error) {
      setLoading(false);
      console.error("Firebase SMS verify error:", error);
      return { success: false, error: error.message || "Invalid SMS verification code." };
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
        loginWithFirebaseSocial,
        sendFirebaseSms,
        verifyFirebaseSms,
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
