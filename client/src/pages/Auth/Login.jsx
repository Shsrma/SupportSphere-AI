import { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Mail, Lock, Loader2, ArrowRight, HelpCircle } from "lucide-react";

const Login = () => {
  const { login, isAuthenticated, loading } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validations
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`);
      navigate(from, { replace: true });
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
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-4">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Sign In to SupportSphere
          </h2>
          <p className="mt-2 text-sm text-[#CBD5E1]">
            Access your AI-powered complaint management dashboard
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-[#1E293B]/40 backdrop-blur-xl border border-[#334155]/60 rounded-2xl p-8 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-[#CBD5E1] mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#CBD5E1]/60">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-white placeholder-[#CBD5E1]/40 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all duration-200"
                  placeholder="name@organization.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-[#CBD5E1]" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#CBD5E1]/60">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-white placeholder-[#CBD5E1]/40 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all duration-200"
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
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#3B82F6] hover:to-[#8B5CF6] shadow-lg shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
          </form>

          {/* Form Footer */}
          <div className="mt-6 text-center text-sm">
            <span className="text-[#CBD5E1]/60">Don&apos;t have an account? </span>
            <Link
              to="/register"
              className="font-semibold text-[#06B6D4] hover:text-[#22D3EE] hover:underline transition-colors duration-200"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
