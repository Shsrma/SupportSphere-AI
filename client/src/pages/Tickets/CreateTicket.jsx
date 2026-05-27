import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { ArrowLeft, Send, Loader2, Sparkles, AlertCircle } from "lucide-react";

const CreateTicket = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [priority, setPriority] = useState("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error("Please provide both a title and description.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/tickets", {
        title,
        description,
        category,
        priority,
      });

      if (response.data.success) {
        toast.success("Ticket submitted successfully! AI analysis triggered.");
        navigate("/tickets");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to submit ticket.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/tickets"
            className="p-2 rounded-lg border border-[#334155] hover:bg-[#1E293B] text-[#CBD5E1] hover:text-white transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Create Ticket</h1>
            <p className="text-[#CBD5E1] text-sm mt-1">
              Submit a support query or operational complaint
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#1E293B]/40 backdrop-blur-xl border border-[#334155]/60 rounded-2xl p-6 sm:p-8 shadow-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title Field */}
          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2" htmlFor="title">
              Complaint Subject / Title *
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full px-4 py-3 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-white placeholder-[#CBD5E1]/40 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all duration-200"
              placeholder="Brief summary of the issue (e.g. WiFi down in Hostel Block B)"
              maxLength={100}
            />
          </div>

          {/* Grid for Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Category Field */}
            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2" htmlFor="category">
                Category Selection
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full px-4 py-3 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-white outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200 cursor-pointer"
              >
                <option value="technical">Technical / Infrastructure</option>
                <option value="hostel">Hostel / Accommodation</option>
                <option value="academic">Academic / Education</option>
                <option value="administrative">Administrative / Docs</option>
                <option value="security">Security / Safety</option>
                <option value="other">Other Issues</option>
              </select>
            </div>

            {/* Priority Field */}
            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2" htmlFor="priority">
                Self-Assessed Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="block w-full px-4 py-3 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-white outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200 cursor-pointer"
              >
                <option value="low">Low (General Query)</option>
                <option value="medium">Medium (Needs attention)</option>
                <option value="high">High (Hindering work)</option>
                <option value="critical">Critical (Immediate shutdown)</option>
              </select>
            </div>

          </div>

          {/* Description Field */}
          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2" htmlFor="description">
              Detailed Description *
            </label>
            <textarea
              id="description"
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full px-4 py-3 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-white placeholder-[#CBD5E1]/40 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all duration-200 resize-y"
              placeholder="Provide as much detail as possible. Specify block numbers, lab rooms, device identifiers, or timelines..."
            />
          </div>

          {/* AI Banner Callout */}
          <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 flex gap-3 text-sm text-[#CBD5E1]">
            <Sparkles className="h-5 w-5 text-[#A78BFA] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">AI-Assisted Resolution:</span> Upon submission, our integration with Google Gemini will automatically analyze the complaint to confirm categorization, predict priority urgency, and draft action remedies.
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#3B82F6] hover:to-[#8B5CF6] rounded-xl text-sm font-semibold text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting Ticket...
                </>
              ) : (
                <>
                  Submit Ticket
                  <Send className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};

export default CreateTicket;
