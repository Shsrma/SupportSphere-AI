import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Ticket, Sparkles, User, Shield, HelpCircle, Clock, CheckCircle2, AlertCircle, Plus, Loader2 } from "lucide-react";
import api from "../../services/api";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user, isAdmin, isSupport } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch recent user tickets if not admin/support
  useEffect(() => {
    if (!isAdmin && !isSupport) {
      fetchUserTickets();
    }
  }, [isAdmin, isSupport]);

  const fetchUserTickets = async () => {
    setLoading(true);
    try {
      const response = await api.get("/tickets", { params: { limit: 5 } });
      if (response.data.success) {
        setTickets(response.data.data.tickets);
      }
    } catch (error) {
      console.error("Error fetching user tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Compute status aggregates for normal users
  const openCount = tickets.filter(t => t.status === "pending").length;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved" || t.status === "closed").length;

  const getPriorityStyle = (prio) => {
    switch (prio) {
      case "critical":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "high":
        return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      default:
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    }
  };

  const getStatusStyle = (stat) => {
    switch (stat) {
      case "resolved":
        return "bg-green-500/10 text-green-400 border border-green-500/20";
      case "in_progress":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "closed":
        return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
      default:
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-[#CBD5E1] text-sm mt-1">
            Welcome back to SupportSphere AI. Here is your overview.
          </p>
        </div>
        {!isAdmin && !isSupport && (
          <Link
            to="/tickets/create"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#3B82F6] hover:to-[#8B5CF6] text-white text-xs font-semibold rounded-xl shadow-lg hover:shadow-[#2563EB]/25 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Create Complaint
          </Link>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="p-6 rounded-2xl border border-[#334155] bg-[#1E293B]/40 backdrop-blur-sm flex flex-col justify-between shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-[#CBD5E1]/60 uppercase font-semibold tracking-wider">Account Profile</span>
              <h3 className="text-xl font-bold text-white mt-1">{user?.name}</h3>
              <p className="text-xs text-[#CBD5E1] mt-0.5">{user?.email}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#2563EB]/25 border border-[#2563EB]/40 flex items-center justify-center text-[#60A5FA]">
              <User className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#334155]/60 text-white font-medium uppercase tracking-wider border border-[#475569]">
              {user?.role}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium uppercase tracking-wider border border-emerald-500/20">
              {user?.status}
            </span>
          </div>
        </div>

        {/* Action Card */}
        <div className="p-6 rounded-2xl border border-[#334155] bg-[#1E293B]/40 backdrop-blur-sm flex flex-col justify-between shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-[#CBD5E1]/60 uppercase font-semibold tracking-wider">Quick Actions</span>
              <h3 className="text-xl font-bold text-white mt-1">Need Assistance?</h3>
              <p className="text-xs text-[#CBD5E1] mt-0.5">Submit or manage issues easily.</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#7C3AED]/25 border border-[#7C3AED]/40 flex items-center justify-center text-[#C084FC]">
              <Ticket className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6">
            {isAdmin || isSupport ? (
              <Link
                to="/tickets"
                className="text-xs font-semibold text-[#06B6D4] hover:text-[#22D3EE] inline-flex items-center gap-1.5"
              >
                Go to Ticket Queue &rarr;
              </Link>
            ) : (
              <Link
                to="/tickets/create"
                className="text-xs font-semibold text-[#06B6D4] hover:text-[#22D3EE] inline-flex items-center gap-1.5"
              >
                Submit a Complaint &rarr;
              </Link>
            )}
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="p-6 rounded-2xl border border-[#334155] bg-[#1E293B]/40 backdrop-blur-sm flex flex-col justify-between shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-[#CBD5E1]/60 uppercase font-semibold tracking-wider">System AI Status</span>
              <h3 className="text-xl font-bold text-white mt-1">Gemini Integration</h3>
              <p className="text-xs text-[#CBD5E1] mt-0.5">Active and listening for issues.</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-[#06B6D4]/25 border border-[#06B6D4]/40 flex items-center justify-center text-[#22D3EE]">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6">
            <span className="text-xs text-[#CBD5E1]/60">Auto-categorization is ready</span>
          </div>
        </div>
      </div>

      {/* User Specific Section */}
      {!isAdmin && !isSupport && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          
          {/* Quick Metrics */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-2xl border border-[#334155]/60 bg-[#1E293B]/30 backdrop-blur-sm space-y-4 shadow-lg">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">My Ticket Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0F172A]/50 border border-[#334155]/40">
                  <span className="text-xs text-yellow-400 font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> Open / New
                  </span>
                  <span className="text-sm font-bold text-white">{openCount}</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0F172A]/50 border border-[#334155]/40">
                  <span className="text-xs text-blue-400 font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" /> In Progress
                  </span>
                  <span className="text-sm font-bold text-white">{inProgressCount}</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0F172A]/50 border border-[#334155]/40">
                  <span className="text-xs text-green-400 font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Resolved
                  </span>
                  <span className="text-sm font-bold text-white">{resolvedCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Tickets Table */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-[#334155]/60 bg-[#1E293B]/30 backdrop-blur-sm space-y-4 shadow-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">My Recent Complaints</h3>
              <Link to="/tickets" className="text-xs text-[#06B6D4] hover:text-[#22D3EE] font-semibold">
                View All &rarr;
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-6 w-6 text-[#2563EB] animate-spin" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#334155] rounded-xl">
                <p className="text-xs text-[#CBD5E1]/60">You have not submitted any complaints yet.</p>
                <Link
                  to="/tickets/create"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#2563EB] hover:text-blue-400 font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" /> Submit your first ticket
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#334155]/40 rounded-xl">
                <table className="w-full text-left border-collapse text-xs text-[#CBD5E1]">
                  <thead>
                    <tr className="bg-[#0F172A]/50 border-b border-[#334155]/60 text-white font-semibold">
                      <th className="p-3">Subject</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]/20">
                    {tickets.map(t => (
                      <tr key={t._id} className="hover:bg-[#1E293B]/20 transition-all">
                        <td className="p-3 font-semibold text-white truncate max-w-[150px]">
                          <Link to={`/tickets/${t._id}`} className="hover:underline">
                            {t.title}
                          </Link>
                        </td>
                        <td className="p-3 capitalize">{t.category}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${getPriorityStyle(t.priority)}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${getStatusStyle(t.status)}`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
