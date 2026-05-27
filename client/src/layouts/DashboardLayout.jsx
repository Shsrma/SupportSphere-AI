import { useState, useContext } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  HelpCircle,
  LayoutDashboard,
  Ticket,
  BarChart3,
  FileSpreadsheet,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Bell,
  ChevronDown,
} from "lucide-react";

const DashboardLayout = () => {
  const { user, logout, isAdmin, isSupport } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Generate menu links based on role
  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      roles: ["user", "support", "admin"],
    },
    {
      name: "My Complaints",
      path: "/tickets",
      icon: Ticket,
      roles: ["user"],
    },
    {
      name: "Manage Tickets",
      path: "/tickets",
      icon: Ticket,
      roles: ["admin", "support"],
    },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: BarChart3,
      roles: ["admin"],
    },
    {
      name: "Reports",
      path: "/admin/reports",
      icon: FileSpreadsheet,
      roles: ["admin"],
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
      roles: ["user", "support", "admin"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] flex font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[#334155] bg-[#1E293B]/50 backdrop-blur-md">
        <div className="h-16 flex items-center px-6 border-b border-[#334155]">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white">
              <HelpCircle className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              SupportSphere<span className="text-[#06B6D4]">.AI</span>
            </span>
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="flex-grow p-4 space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-[#2563EB]/20 to-[#7C3AED]/20 border border-[#2563EB]/40 text-white"
                    : "text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white border border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-[#06B6D4]" : "text-[#CBD5E1]"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-[#334155] bg-[#0F172A]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-semibold text-sm">
                {getInitials(user?.name)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold max-w-[120px] truncate text-white">{user?.name}</span>
                <span className="text-[10px] text-[#06B6D4] font-medium uppercase tracking-wider">{user?.role}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg border border-[#334155] hover:bg-[#EF4444]/20 hover:border-[#EF4444] text-[#CBD5E1] hover:text-white transition-all duration-200"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          {/* Menu Drawer */}
          <aside className="relative flex flex-col w-64 bg-[#1E293B] border-r border-[#334155] h-full p-4 animate-slide-in">
            <div className="flex items-center justify-between pb-6 border-b border-[#334155]/60">
              <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setIsSidebarOpen(false)}>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <span className="font-bold text-lg tracking-tight">SupportSphere</span>
              </Link>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded-lg border border-[#334155] hover:bg-[#1E293B] text-[#CBD5E1]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="flex-grow py-4 space-y-1">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-[#2563EB]/25 to-[#7C3AED]/25 border border-[#2563EB]/40 text-white"
                        : "text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white border border-transparent"
                    }`}
                  >
                    <Icon className="h-4 w-4 text-[#CBD5E1]" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-[#334155] pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(user?.name)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">{user?.name}</span>
                    <span className="text-[10px] text-[#06B6D4] font-medium uppercase tracking-wider">{user?.role}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg border border-[#334155] hover:bg-[#EF4444]/20 hover:border-[#EF4444] text-[#CBD5E1]"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-[#334155] bg-[#1E293B]/20 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-[#334155] hover:bg-[#1E293B] text-[#CBD5E1]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-sm text-[#CBD5E1]">Welcome back, </span>
              <span className="text-sm font-semibold text-white">{user?.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 rounded-lg border border-[#334155] hover:bg-[#1E293B] text-[#CBD5E1] hover:text-white transition-all duration-200">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#EF4444] ring-2 ring-[#0F172A]" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-[#334155] hover:bg-[#1E293B] transition-all duration-200"
              >
                <div className="h-7 w-7 rounded bg-[#7C3AED] flex items-center justify-center text-white text-xs font-semibold">
                  {getInitials(user?.name)}
                </div>
                <ChevronDown className="h-3 w-3 text-[#CBD5E1]" />
              </button>

              {isProfileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-[#334155] bg-[#1E293B] p-1 shadow-xl z-20 animate-fade-in">
                    <Link
                      to="/settings"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-[#CBD5E1] hover:bg-[#0F172A] hover:text-white transition-colors duration-200"
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
