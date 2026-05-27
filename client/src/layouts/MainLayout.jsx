import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { HelpCircle, Menu, X, LogIn, UserPlus } from "lucide-react";

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#2563EB]/30 selection:text-white">
      {/* Sticky Header with Backdrop Blur */}
      <header className="sticky top-0 z-50 w-full border-b border-[#334155] bg-[#0F172A]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white shadow-lg shadow-[#2563EB]/25 transform transition-transform group-hover:scale-105 duration-300">
              <HelpCircle className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-[#CBD5E1] to-[#06B6D4] bg-clip-text text-transparent">
              SupportSphere<span className="text-[#06B6D4]">.AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/#features"
              className="text-sm font-medium text-[#CBD5E1] hover:text-white transition-colors duration-200"
            >
              Features
            </Link>
            <Link
              to="/#about"
              className="text-sm font-medium text-[#CBD5E1] hover:text-white transition-colors duration-200"
            >
              About
            </Link>
            <div className="h-4 w-px bg-[#334155]" />
            <Link
              to="/login"
              className="text-sm font-medium text-[#CBD5E1] hover:text-white flex items-center gap-1.5 transition-colors duration-200"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold text-white px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#3B82F6] hover:to-[#8B5CF6] rounded-lg shadow-lg hover:shadow-[#2563EB]/20 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-1.5"
            >
              <UserPlus className="h-4 w-4" />
              Register
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-[#334155] hover:bg-[#1E293B] text-[#CBD5E1] hover:text-white transition-all duration-200"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[#0F172A]/95 backdrop-blur-lg flex flex-col pt-20 px-6 space-y-6">
          <Link
            to="/#features"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-lg font-medium border-b border-[#334155]/50 pb-2 text-[#CBD5E1] hover:text-white"
          >
            Features
          </Link>
          <Link
            to="/#about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-lg font-medium border-b border-[#334155]/50 pb-2 text-[#CBD5E1] hover:text-white"
          >
            About
          </Link>
          <Link
            to="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-lg font-medium border-b border-[#334155]/50 pb-2 text-[#CBD5E1] hover:text-white flex items-center gap-2"
          >
            <LogIn className="h-5 w-5" />
            Sign In
          </Link>
          <Link
            to="/register"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-lg font-medium text-center text-white py-3 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] rounded-lg shadow-lg"
          >
            Register Account
          </Link>
        </div>
      )}

      {/* Page Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#334155] bg-[#0A0F1D]/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[#CBD5E1]/60">
            © 2026 SupportSphere AI. All rights reserved. Powered by Gemini API. Developed by Ankur Sharma
          </div>
          <div className="flex gap-6 text-sm text-[#CBD5E1]/60">
            <Link to="/#privacy" className="hover:text-white transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link to="/#terms" className="hover:text-white transition-colors duration-200">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
