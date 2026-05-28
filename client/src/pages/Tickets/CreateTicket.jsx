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
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + attachments.length > 5) {
      toast.error("You can upload a maximum of 5 attachments.");
      return;
    }
    setAttachments([...attachments, ...files]);
  };

  const handleRemoveFile = (index) => {
    setAttachments(attachments.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error("Please provide both a title and description.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("priority", priority);
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await api.post("/tickets", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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

          {/* File Upload Field */}
          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider mb-2">
              Attachments (Images, PDFs, or Code / Logs)
            </label>
            <div className="flex flex-col gap-3">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.webp,.pdf,.txt,.log,.json,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.h,.html,.css,.md"
                className="block w-full text-xs text-[#CBD5E1] file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border file:border-[#334155] file:text-xs file:font-semibold file:bg-[#0F172A] file:text-white hover:file:bg-[#1E293B] file:cursor-pointer cursor-pointer border border-[#334155]/60 bg-[#0F172A]/30 p-2 rounded-xl"
              />
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-[#0F172A] border border-[#334155] rounded-lg text-xs text-white max-w-[200px]">
                      <span className="truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="text-[#EF4444] hover:text-red-400 font-bold focus:outline-none cursor-pointer"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <span className="text-[10px] text-[#CBD5E1]/50">
                Max 5 files. Max size 5MB each. Supported formats: Images (JPEG, PNG, WEBP), PDFs, and text/code logs.
              </span>
            </div>
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
