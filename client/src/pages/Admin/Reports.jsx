import { useState } from "react";
import api from "../../services/api";
import { jsPDF } from "jspdf";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { 
  FileText, Download, Ticket, Sparkles, BarChart3, Loader2, ArrowRight 
} from "lucide-react";

const Reports = () => {
  const [downloading, setDownloading] = useState(false);
  const [ticketId, setTicketId] = useState("");

  // Report 1: System Analytics Summary
  const generateAnalyticsReport = async () => {
    setDownloading(true);
    try {
      const response = await api.get("/admin/analytics");
      if (!response.data.success) throw new Error("Failed to load metrics");
      const { kpis, categoryStats } = response.data.data;

      const doc = new jsPDF();
      
      // Branding Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235); // #2563EB
      doc.text("SupportSphere.AI", 20, 25);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`System Analytics Performance Report — Generated on: ${new Date().toLocaleString()}`, 20, 32);
      
      // Divider
      doc.setDrawColor(203, 213, 225);
      doc.line(20, 36, 190, 36);

      // Section 1: KPI Statistics
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("Key Performance Indicators (KPIs)", 20, 48);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`• Total Complaints Submitted: ${kpis.total}`, 25, 58);
      doc.text(`• Resolved Complaints: ${kpis.resolved}`, 25, 66);
      doc.text(`• Pending/In-Progress Backlog: ${kpis.pending}`, 25, 74);
      doc.text(`• Closed/Archived Cases: ${kpis.closed}`, 25, 82);
      doc.text(`• Average Ticket Resolution Time: ${kpis.avgResolutionTime} hours`, 25, 90);

      // Section 2: Category Weights
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Complaint Categories Distribution", 20, 106);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      let currentY = 116;
      Object.entries(categoryStats).forEach(([cat, val]) => {
        const percentage = kpis.total > 0 ? Math.round((val / kpis.total) * 100) : 0;
        doc.text(`• ${cat.charAt(0).toUpperCase() + cat.slice(1)}: ${val} tickets (${percentage}%)`, 25, currentY);
        currentY += 8;
      });

      // Footer notice
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 270, 190, 270);
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text("SupportSphere AI Operations Management — Confidential internal statistics report.", 20, 278);

      doc.save(`SupportSphere_System_Report_${Date.now()}.pdf`);
      toast.success("Analytics PDF downloaded successfully!");
    } catch (error) {
      toast.error("Failed to generate analytics report.");
      console.error(error);
    } finally {
      setDownloading(false);
    }
  };

  // Report 2: All Active Tickets Log
  const generateActiveTicketsReport = async () => {
    setDownloading(true);
    try {
      const response = await api.get("/tickets", { params: { limit: 100 } });
      if (!response.data.success) throw new Error("Failed to load tickets");
      const tickets = response.data.data.tickets;

      const doc = new jsPDF();
      
      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235);
      doc.text("SupportSphere.AI", 20, 25);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`Active Ticket Queue Registry — Compiled on: ${new Date().toLocaleString()}`, 20, 32);
      
      doc.setDrawColor(203, 213, 225);
      doc.line(20, 36, 190, 36);

      // Section title
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("Active Complaint Registry Logs", 20, 48);

      // Render simple table header
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("ID", 20, 60);
      doc.text("Subject/Title", 40, 60);
      doc.text("Category", 110, 60);
      doc.text("Priority", 140, 60);
      doc.text("Status", 165, 60);
      doc.line(20, 63, 190, 63);

      doc.setFont("helvetica", "normal");
      let y = 70;
      
      tickets.forEach((t, i) => {
        if (y > 260) {
          doc.addPage();
          y = 30; // reset y offset on new page
        }
        
        const shortId = t._id.substring(18);
        const titleText = t.title.length > 32 ? t.title.substring(0, 30) + "..." : t.title;

        doc.text(`#${shortId}`, 20, y);
        doc.text(titleText, 40, y);
        doc.text(t.category, 110, y);
        doc.text(t.priority, 140, y);
        doc.text(t.status.replace("_", " "), 165, y);
        
        y += 8;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("SupportSphere Operations Management Team", 20, 280);

      doc.save(`SupportSphere_Active_Queue_${Date.now()}.pdf`);
      toast.success("Active tickets queue report downloaded!");
    } catch (error) {
      toast.error("Failed to generate ticket registry report.");
    } finally {
      setDownloading(false);
    }
  };

  // Report 3: Individual Case Audit Report
  const generateCaseReport = async (e) => {
    e.preventDefault();
    if (!ticketId.trim()) {
      toast.error("Please enter a valid ticket ID.");
      return;
    }

    setDownloading(true);
    try {
      const response = await api.get(`/tickets/${ticketId}`);
      if (!response.data.success) throw new Error("Ticket not found");
      const ticket = response.data.data;

      const commentsRes = await api.get(`/tickets/${ticketId}/comments`);
      const comments = commentsRes.data.data;

      const doc = new jsPDF();
      
      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235);
      doc.text("SupportSphere.AI", 20, 25);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`Case Audit Report — Generated on: ${new Date().toLocaleString()}`, 20, 32);
      
      doc.setDrawColor(203, 213, 225);
      doc.line(20, 36, 190, 36);

      // Section 1: Ticket metadata
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("Case Identification Profile", 20, 48);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`• Title: ${ticket.title}`, 25, 58);
      doc.text(`• Full Case ID: ${ticket._id}`, 25, 66);
      doc.text(`• Category: ${ticket.category}`, 25, 74);
      doc.text(`• Urgency Priority: ${ticket.priority}`, 25, 82);
      doc.text(`• Status: ${ticket.status.replace("_", " ")}`, 25, 90);
      doc.text(`• Submitted By: ${ticket.createdBy?.name} (${ticket.createdBy?.email})`, 25, 98);
      doc.text(`• Assigned Agent: ${ticket.assignedTo?.name || "Unassigned"}`, 25, 106);

      // Section 2: Detailed Complaint Description
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Detailed Issue Description", 20, 122);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      // Split description text to fit PDF width bounds
      const splitDesc = doc.splitTextToSize(ticket.description, 160);
      doc.text(splitDesc, 25, 132);
      
      let nextY = 132 + (splitDesc.length * 6) + 12;

      // Section 3: AI Assistance predictions
      if (ticket.aiSummary || ticket.aiSuggestion) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Gemini AI Auto-Analysis Metrics", 20, nextY);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        nextY += 8;
        if (ticket.aiSummary) {
          doc.text(`• AI Summary: "${ticket.aiSummary}"`, 25, nextY);
          nextY += 8;
        }
        if (ticket.aiSuggestion) {
          doc.text("• AI Resolution Recommendation:", 25, nextY);
          nextY += 6;
          const splitSuggest = doc.splitTextToSize(ticket.aiSuggestion, 155);
          doc.text(splitSuggest, 28, nextY);
          nextY += (splitSuggest.length * 5) + 12;
        }
      }

      // Section 4: Reply Thread list
      if (comments.length > 0) {
        if (nextY > 230) {
          doc.addPage();
          nextY = 30;
        }
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Audit Conversation Log Thread", 20, nextY);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        
        nextY += 10;
        comments.forEach((comm) => {
          if (nextY > 260) {
            doc.addPage();
            nextY = 30;
          }
          const isStaff = comm.userId?.role !== "user" ? " (Staff)" : "";
          doc.setFont("helvetica", "bold");
          doc.text(`${comm.userId?.name}${isStaff} — ${new Date(comm.createdAt).toLocaleString()}:`, 25, nextY);
          doc.setFont("helvetica", "normal");
          
          nextY += 5;
          const splitMsg = doc.splitTextToSize(comm.message, 150);
          doc.text(splitMsg, 28, nextY);
          nextY += (splitMsg.length * 5) + 8;
        });
      }

      doc.save(`SupportSphere_Case_Report_${ticket._id.substring(18)}.pdf`);
      toast.success("Case Audit Report PDF downloaded!");
      setTicketId("");
    } catch (error) {
      toast.error("Failed to compile case report. Check ticket ID.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <FileText className="h-8 w-8 text-[#2563EB]" />
          System Reports & Auditing
        </h1>
        <p className="text-[#CBD5E1] text-sm mt-1">
          Generate and download operational reports, performance logs, and case profiles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box 1: Aggregate Reports */}
        <div className="p-6 rounded-2xl border border-[#334155] bg-[#1E293B]/40 backdrop-blur-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#06B6D4]" />
              Analytical Summaries
            </h3>
            <p className="text-xs text-[#CBD5E1]/60 mt-1">
              Download system performance parameters, average resolution rates, and category statistics.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {/* Download Analytics Summary */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={generateAnalyticsReport}
              disabled={downloading}
              className="w-full flex items-center justify-between p-4 bg-[#0F172A]/80 hover:bg-[#0F172A] border border-[#334155] rounded-xl text-left text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#06B6D4]/10 text-[#22D3EE]">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-white block">System Analytics Summary</span>
                  <span className="text-[10px] text-[#CBD5E1]/50">Includes resolved rates & category counts</span>
                </div>
              </div>
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#CBD5E1]" />
              ) : (
                <Download className="h-4 w-4 text-[#CBD5E1] hover:text-white" />
              )}
            </motion.button>

            {/* Download Active Ticket Registry */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={generateActiveTicketsReport}
              disabled={downloading}
              className="w-full flex items-center justify-between p-4 bg-[#0F172A]/80 hover:bg-[#0F172A] border border-[#334155] rounded-xl text-left text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#2563EB]/10 text-[#60A5FA]">
                  <Ticket className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-white block">Active Queue Registry Logs</span>
                  <span className="text-[10px] text-[#CBD5E1]/50">List of all active active tickets</span>
                </div>
              </div>
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#CBD5E1]" />
              ) : (
                <Download className="h-4 w-4 text-[#CBD5E1] hover:text-white" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Box 2: Single Case Auditing */}
        <div className="p-6 rounded-2xl border border-[#334155] bg-[#1E293B]/40 backdrop-blur-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#A78BFA]" />
                Single Case Audit Report
              </h3>
              <p className="text-xs text-[#CBD5E1]/60 mt-1">
                Enter an individual MongoDB ticket ID to compile a full audit report detailing user description, active Gemini AI suggestions, and conversation log thread.
              </p>
            </div>

            <form onSubmit={generateCaseReport} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#CBD5E1]/60 uppercase tracking-wider mb-2" htmlFor="ticketId">
                  Enter Ticket MongoDB ID
                </label>
                <input
                  id="ticketId"
                  type="text"
                  required
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  className="block w-full px-4 py-3 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-sm text-white placeholder-[#CBD5E1]/40 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all duration-200"
                  placeholder="e.g. 642e7428f52a7812f200c921"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={downloading || !ticketId.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#3B82F6] hover:to-[#8B5CF6] rounded-xl text-xs font-semibold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    Generate Case Profile PDF
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
