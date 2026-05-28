import { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { Mail, Lock, Loader2, ArrowRight, HelpCircle, Eye, EyeOff, KeyRound, ArrowLeft, Sparkles, Fingerprint, Phone } from "lucide-react";
import { countryCodes } from "../../utils/countryCodes";

const Login = () => {
  const { 
    login, 
    verify2fa, 
    loginWithPasskey, 
    register, 
    loginWithFirebaseSocial, 
    sendFirebaseSms, 
    verifyFirebaseSms, 
    isAuthenticated, 
    loading 
  } = useContext(AuthContext);
  
  // Step control: "login", "2fa", "forgot"
  const [step, setStep] = useState("login");
  
  // Login credentials states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Firebase Mobile Auth States
  const [authMode, setAuthMode] = useState("credentials"); // "credentials" or "mobile"
  const [otpCountryCode, setOtpCountryCode] = useState("+91");
  const [otpPhoneBody, setOtpPhoneBody] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [smsSent, setSmsSent] = useState(false);
  const [smsSending, setSmsSending] = useState(false);

  // Credentials User Registered Phone for 2FA fallback
  const [userPhone, setUserPhone] = useState("");
  const [isSms2fa, setIsSms2fa] = useState(false);
  const [sms2faSent, setSms2faSent] = useState(false);
  const [sms2faCode, setSms2faCode] = useState("");
  const [sms2faSending, setSms2faSending] = useState(false);
  
  // 2FA Verification states
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  
  // Forgot Password recovery states
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtpSending, setForgotOtpSending] = useState(false);
  
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  const from = location.state?.from?.pathname || "/dashboard";
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setTimeout(() => {
        setCooldown(cooldown - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cooldown]);

  // Login handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      if (result.requires2FA) {
        setStep("2fa");
        setCooldown(50);
        setOtp("");
        setUserPhone(result.phoneNumber || "");
        toast.success("Credentials verified. Check your server console for the 2FA code!");
      } else {
        toast.success(`Welcome back, ${result.user.name}!`);
        navigate(from, { replace: true });
      }
    } else {
      toast.error(result.error);
    }
  };

  // Biometric / Passkey Login or 2FA verification handler
  const handlePasskeyLogin = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Contacting your device authenticator...", { id: "passkey-login" });
    
    const result = await loginWithPasskey(email);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`, { id: "passkey-login" });
      navigate(from, { replace: true });
    } else {
      toast.error(result.error || "Biometric authentication failed or cancelled.", { id: "passkey-login" });
    }
  };

  // Social Auth Handler for Google, Microsoft, GitHub, and Mobile login
  const handleSocialLogin = async (provider) => {
    if (provider === "Mobile") {
      setAuthMode("mobile");
      return;
    }
    
    setIsSubmitting(true);
    toast.loading(`Connecting to ${provider} authentication services...`, { id: "social-auth" });
    
    try {
      const result = await loginWithFirebaseSocial(provider);
      if (result.success) {
        toast.success(`Welcome back, ${result.user.name}!`, { id: "social-auth" });
        navigate(from, { replace: true });
      } else {
        toast.error(result.error || "Social authentication failed.", { id: "social-auth" });
      }
    } catch (error) {
      toast.error("Social identity sync failed.", { id: "social-auth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Firebase SMS Handlers for Mobile OTP Login
  const handleSendMobileSms = async (e) => {
    e.preventDefault();
    const cleanPhoneBody = otpPhoneBody.replace(/[\s\-\(\)]/g, "").replace(/^0+/, "");
    if (!cleanPhoneBody) {
      toast.error("Please enter your mobile number.");
      return;
    }
    const fullPhone = otpCountryCode + cleanPhoneBody;
    setSmsSending(true);
    toast.loading("Sending SMS verification code...", { id: "sms-send" });
    const result = await sendFirebaseSms(fullPhone, "recaptcha-container");
    setSmsSending(false);
    if (result.success) {
      setSmsSent(true);
      setCooldown(50);
      toast.success("SMS verification code sent to your phone!", { id: "sms-send" });
    } else {
      toast.error(result.error || "Failed to send SMS verification code.", { id: "sms-send" });
    }
  };

  const handleVerifyMobileSms = async (e) => {
    e.preventDefault();
    if (!smsCode) {
      toast.error("Please enter the 6-digit SMS verification code.");
      return;
    }
    setIsSubmitting(true);
    toast.loading("Verifying code...", { id: "sms-verify" });
    const result = await verifyFirebaseSms(smsCode);
    setIsSubmitting(false);
    if (result.success) {
      toast.success("Mobile verification successful!", { id: "sms-verify" });
      navigate(from, { replace: true });
    } else {
      toast.error(result.error || "Verification failed.", { id: "sms-verify" });
    }
  };

  // Secondary SMS 2FA Fallback Handlers
  const handleSend2faSms = async () => {
    if (!userPhone) {
      toast.error("No registered mobile number found on your account.");
      return;
    }
    setSms2faSending(true);
    toast.loading("Sending SMS verification code to your registered mobile...", { id: "sms-2fa-send" });
    const result = await sendFirebaseSms(userPhone, "recaptcha-container-2fa");
    setSms2faSending(false);
    if (result.success) {
      setSms2faSent(true);
      setIsSms2fa(true);
      setCooldown(50);
      toast.success("SMS verification code sent to your registered mobile number!", { id: "sms-2fa-send" });
    } else {
      toast.error(result.error || "Failed to send SMS verification code.", { id: "sms-2fa-send" });
    }
  };

  const handleVerify2faSms = async (e) => {
    e.preventDefault();
    if (!sms2faCode) {
      toast.error("Please enter the 6-digit SMS verification code.");
      return;
    }
    setIsSubmitting(true);
    toast.loading("Verifying secondary phone authentication...", { id: "sms-2fa-verify" });
    const result = await verifyFirebaseSms(sms2faCode, email);
    setIsSubmitting(false);
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`, { id: "sms-2fa-verify" });
      navigate(from, { replace: true });
    } else {
      toast.error(result.error || "Verification failed.", { id: "sms-2fa-verify" });
    }
  };

  // 2FA verification handler
  const handle2FaSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the verification code.");
      return;
    }

    setIsSubmitting(true);
    const result = await verify2fa(email, otp);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`);
      navigate(from, { replace: true });
    } else {
      toast.error(result.error);
    }
  };

  // Resend 2FA handler
  const handleResend2Fa = async () => {
    setCooldown(50);
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.success) {
        toast.success("New 2FA code sent! Check your server console.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend code.");
    }
  };

  // Request password reset OTP code
  const handleSendForgotOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setForgotOtpSending(true);
    try {
      const response = await api.post("/auth/forgot-password", { email });
      if (response.data.success) {
        setForgotOtpSent(true);
        toast.success("Verification code sent! Check your server console.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Email address not found.");
    } finally {
      setForgotOtpSending(false);
    }
  };

  // Submit password reset
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotOtp || !newPassword) {
      toast.error("All fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    // Password complexity check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error("Password must contain uppercase, lowercase, numbers, and special characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/reset-password", {
        email,
        otp: forgotOtp,
        newPassword,
      });
      if (response.data.success) {
        toast.success("Password reset successfully! You can now log in.");
        setStep("login");
        setPassword("");
        setForgotOtp("");
        setNewPassword("");
        setForgotOtpSent(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden bg-[#0F172A]">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-4">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {step === "login" && "Sign In"}
            {step === "2fa" && "2FA Verification"}
            {step === "forgot" && "Recover Account"}
          </h2>
          <p className="mt-2 text-sm text-[#CBD5E1]">
            {step === "login" && "Access your AI complaint management dashboard"}
            {step === "2fa" && "Verify secondary security code to access dashboard"}
            {step === "forgot" && "Reset your password with verification code"}
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-[#1E293B]/40 backdrop-blur-xl border border-[#334155]/60 rounded-2xl p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: LOGIN FORM */}
            {step === "login" && (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                {authMode === "credentials" ? (
                  <form className="space-y-4" onSubmit={handleLoginSubmit}>
                    {/* Email Field */}
                    <div>
                      <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-1.5" htmlFor="email">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#CBD5E1]/60">
                          <Mail className="h-4.5 w-4.5" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full pl-10 pr-4 py-2.5 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-white placeholder-[#CBD5E1]/40 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all duration-200 text-sm"
                          placeholder="name@organization.com"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider" htmlFor="password">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setStep("forgot")}
                          className="text-xs text-[#06B6D4] hover:text-[#22D3EE] hover:underline font-semibold bg-transparent border-0 cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#CBD5E1]/60">
                          <Lock className="h-4.5 w-4.5" />
                        </div>
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full pl-10 pr-10 py-2.5 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-white placeholder-[#CBD5E1]/40 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all duration-200 text-sm"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#CBD5E1]/60 hover:text-white bg-transparent border-0 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Standard Sign In */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#3B82F6] hover:to-[#8B5CF6] shadow-lg shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 cursor-pointer mt-6"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Authenticating...
                        </>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </motion.button>

                    {/* Biometric Passkey Sign In */}
                    <button
                      type="button"
                      onClick={handlePasskeyLogin}
                      disabled={isSubmitting || !email}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-[#CBD5E1] hover:text-white bg-[#0F172A]/60 hover:bg-[#1E293B] border border-[#334155] hover:border-[#475569] shadow-md transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer mt-3"
                      title={!email ? "Enter email to log in with passkey" : "Sign in using device biometrics"}
                    >
                      <Fingerprint className="h-4.5 w-4.5 text-[#7C3AED]" />
                      Sign In with Passkey
                    </button>
                  </form>
                ) : (
                  <form className="space-y-4" onSubmit={smsSent ? handleVerifyMobileSms : handleSendMobileSms}>
                    {/* Mobile Phone Field */}
                    <div>
                      <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-1.5" htmlFor="mobile-phone">
                        Mobile Number *
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={otpCountryCode}
                          onChange={(e) => setOtpCountryCode(e.target.value)}
                          disabled={smsSent}
                          className="bg-[#0F172A]/60 border border-[#334155] rounded-xl text-white px-2 py-2.5 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none text-xs cursor-pointer max-w-[110px]"
                        >
                          {countryCodes.map((c) => (
                            <option key={`otp-${c.code}-${c.name}`} value={c.code} className="bg-[#1E293B] text-white">
                              {c.flag} {c.code}
                            </option>
                          ))}
                        </select>
                        <div className="relative flex-grow">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#CBD5E1]/60">
                            <Phone className="h-4.5 w-4.5" />
                          </div>
                          <input
                            id="mobile-phone"
                            type="tel"
                            required
                            disabled={smsSent}
                            value={otpPhoneBody}
                            onChange={(e) => setOtpPhoneBody(e.target.value.replace(/\D/g, ""))}
                            className="block w-full pl-10 pr-4 py-2.5 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-white placeholder-[#CBD5E1]/40 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all duration-200 text-sm disabled:opacity-50"
                            placeholder="9414407192"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Invisible reCAPTCHA verification container */}
                    <div id="recaptcha-container" className="my-2 flex justify-center"></div>

                    {/* SMS Code Verification Input */}
                    {smsSent && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-3 pt-2 border-t border-[#334155]/40"
                      >
                        <label className="block text-xs font-bold text-[#A78BFA] uppercase tracking-wider mb-1.5" htmlFor="sms-otp">
                          Enter 6-Digit SMS Verification Code *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A78BFA]/70">
                            <KeyRound className="h-4.5 w-4.5" />
                          </div>
                          <input
                            id="sms-otp"
                            type="text"
                            required
                            value={smsCode}
                            onChange={(e) => setSmsCode(e.target.value)}
                            className="block w-full pl-10 pr-4 py-2.5 bg-[#0F172A]/80 border border-[#7C3AED]/50 rounded-xl text-white placeholder-[#CBD5E1]/30 focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition-all duration-200 text-sm font-semibold tracking-widest text-center"
                            placeholder="000000"
                            maxLength={6}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-[#CBD5E1]/50">SMS code expires in 50 seconds</span>
                          {cooldown > 0 ? (
                            <span className="text-[#CBD5E1]/60">Resend in {cooldown}s</span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendMobileSms}
                              className="text-[#06B6D4] hover:underline font-semibold bg-transparent border-0 cursor-pointer"
                            >
                              Resend Code
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Mobile Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("credentials");
                          setSmsSent(false);
                        }}
                        className="px-4 py-2.5 border border-[#334155] rounded-xl text-xs text-[#CBD5E1] hover:text-white transition-all bg-transparent cursor-pointer flex items-center gap-1.5"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back
                      </button>
                      
                      {!smsSent ? (
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          type="submit"
                          disabled={smsSending}
                          className="flex-grow flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#3B82F6] hover:to-[#8B5CF6] shadow-lg shadow-blue-500/25 disabled:opacity-50 cursor-pointer"
                        >
                          {smsSending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Sending Code...
                            </>
                          ) : (
                            <>
                              Send SMS OTP
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          type="submit"
                          disabled={isSubmitting || !smsCode}
                          className="flex-grow flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              Verify & Login
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </form>
                )}

                {/* OR Divider */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#334155]/40" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-[#182235] px-2.5 text-[#CBD5E1]/50 font-semibold tracking-wider">
                      Or Sign In With
                    </span>
                  </div>
                </div>

                {/* Social Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("Google")}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#0F172A]/70 hover:bg-[#1E293B] border border-[#334155] rounded-xl text-xs font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.187 4.114-3.478 0-6.3-2.822-6.3-6.3 0-3.478 2.822-6.3 6.3-6.3 1.543 0 2.94.557 4.028 1.488l3.125-3.124C18.99 2.215 15.86 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.89 0 10.967-4.113 10.967-11.24 0-.768-.085-1.464-.23-1.955H12.24z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("Microsoft")}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#0F172A]/70 hover:bg-[#1E293B] border border-[#334155] rounded-xl text-xs font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 23 23" fill="currentColor">
                      <path d="M0 0h11v11H0z" fill="#F25022"/>
                      <path d="M12 0h11v11H12z" fill="#7FBA00"/>
                      <path d="M0 12h11v11H0z" fill="#00A4EF"/>
                      <path d="M12 12h11v11H12z" fill="#FFB900"/>
                    </svg>
                    Microsoft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("GitHub")}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#0F172A]/70 hover:bg-[#1E293B] border border-[#334155] rounded-xl text-xs font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
                  >
                    <svg className="h-3.5 w-3.5 text-[#CBD5E1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                      <path d="M9 18c-4.51 2-5-2-7-2" />
                    </svg>
                    GitHub
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("Mobile")}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#0F172A]/70 hover:bg-[#1E293B] border border-[#334155] rounded-xl text-xs font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Phone className="h-3.5 w-3.5 text-[#CBD5E1]" />
                    Mobile OTP
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: 2FA VERIFICATION CODE FORM */}
            {step === "2fa" && (
              <motion.div
                key="2fa-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                {!isSms2fa ? (
                  <form onSubmit={handle2FaSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#A78BFA] uppercase tracking-wider mb-1.5" htmlFor="2fa-otp">
                        6-Digit Email 2FA Verification Code
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A78BFA]/80">
                          <KeyRound className="h-4.5 w-4.5" />
                        </div>
                        <input
                          id="2fa-otp"
                          type="text"
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="block w-full pl-10 pr-4 py-2.5 bg-[#0F172A]/80 border border-[#7C3AED]/50 rounded-xl text-white placeholder-[#CBD5E1]/30 focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition-all duration-200 text-sm font-semibold tracking-widest text-center"
                          placeholder="000000"
                          maxLength={6}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2 text-[10px]">
                        <span className="text-[#CBD5E1]/50">Code valid for 50s</span>
                        {cooldown > 0 ? (
                          <span className="text-[#CBD5E1]/60">Resend in {cooldown}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResend2Fa}
                            className="text-[#06B6D4] hover:underline font-semibold bg-transparent border-0 cursor-pointer"
                          >
                            Resend Code
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setStep("login");
                          setIsSms2fa(false);
                          setSms2faSent(false);
                        }}
                        className="px-4 py-2.5 border border-[#334155] rounded-xl text-xs text-[#CBD5E1] hover:text-white transition-all bg-transparent cursor-pointer flex items-center gap-1.5"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-grow flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            Verify & Login
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </motion.button>
                    </div>

                    {userPhone && (
                      <div className="pt-2 border-t border-[#334155]/40 mt-4">
                        <button
                          type="button"
                          onClick={handleSend2faSms}
                          disabled={sms2faSending}
                          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold text-[#A78BFA] hover:text-white bg-[#0F172A]/80 hover:bg-[#1E293B] border border-[#7C3AED]/30 hover:border-[#7C3AED]/70 transition-all duration-300 disabled:opacity-50 cursor-pointer"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          Verify via Mobile SMS instead ({userPhone.slice(0, 4)}***{userPhone.slice(-4)})
                        </button>
                      </div>
                    )}
                  </form>
                ) : (
                  <form onSubmit={handleVerify2faSms} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#A78BFA] uppercase tracking-wider mb-1.5" htmlFor="sms-2fa-otp">
                        6-Digit Mobile SMS Verification Code
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A78BFA]/80">
                          <KeyRound className="h-4.5 w-4.5" />
                        </div>
                        <input
                          id="sms-2fa-otp"
                          type="text"
                          required
                          value={sms2faCode}
                          onChange={(e) => setSms2faCode(e.target.value)}
                          className="block w-full pl-10 pr-4 py-2.5 bg-[#0F172A]/80 border border-[#7C3AED]/50 rounded-xl text-white placeholder-[#CBD5E1]/30 focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition-all duration-200 text-sm font-semibold tracking-widest text-center"
                          placeholder="000000"
                          maxLength={6}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2 text-[10px]">
                        <span className="text-[#CBD5E1]/50">SMS expires in 50 seconds</span>
                        {cooldown > 0 ? (
                          <span className="text-[#CBD5E1]/60">Resend in {cooldown}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSend2faSms}
                            className="text-[#06B6D4] hover:underline font-semibold bg-transparent border-0 cursor-pointer"
                          >
                            Resend SMS Code
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSms2fa(false);
                          setSms2faSent(false);
                        }}
                        className="px-4 py-2.5 border border-[#334155] rounded-xl text-xs text-[#CBD5E1] hover:text-white transition-all bg-transparent cursor-pointer flex items-center gap-1.5"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Email OTP
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={isSubmitting || !sms2faCode}
                        className="flex-grow flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            Verify & Login
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                )}

                <div id="recaptcha-container-2fa" className="my-2 flex justify-center"></div>

                {/* Verify with device biometrics/passkey */}
                <button
                  type="button"
                  onClick={handlePasskeyLogin}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-[#CBD5E1] hover:text-white bg-[#0F172A]/80 hover:bg-[#1E293B] border border-[#7C3AED]/30 hover:border-[#7C3AED]/70 shadow-md transition-all duration-300 disabled:opacity-50 cursor-pointer mt-3"
                >
                  <Fingerprint className="h-4.5 w-4.5 text-[#7C3AED]" />
                  Verify with Device Passkey
                </button>
              </motion.div>
            )}

            {/* STEP 3: FORGOT PASSWORD FORM */}
            {step === "forgot" && (
              <motion.form
                key="forgot-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
                onSubmit={forgotOtpSent ? handleResetPasswordSubmit : handleSendForgotOtp}
              >
                {/* Reset Email Input */}
                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-1.5" htmlFor="forgot-email">
                    Account Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#CBD5E1]/60">
                      <Mail className="h-4.5 w-4.5" />
                    </div>
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      disabled={forgotOtpSent}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-white placeholder-[#CBD5E1]/40 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all duration-200 text-sm disabled:opacity-50"
                      placeholder="yourname@organization.com"
                    />
                  </div>
                </div>

                {/* Verification & New Password Fields */}
                {forgotOtpSent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4 pt-2 border-t border-[#334155]/40"
                  >
                    {/* OTP */}
                    <div>
                      <label className="block text-xs font-bold text-[#A78BFA] uppercase tracking-wider mb-1.5" htmlFor="forgot-otp">
                        Enter Reset Code *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A78BFA]/80">
                          <KeyRound className="h-4.5 w-4.5" />
                        </div>
                        <input
                          id="forgot-otp"
                          type="text"
                          required
                          value={forgotOtp}
                          onChange={(e) => setForgotOtp(e.target.value)}
                          className="block w-full pl-10 pr-4 py-2.5 bg-[#0F172A]/80 border border-[#7C3AED]/50 rounded-xl text-white placeholder-[#CBD5E1]/30 focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition-all duration-200 text-sm font-semibold tracking-widest text-center"
                          placeholder="000000"
                          maxLength={6}
                        />
                      </div>
                      <p className="text-[10px] text-[#CBD5E1]/50 mt-1">Code valid for 50 seconds in server console</p>
                    </div>

                    {/* New Password */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider" htmlFor="new-password">
                          New Password *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                            const lowercase = "abcdefghijklmnopqrstuvwxyz";
                            const numbers = "0123456789";
                            const special = "!@#$%^&*()";
                            let chars = [];
                            for (let i = 0; i < 3; i++) {
                              chars.push(uppercase[Math.floor(Math.random() * uppercase.length)]);
                              chars.push(lowercase[Math.floor(Math.random() * lowercase.length)]);
                              chars.push(numbers[Math.floor(Math.random() * numbers.length)]);
                              chars.push(special[Math.floor(Math.random() * special.length)]);
                            }
                            for (let i = chars.length - 1; i > 0; i--) {
                              const j = Math.floor(Math.random() * (i + 1));
                              const temp = chars[i];
                              chars[i] = chars[j];
                              chars[j] = temp;
                            }
                            const generated = chars.join("");
                            setNewPassword(generated);
                            setShowPassword(true);
                            toast.success("Suggested a strong password!");
                          }}
                          className="text-[10px] text-[#06B6D4] hover:underline flex items-center gap-1 font-semibold bg-transparent border-0 cursor-pointer"
                        >
                          <Sparkles className="h-3 w-3" />
                          Suggest Password
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#CBD5E1]/60">
                          <Lock className="h-4.5 w-4.5" />
                        </div>
                        <input
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="block w-full pl-10 pr-10 py-2.5 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-white placeholder-[#CBD5E1]/40 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all duration-200 text-sm"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#CBD5E1]/60 hover:text-white bg-transparent border-0 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-[#CBD5E1]/50 mt-1">
                        Min 8 chars, must contain uppercase, lowercase, numbers, and special characters.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("login");
                      setForgotOtpSent(false);
                    }}
                    className="px-4 py-2.5 border border-[#334155] rounded-xl text-xs text-[#CBD5E1] hover:text-white transition-all bg-transparent cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                  
                  {!forgotOtpSent ? (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={forgotOtpSending}
                      className="flex-grow flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#3B82F6] hover:to-[#8B5CF6] shadow-lg shadow-blue-500/25 disabled:opacity-50 cursor-pointer"
                    >
                      {forgotOtpSending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Request Reset Code
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-grow flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        <>
                          Reset Password
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </motion.form>
            )}

          </AnimatePresence>
        </div>

        {/* Form Switch Footer */}
        {step === "login" && (
          <div className="mt-6 text-center text-sm">
            <span className="text-[#CBD5E1]/60 font-medium">Don&apos;t have an account? </span>
            <Link
              to="/register"
              className="font-bold text-[#06B6D4] hover:text-[#22D3EE] hover:underline transition-colors duration-200"
            >
              Sign Up
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
