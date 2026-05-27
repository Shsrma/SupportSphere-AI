import { useState, useEffect } from "react";
import api from "../../services/api";
import { motion } from "framer-motion";
import { 
  Bar, Doughnut 
} from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend 
} from "chart.js";
import { 
  Ticket, CheckCircle, Clock, Archive, Sparkles, Loader2, BarChart3, PieChart 
} from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get("/admin/analytics");
        if (response.data.success) {
          setAnalytics(response.data.data);
        }
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-[#2563EB] animate-spin mb-4" />
        <span className="text-sm text-[#CBD5E1]/60">Compiling system diagnostics...</span>
      </div>
    );
  }

  if (!analytics) return null;

  const { kpis, categoryStats, monthlyStats } = analytics;

  // Doughnut Chart: Category Distribution
  const categoryChartData = {
    labels: Object.keys(categoryStats).map((cat) => cat.charAt(0).toUpperCase() + cat.slice(1)),
    datasets: [
      {
        data: Object.values(categoryStats),
        backgroundColor: [
          "#3B82F6", // technical - Blue
          "#10B981", // hostel - Emerald
          "#F59E0B", // academic - Yellow
          "#8B5CF6", // administrative - Purple
          "#EF4444", // security - Red
          "#64748B", // other - Slate
        ],
        borderWidth: 1,
        borderColor: "#1E293B",
      },
    ],
  };

  const categoryChartOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#CBD5E1",
          font: { size: 11, family: "Inter" },
          padding: 15,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Bar Chart: Monthly Volume Trends
  const trendChartData = {
    labels: monthlyStats.map((item) => item.month),
    datasets: [
      {
        label: "Tickets Created",
        data: monthlyStats.map((item) => item.tickets),
        backgroundColor: "#2563EB",
        borderRadius: 6,
      },
      {
        label: "Tickets Resolved",
        data: monthlyStats.map((item) => item.resolved),
        backgroundColor: "#10B981",
        borderRadius: 6,
      },
    ],
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#CBD5E1",
          font: { family: "Inter" },
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(51, 65, 85, 0.3)" },
        ticks: { color: "#CBD5E1", font: { family: "Inter" } },
      },
      y: {
        grid: { color: "rgba(51, 65, 85, 0.3)" },
        ticks: { color: "#CBD5E1", font: { family: "Inter" }, stepSize: 1 },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-[#06B6D4]" />
          Analytics Dashboard
        </h1>
        <p className="text-[#CBD5E1] text-sm mt-1">
          Monitor system-wide metrics, resolution statistics, and complaint distribution.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        
        {/* Total Tickets */}
        <div className="p-5 rounded-2xl border border-[#334155] bg-[#1E293B]/40 backdrop-blur-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-[#CBD5E1]/60 uppercase font-semibold tracking-wider">Total Complaints</span>
            <div className="p-2 rounded-lg bg-[#2563EB]/10 text-[#60A5FA]">
              <Ticket className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">{kpis.total}</h3>
            <span className="text-[10px] text-[#CBD5E1]/50 mt-1 block">Lifetime volume</span>
          </div>
        </div>

        {/* Resolved Cards */}
        <div className="p-5 rounded-2xl border border-[#334155] bg-[#1E293B]/40 backdrop-blur-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-[#CBD5E1]/60 uppercase font-semibold tracking-wider">Resolved</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">{kpis.resolved}</h3>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
              {kpis.total > 0 ? Math.round((kpis.resolved / kpis.total) * 100) : 0}% success rate
            </span>
          </div>
        </div>

        {/* Pending Tickets */}
        <div className="p-5 rounded-2xl border border-[#334155] bg-[#1E293B]/40 backdrop-blur-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-[#CBD5E1]/60 uppercase font-semibold tracking-wider">Active Backlog</span>
            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">{kpis.pending}</h3>
            <span className="text-[10px] text-[#CBD5E1]/50 mt-1 block">Awaiting completion</span>
          </div>
        </div>

        {/* Closed Tickets */}
        <div className="p-5 rounded-2xl border border-[#334155] bg-[#1E293B]/40 backdrop-blur-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-[#CBD5E1]/60 uppercase font-semibold tracking-wider">Closed</span>
            <div className="p-2 rounded-lg bg-slate-500/10 text-slate-400">
              <Archive className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">{kpis.closed}</h3>
            <span className="text-[10px] text-[#CBD5E1]/50 mt-1 block">Archived complaints</span>
          </div>
        </div>

        {/* Average Resolution Speed */}
        <div className="p-5 rounded-2xl border border-[#334155] bg-[#1E293B]/40 backdrop-blur-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-[#CBD5E1]/60 uppercase font-semibold tracking-wider">Avg Res Time</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">
              {kpis.avgResolutionTime > 0 ? `${kpis.avgResolutionTime}h` : "N/A"}
            </h3>
            <span className="text-[10px] text-cyan-400 font-semibold mt-1 block">AI optimized</span>
          </div>
        </div>

      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-[#334155] bg-[#1E293B]/40 backdrop-blur-sm h-[380px] flex flex-col">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Monthly ticket progression</h3>
          <div className="flex-grow relative">
            <Bar data={trendChartData} options={trendChartOptions} />
          </div>
        </div>

        {/* Category Doughnut Chart */}
        <div className="p-6 rounded-2xl border border-[#334155] bg-[#1E293B]/40 backdrop-blur-sm h-[380px] flex flex-col">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <PieChart className="h-4 w-4 text-[#A78BFA]" />
            Category Distribution
          </h3>
          <div className="flex-grow relative min-h-[220px]">
            <Doughnut data={categoryChartData} options={categoryChartOptions} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
