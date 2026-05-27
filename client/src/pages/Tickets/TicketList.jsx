import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { 
  Ticket, Plus, Search, Filter, AlertCircle, Clock, CheckCircle2, Archive, Loader2, ChevronLeft, ChevronRight 
} from "lucide-react";

const TicketList = () => {
  const { user, isAdmin, isSupport } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Query Filters State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch tickets on load & query updates
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 8,
      };

      if (search) params.search = search;
      if (status) params.status = status;
      if (category) params.category = category;
      if (priority) params.priority = priority;

      const response = await api.get("/tickets", { params });
      if (response.data.success) {
        setTickets(response.data.data.tickets);
        setTotalPages(response.data.data.pagination.pages || 1);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, status, category, priority]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTickets();
  };

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

  const getStatusIcon = (stat) => {
    switch (stat) {
      case "resolved":
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case "in_progress":
        return <Clock className="h-3.5 w-3.5" />;
      case "closed":
        return <Archive className="h-3.5 w-3.5" />;
      default:
        return <AlertCircle className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {isAdmin || isSupport ? "Ticket Queue" : "My Complaints"}
          </h1>
          <p className="text-[#CBD5E1] text-sm mt-1">
            {isAdmin || isSupport 
              ? "Manage customer complaints and operational issues" 
              : "Submit, track, and review status of your complaints"}
          </p>
        </div>
        
        {/* Only ordinary users can submit complaints directly */}
        {!(isAdmin || isSupport) && (
          <Link
            to="/tickets/create"
            className="flex items-center justify-center gap-1.5 px-5 py-3 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#3B82F6] hover:to-[#8B5CF6] rounded-xl text-white font-semibold text-sm shadow-lg shadow-blue-500/20 hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Plus className="h-4.5 w-4.5" />
            Create Ticket
          </Link>
        )}
      </div>

      {/* Query Filters Panel */}
      <div className="bg-[#1E293B]/40 border border-[#334155]/60 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-sm text-white placeholder-[#CBD5E1]/40 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all duration-200"
            placeholder="Search tickets..."
          />
          <button type="submit" className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#CBD5E1]/40 hover:text-white">
            <Search className="h-4.5 w-4.5" />
          </button>
        </form>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Select */}
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-xs text-[#CBD5E1] outline-none focus:ring-1 focus:ring-[#2563EB]"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          {/* Category Select */}
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-xs text-[#CBD5E1] outline-none focus:ring-1 focus:ring-[#2563EB]"
          >
            <option value="">All Categories</option>
            <option value="technical">Technical</option>
            <option value="hostel">Hostel</option>
            <option value="academic">Academic</option>
            <option value="administrative">Administrative</option>
            <option value="security">Security</option>
            <option value="other">Other</option>
          </select>

          {/* Priority Select */}
          <select
            value={priority}
            onChange={(e) => { setPriority(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-xs text-[#CBD5E1] outline-none focus:ring-1 focus:ring-[#2563EB]"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Tickets List Workspace */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 text-[#2563EB] animate-spin mb-4" />
          <span className="text-sm text-[#CBD5E1]/60">Loading queue...</span>
        </div>
      ) : tickets.length === 0 ? (
        <div className="border border-[#334155]/60 rounded-2xl bg-[#1E293B]/20 py-16 px-4 text-center">
          <div className="h-12 w-12 rounded-xl bg-slate-800/80 flex items-center justify-center text-[#CBD5E1] mx-auto mb-4 border border-[#334155]">
            <Ticket className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-white">No tickets found</h3>
          <p className="text-sm text-[#CBD5E1]/60 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria, change filters, or submit a new ticket.
          </p>
          {!(isAdmin || isSupport) && (
            <Link
              to="/tickets/create"
              className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] rounded-lg text-white font-semibold text-xs shadow-lg"
            >
              Submit Ticket
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden border border-[#334155]/60 rounded-2xl bg-[#1E293B]/20">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#334155] bg-[#1E293B]/60 text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider">
                  <th className="px-6 py-4">Complaint / Ticket ID</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]/50 text-sm text-[#CBD5E1]">
                {tickets.map((t) => (
                  <tr key={t._id} className="hover:bg-[#1E293B]/30 transition-colors duration-150">
                    <td className="px-6 py-4.5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white truncate max-w-[280px]">{t.title}</span>
                        <span className="text-xs text-[#CBD5E1]/50 mt-0.5">
                          ID: #{t._id.substring(18)} • By: {t.createdBy?.name || "User"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 capitalize">{t.category}</td>
                    <td className="px-6 py-4.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${getPriorityStyle(t.priority)}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusStyle(t.status)}`}>
                        {getStatusIcon(t.status)}
                        {t.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-xs text-[#CBD5E1]/60">
                      {new Date(t.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <Link
                        to={`/tickets/${t._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] border border-[#334155] rounded-lg text-xs font-semibold text-white transition-all duration-200"
                      >
                        View Ticket
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {tickets.map((t) => (
              <div key={t._id} className="p-5 rounded-2xl border border-[#334155]/60 bg-[#1E293B]/25 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-bold text-white leading-snug">{t.title}</span>
                    <span className="text-[10px] text-[#CBD5E1]/50 mt-1">ID: #{t._id.substring(18)}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getPriorityStyle(t.priority)}`}>
                    {t.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-[#334155]/40 pt-3">
                  <span className="capitalize text-[#CBD5E1]/70">Category: {t.category}</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium capitalize ${getStatusStyle(t.status)}`}>
                    {getStatusIcon(t.status)}
                    {t.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-[#334155]/40 pt-3">
                  <span className="text-[10px] text-[#CBD5E1]/50">
                    By: {t.createdBy?.name || "User"} • {new Date(t.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/tickets/${t._id}`}
                    className="px-3.5 py-1.5 bg-[#1E293B] border border-[#334155] rounded-lg text-xs font-bold text-white"
                  >
                    View Ticket
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-[#334155] hover:bg-[#1E293B] text-[#CBD5E1] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-[#CBD5E1]">
                Page <span className="font-semibold text-white">{page}</span> of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-[#334155] hover:bg-[#1E293B] text-[#CBD5E1] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketList;
