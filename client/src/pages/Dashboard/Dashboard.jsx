import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Ticket, Sparkles, User, Shield, HelpCircle } from "lucide-react";

const Dashboard = () => {
  const { user, isAdmin, isSupport } = useContext(AuthContext);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-[#CBD5E1] text-sm mt-1">
          Welcome back to SupportSphere AI. Here is your overview.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="p-6 rounded-2xl border border-[#334155] bg-[#1E293B]/40 backdrop-blur-sm flex flex-col justify-between">
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
        <div className="p-6 rounded-2xl border border-[#334155] bg-[#1E293B]/40 backdrop-blur-sm flex flex-col justify-between">
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
                to="/tickets"
                className="text-xs font-semibold text-[#06B6D4] hover:text-[#22D3EE] inline-flex items-center gap-1.5"
              >
                Submit a Complaint &rarr;
              </Link>
            )}
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="p-6 rounded-2xl border border-[#334155] bg-[#1E293B]/40 backdrop-blur-sm flex flex-col justify-between">
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
    </div>
  );
};

export default Dashboard;
