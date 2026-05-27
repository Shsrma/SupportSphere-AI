import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Settings = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-[#CBD5E1] text-sm mt-1">
          Manage your account preferences and profile details.
        </p>
      </div>

      <div className="bg-[#1E293B]/40 border border-[#334155] rounded-2xl p-6 max-w-xl">
        <h3 className="text-lg font-semibold text-white mb-4">User Details</h3>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-3 border-b border-[#334155]/60 pb-3">
            <span className="text-[#CBD5E1]/60 font-medium">Name</span>
            <span className="col-span-2 text-white font-semibold">{user?.name}</span>
          </div>
          <div className="grid grid-cols-3 border-b border-[#334155]/60 pb-3">
            <span className="text-[#CBD5E1]/60 font-medium">Email</span>
            <span className="col-span-2 text-white font-semibold">{user?.email}</span>
          </div>
          <div className="grid grid-cols-3 border-b border-[#334155]/60 pb-3">
            <span className="text-[#CBD5E1]/60 font-medium">Role</span>
            <span className="col-span-2 text-[#06B6D4] font-semibold uppercase tracking-wider text-xs">
              {user?.role}
            </span>
          </div>
          <div className="grid grid-cols-3">
            <span className="text-[#CBD5E1]/60 font-medium">Status</span>
            <span className="col-span-2 text-emerald-400 font-semibold uppercase tracking-wider text-xs">
              {user?.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
