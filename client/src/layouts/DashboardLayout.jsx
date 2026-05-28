import { useState, useContext, useEffect, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
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
  Plus,
} from "lucide-react";

const DashboardLayout = () => {
  const { user, logout, isAdmin, isSupport } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifDropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 30 seconds for live updates
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Click outside listener for notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, ticketId) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      if (ticketId) {
        navigate(`/tickets/${ticketId}`);
        setIsNotifOpen(false);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
      name: "Raise a Ticket",
      path: "/tickets/create",
      icon: Plus,
      roles: ["user"],
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

  let userCategory = "user";
  if (isAdmin) userCategory = "admin";
  else if (isSupport) userCategory = "support";

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userCategory)
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
            <div className="relative" ref={notifDropdownRef}>
              <button 
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  if (!isNotifOpen) fetchNotifications();
                }}
                className="relative p-2 rounded-lg border border-[#334155] hover:bg-[#1E293B] text-[#CBD5E1] hover:text-white transition-all duration-200 cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[#EF4444] text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-[#0F172A]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-[#334155] bg-[#1E293B]/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#334155]/60 bg-[#0F172A]/40">
                      <span className="font-semibold text-sm text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllAsRead}
                          className="text-[11px] font-bold text-[#06B6D4] hover:text-[#22D3EE] bg-transparent border-0 cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-[#334155]/40 custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="py-8 px-4 text-center text-xs text-[#CBD5E1]/50">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n._id}
                            onClick={() => handleMarkAsRead(n._id, n.ticketId?._id)}
                            className={`p-3.5 text-left cursor-pointer transition-colors duration-150 relative ${
                              n.isRead ? "hover:bg-[#1E293B]/40" : "bg-[#2563EB]/5 hover:bg-[#2563EB]/10"
                            }`}
                          >
                            {!n.isRead && (
                              <span className="absolute top-4 left-2.5 h-2 w-2 rounded-full bg-[#06B6D4]" />
                            )}
                            <div className={`flex flex-col gap-1 ${!n.isRead ? "pl-3.5" : ""}`}>
                              <p className="text-xs text-[#F8FAFC] leading-normal">{n.message}</p>
                              <div className="flex justify-between items-center text-[10px] text-[#CBD5E1]/40 mt-1">
                                <span className="truncate max-w-[180px]">
                                  Ticket: {n.ticketId?.title || "Unknown"}
                                </span>
                                <span>
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
