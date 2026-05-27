import { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { 
  ArrowLeft, Clock, AlertTriangle, CheckCircle, User, Calendar, MessageSquare, Send, Sparkles, UserCheck, Trash2, Loader2 
} from "lucide-react";

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isSupport } = useContext(AuthContext);

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingTicket, setUpdatingTicket] = useState(false);

  // Fetch ticket details, comments, and staff list (if admin/support)
  const fetchData = async () => {
    setLoading(true);
    try {
      const ticketRes = await api.get(`/tickets/${id}`);
      setTicket(ticketRes.data.data);

      const commentsRes = await api.get(`/tickets/${id}/comments`);
      setComments(commentsRes.data.data);

      if (isAdmin || isSupport) {
        const staffRes = await api.get("/admin/staff");
        setStaffList(staffRes.data.data);
      }
    } catch (error) {
      console.error("Error loading ticket data:", error);
      toast.error("Failed to retrieve ticket details.");
      navigate("/tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Handle new comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await api.post(`/tickets/${id}/comments`, { message: newComment });
      if (response.data.success) {
        setComments([...comments, response.data.data]);
        setNewComment("");
        toast.success("Response added.");
        
        // Refresh ticket info to capture any status changes
        const ticketRes = await api.get(`/tickets/${id}`);
        setTicket(ticketRes.data.data);
      }
    } catch (error) {
      toast.error("Failed to post comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle ticket field updates (status, priority, assignee)
  const handleUpdateField = async (fieldName, value) => {
    setUpdatingTicket(true);
    try {
      const body = {};
      body[fieldName] = value;

      const response = await api.put(`/tickets/${id}`, body);
      if (response.data.success) {
        setTicket(response.data.data);
        toast.success(`Ticket ${fieldName} updated successfully.`);
      }
    } catch (error) {
      toast.error(`Failed to update ${fieldName}.`);
    } finally {
      setUpdatingTicket(false);
    }
  };

  // Hard delete ticket (Admin only)
  const handleDeleteTicket = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this ticket and all its comments?")) return;
    try {
      const response = await api.delete(`/tickets/${id}`);
      if (response.data.success) {
        toast.success("Ticket deleted successfully.");
        navigate("/tickets");
      }
    } catch (error) {
      toast.error("Failed to delete ticket.");
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-[#2563EB] animate-spin mb-4" />
        <span className="text-sm text-[#CBD5E1]/60">Loading ticket profile...</span>
      </div>
    );
  }

  if (!ticket) return null;

  // Stepper helper
  const steps = ["pending", "in_progress", "resolved", "closed"];
  const currentStepIndex = steps.indexOf(ticket.status);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/tickets"
            className="p-2 rounded-lg border border-[#334155] hover:bg-[#1E293B] text-[#CBD5E1] hover:text-white transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white truncate max-w-[300px] sm:max-w-[500px]">
              {ticket.title}
            </h1>
            <p className="text-xs text-[#CBD5E1]/60 mt-1">
              Ticket ID: #{ticket._id} • Submitted: {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={handleDeleteTicket}
            className="flex items-center justify-center gap-1.5 px-4 py-2 border border-red-500/30 hover:border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-200 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            Delete Ticket
          </button>
        )}
      </div>

      {/* Stepper Progress bar */}
      <div className="bg-[#1E293B]/40 border border-[#334155]/60 rounded-2xl p-6">
        <div className="flex items-center justify-between w-full max-w-3xl mx-auto relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#334155] -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] -translate-y-1/2 z-0 transition-all duration-500" 
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />

          {/* Stepper nodes */}
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step} className="flex flex-col items-center relative z-10">
                <div 
                  className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCompleted 
                      ? "bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] border-transparent text-white scale-110 shadow-lg"
                      : "bg-[#0F172A] border-[#334155] text-[#CBD5E1]/60"
                  } ${isCurrent ? "ring-4 ring-blue-500/20" : ""}`}
                >
                  {idx + 1}
                </div>
                <span className={`text-[10px] sm:text-xs font-semibold capitalize mt-2 ${isCompleted ? "text-white" : "text-[#CBD5E1]/40"}`}>
                  {step.replace("_", " ")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (Details, AI assistance, Chat feed) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Ticket Description */}
          <div className="bg-[#1E293B]/40 border border-[#334155]/60 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase text-white tracking-wider">Complaint Description</h3>
            <p className="text-sm text-[#CBD5E1] leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="border-t border-[#334155]/40 pt-4 space-y-2">
                <span className="text-xs font-semibold text-[#CBD5E1]/60 uppercase tracking-wider block">Attachments</span>
                <div className="flex flex-wrap gap-2">
                  {ticket.attachments.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#0F172A] border border-[#334155] rounded-lg text-xs text-blue-400 hover:text-blue-300 truncate max-w-[200px]"
                    >
                      Attachment_{i + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Assistance Panel */}
          {(ticket.aiSummary || ticket.aiSuggestion) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-tr from-[#1E293B]/70 to-[#7C3AED]/10 border border-[#7C3AED]/30 rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-2 text-[#A78BFA]">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Gemini AI Assistance Insights</h3>
              </div>

              {ticket.aiSummary && (
                <div className="space-y-1">
                  <span className="text-[10px] text-[#CBD5E1]/60 uppercase font-semibold">Smart Summary</span>
                  <p className="text-sm text-[#CBD5E1] italic leading-relaxed">&quot;{ticket.aiSummary}&quot;</p>
                </div>
              )}

              {ticket.aiSuggestion && (
                <div className="space-y-1 border-t border-[#334155]/30 pt-3">
                  <span className="text-[10px] text-[#CBD5E1]/60 uppercase font-semibold">Suggested Response / Resolution</span>
                  <p className="text-sm text-[#CBD5E1] leading-relaxed">{ticket.aiSuggestion}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Comments Feed thread */}
          <div className="bg-[#1E293B]/40 border border-[#334155]/60 rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-semibold uppercase text-white tracking-wider flex items-center gap-2">
              <MessageSquare className="h-4.5 w-4.5 text-[#2563EB]" />
              Conversation History ({comments.length})
            </h3>

            {/* Comment Thread List */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {comments.length === 0 ? (
                <div className="py-6 text-center text-sm text-[#CBD5E1]/40 italic">
                  No replies posted yet. Submit a message below.
                </div>
              ) : (
                comments.map((comm) => {
                  const isStaffComment = comm.userId?.role !== "user";
                  return (
                    <div
                      key={comm._id}
                      className={`flex gap-3 max-w-[85%] ${
                        comm.userId?._id === user?.id ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      {/* Avatar initials */}
                      <div className={`h-8 w-8 rounded-lg text-xs font-bold flex items-center justify-center text-white shrink-0 mt-1 ${
                        isStaffComment ? "bg-[#7C3AED]" : "bg-[#2563EB]"
                      }`}>
                        {comm.userId?.name?.substring(0,2).toUpperCase() || "U"}
                      </div>
                      
                      {/* Message body */}
                      <div className={`p-3.5 rounded-xl border flex flex-col ${
                        comm.userId?._id === user?.id 
                          ? "bg-[#2563EB]/10 border-[#2563EB]/30 rounded-tr-none text-right"
                          : isStaffComment
                            ? "bg-[#7C3AED]/10 border-[#7C3AED]/30 rounded-tl-none text-left"
                            : "bg-[#1E293B]/60 border-[#334155]/60 rounded-tl-none text-left"
                      }`}>
                        <div className="flex items-center gap-1.5 justify-between">
                          <span className="text-xs font-bold text-white">
                            {comm.userId?.name || "Deleted User"}
                          </span>
                          {isStaffComment && (
                            <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#7C3AED]/25 text-[#C084FC] border border-[#7C3AED]/30">
                              Staff
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#CBD5E1] mt-1.5 leading-relaxed break-words whitespace-pre-wrap">
                          {comm.message}
                        </p>
                        <span className="text-[9px] text-[#CBD5E1]/40 mt-2 block">
                          {new Date(comm.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply Editor Form */}
            {ticket.status === "closed" ? (
              <div className="p-4 rounded-xl bg-slate-900/50 border border-[#334155] text-center text-xs text-[#CBD5E1]/60 italic">
                This ticket is closed. Re-open or submit a new ticket to write replies.
              </div>
            ) : (
              <form onSubmit={handleCommentSubmit} className="border-t border-[#334155]/40 pt-4 flex gap-3">
                <input
                  type="text"
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={submittingComment}
                  className="flex-grow px-4 py-3 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-sm text-white placeholder-[#CBD5E1]/40 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all duration-200"
                  placeholder="Type a response message..."
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#3B82F6] hover:to-[#8B5CF6] text-white shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submittingComment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </motion.button>
              </form>
            )}
          </div>

        </div>

        {/* Right Column Sidebar (Administrative update control panel) */}
        <div className="space-y-6">
          
          {/* Metadata Card */}
          <div className="bg-[#1E293B]/40 border border-[#334155]/60 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-semibold uppercase text-white tracking-wider pb-2 border-b border-[#334155]/60">
              Ticket Parameters
            </h3>

            {/* Submitter */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
                <User className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#CBD5E1]/50 uppercase tracking-wider">Submitted By</span>
                <span className="text-sm font-semibold text-white">{ticket.createdBy?.name}</span>
                <span className="text-[10px] text-[#CBD5E1]/60">{ticket.createdBy?.email}</span>
              </div>
            </div>

            {/* Assignment Status */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
                <UserCheck className="h-4 w-4" />
              </div>
              <div className="flex flex-col flex-grow">
                <span className="text-[10px] text-[#CBD5E1]/50 uppercase tracking-wider">Assigned Staff</span>
                {isAdmin || isSupport ? (
                  <select
                    value={ticket.assignedTo?._id || ""}
                    onChange={(e) => handleUpdateField("assignedTo", e.target.value)}
                    disabled={updatingTicket}
                    className="mt-1 block w-full px-2 py-1.5 bg-[#0F172A] border border-[#334155] rounded-lg text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {staffList.map((st) => (
                      <option key={st._id} value={st._id}>
                        {st.name} ({st.role})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm font-semibold text-white">
                    {ticket.assignedTo?.name || "Pending Assignment"}
                  </span>
                )}
              </div>
            </div>

            {/* Status Option */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div className="flex flex-col flex-grow">
                <span className="text-[10px] text-[#CBD5E1]/50 uppercase tracking-wider">Status</span>
                {isAdmin || isSupport ? (
                  <select
                    value={ticket.status}
                    onChange={(e) => handleUpdateField("status", e.target.value)}
                    disabled={updatingTicket}
                    className="mt-1 block w-full px-2 py-1.5 bg-[#0F172A] border border-[#334155] rounded-lg text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                ) : (
                  <span className="text-sm font-semibold text-white capitalize mt-0.5">
                    {ticket.status.replace("_", " ")}
                  </span>
                )}
              </div>
            </div>

            {/* Priority Option */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="flex flex-col flex-grow">
                <span className="text-[10px] text-[#CBD5E1]/50 uppercase tracking-wider">Priority</span>
                {isAdmin || isSupport ? (
                  <select
                    value={ticket.priority}
                    onChange={(e) => handleUpdateField("priority", e.target.value)}
                    disabled={updatingTicket}
                    className="mt-1 block w-full px-2 py-1.5 bg-[#0F172A] border border-[#334155] rounded-lg text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                ) : (
                  <span className="text-sm font-semibold text-white capitalize mt-0.5">
                    {ticket.priority}
                  </span>
                )}
              </div>
            </div>

            {/* Date Details */}
            <div className="flex items-center gap-3 border-t border-[#334155]/40 pt-4">
              <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[#CBD5E1]">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#CBD5E1]/50 uppercase tracking-wider">Submitted</span>
                <span className="text-xs font-semibold text-white">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default TicketDetails;
