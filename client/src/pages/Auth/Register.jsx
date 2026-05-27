import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { User, Mail, Phone, Lock, Loader2, ArrowRight, HelpCircle } from "lucide-react";

const Register = () => {
  const { register, isAuthenticated, loading } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validations
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    // Password complexity check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error("Password must contain uppercase, lowercase, numbers, and special characters.");
      return;
    }

    setIsSubmitting(true);
    const result = await register(name, email, password, phone);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(`Welcome to SupportSphere, ${result.user.name}!`);
      navigate("/dashboard", { replace: true });
    } else {
      toast.error(result.error);
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
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-[#CBD5E1]">
            Join SupportSphere to start resolving complaints with AI
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-[#1E293B]/40 backdrop-blur-xl border border-[#334155]/60 rounded-2xl p-8 shadow-2xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Name Field */}
            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-1.5" htmlFor="name">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#CBD5E1]/60">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-white placeholder-[#CBD5E1]/40 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all duration-200 text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-1.5" htmlFor="email">
                Email Address *
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
                  placeholder="john@organization.com"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-1.5" htmlFor="phone">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#CBD5E1]/60">
                  <Phone className="h-4.5 w-4.5" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-white placeholder-[#CBD5E1]/40 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all duration-200 text-sm"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-1.5" htmlFor="password">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#CBD5E1]/60">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-white placeholder-[#CBD5E1]/40 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all duration-200 text-sm"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-[10px] text-[#CBD5E1]/50 mt-1 leading-normal">
                Min 8 chars, must contain 1 uppercase, 1 lowercase, 1 number, and 1 special char.
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-1.5" htmlFor="confirmPassword">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#CBD5E1]/60">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-white placeholder-[#CBD5E1]/40 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all duration-200 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#3B82F6] hover:to-[#8B5CF6] shadow-lg shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Form Footer */}
          <div className="mt-6 text-center text-sm">
            <span className="text-[#CBD5E1]/60">Already have an account? </span>
            <Link
              to="/login"
              className="font-semibold text-[#06B6D4] hover:text-[#22D3EE] hover:underline transition-colors duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
