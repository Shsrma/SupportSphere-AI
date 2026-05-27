import { Link } from "react-router-dom";
import { Ticket, Plus } from "lucide-react";

const TicketList = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Tickets</h1>
          <p className="text-[#CBD5E1] text-sm mt-1">Submit and track your complaints.</p>
        </div>
        <Link
          to="/tickets/create"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] rounded-lg text-white font-semibold text-sm hover:shadow-lg transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
          Create Ticket
        </Link>
      </div>

      <div className="border border-[#334155] rounded-2xl bg-[#1E293B]/20 p-12 text-center">
        <div className="h-12 w-12 rounded-xl bg-slate-800/80 flex items-center justify-center text-[#CBD5E1] mx-auto mb-4">
          <Ticket className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-white">No tickets submitted yet</h3>
        <p className="text-sm text-[#CBD5E1]/60 mt-1 max-w-sm mx-auto">
          When you submit a support or complaint ticket, it will appear here.
        </p>
      </div>
    </div>
  );
};

export default TicketList;
