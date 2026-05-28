import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Fingerprint, Loader2, ShieldCheck, KeyRound } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import api from "../../services/api";

const Settings = () => {
  const { user, registerPasskey } = useContext(AuthContext);
  const [registering, setRegistering] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const validRoles = [
    "⚡ god_admin",
    "👑 super_admin",
    "🛡️ admin",
    "⚜️ support_manager",
    "⚙️ support_agent",
    "🤖 ai_reviewer",
    "📊 analytics_manager",
    "📁 organization_manager",
    "📁 verified_user",
    "🔹 guest_user"
  ];

  const isSystemAdmin = ["⚡ god_admin", "👑 super_admin", "🛡️ admin"].includes(user?.role);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await api.get("/admin/users");
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load user list");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isSystemAdmin) {
      fetchUsers();
    }
  }, [user, isSystemAdmin]);

  const handleUpdateRole = async (targetUserId, newRole) => {
    setUpdatingUserId(targetUserId);
    try {
      const response = await api.put(`/admin/users/${targetUserId}/role`, { role: newRole });
      if (response.data.success) {
        toast.success("User role updated successfully!");
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to update role:", error);
      const msg = error.response?.data?.message || "Failed to update role.";
      toast.error(msg);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleRegisterPasskey = async () => {
    setRegistering(true);
    toast.loading("Initiating device biometric registration...", { id: "passkey-reg" });
    
    const result = await registerPasskey();
    
    if (result.success) {
      toast.success(result.message || "Passkey device registered successfully!", { id: "passkey-reg" });
    } else {
      toast.error(result.error || "Device registration failed or cancelled.", { id: "passkey-reg" });
    }
    setRegistering(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-[#CBD5E1] text-sm mt-1">
          Manage your account preferences, biometrics, and security options.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Profile Card */}
        <div className="bg-[#1E293B]/40 border border-[#334155]/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#2563EB]" />
            User Details
          </h3>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-3 border-b border-[#334155]/30 pb-3.5">
              <span className="text-[#CBD5E1]/60 font-medium">Name</span>
              <span className="col-span-2 text-white font-semibold">{user?.name}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-[#334155]/30 pb-3.5">
              <span className="text-[#CBD5E1]/60 font-medium">Email</span>
              <span className="col-span-2 text-white font-semibold break-all">{user?.email}</span>
            </div>
            <div className="grid grid-cols-3 border-b border-[#334155]/30 pb-3.5">
              <span className="text-[#CBD5E1]/60 font-medium">Role</span>
              <span className="col-span-2 text-[#06B6D4] font-bold uppercase tracking-wider text-xs">
                {user?.role}
              </span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-[#CBD5E1]/60 font-medium">Status</span>
              <span className="col-span-2 text-emerald-400 font-bold uppercase tracking-wider text-xs">
                {user?.status}
              </span>
            </div>
          </div>
        </div>

        {/* Biometric Credentials Card */}
        <div className="bg-[#1E293B]/40 border border-[#334155]/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-[#7C3AED]" />
            Passkeys & Biometrics
          </h3>
          <p className="text-xs text-[#CBD5E1]/70 leading-relaxed">
            Register your device to log in securely using biometric features like **Touch ID**, **Face ID**, or **Windows Hello**. This adds platform-grade cryptographic MFA protection to your SupportSphere account.
          </p>

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleRegisterPasskey}
              disabled={registering}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:from-[#8B5CF6] hover:to-[#3B82F6] shadow-lg shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 cursor-pointer"
            >
              {registering ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Generating challenge...
                </>
              ) : (
                <>
                  <KeyRound className="h-4.5 w-4.5" />
                  Register Device Passkey
                </>
              )}
            </motion.button>
          </div>
        </div>

      </div>

      {isSystemAdmin && (
        <div className="bg-[#1E293B]/40 border border-[#334155]/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#38BDF8]" />
                Role Management Control Panel
              </h3>
              <p className="text-xs text-[#CBD5E1]/70 mt-1">
                Assign and update system roles for registered users.
              </p>
            </div>
            
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0F172A]/80 border border-[#334155] rounded-xl px-4 py-2 text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#38BDF8] transition-all"
              />
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 text-[#38BDF8] animate-spin" />
              <span className="text-xs text-[#CBD5E1] ml-2">Loading users...</span>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#334155]/40 rounded-xl">
              <table className="w-full text-left border-collapse text-xs text-[#CBD5E1]">
                <thead>
                  <tr className="bg-[#0F172A]/50 border-b border-[#334155]/60 text-white font-semibold">
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Current Role</th>
                    <th className="p-3">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]/30">
                  {users
                    .filter(u => 
                      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      u.email.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(u => {
                      const getRoleRank = (roleName) => validRoles.indexOf(roleName);
                      const requesterRank = getRoleRank(user?.role);
                      const targetRank = getRoleRank(u.role);
                      
                      // God Admin can modify anyone. Non-god users can only modify users strictly below them in privilege (greater index = lower rank).
                      const canModify = user?.role === "⚡ god_admin" || targetRank > requesterRank;

                      return (
                        <tr key={u._id} className="hover:bg-[#1E293B]/20 transition-all">
                          <td className="p-3 font-medium text-white">{u.name}</td>
                          <td className="p-3 text-slate-300 select-all">{u.email}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              u.role === "⚡ god_admin" ? "bg-amber-500/10 text-amber-400 border border-amber-500/25" :
                              u.role.includes("super_admin") || u.role.includes("admin") ? "bg-red-500/10 text-red-400 border border-red-500/25" :
                              u.role.includes("support") ? "bg-blue-500/10 text-blue-400 border border-blue-500/25" :
                              "bg-slate-500/10 text-slate-300 border border-slate-500/25"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3">
                            {!canModify ? (
                              <span className="text-[10px] text-[#EF4444] font-medium italic">Immutable</span>
                            ) : (
                              <select
                                value={u.role}
                                disabled={updatingUserId === u._id}
                                onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                                className="bg-[#0F172A] border border-[#334155] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#38BDF8] disabled:opacity-50 cursor-pointer"
                              >
                                {validRoles.map(r => {
                                  // Enforce role hierarchy: options must be strictly below the logged-in user's own rank
                                  const optionRank = getRoleRank(r);
                                  if (user?.role !== "⚡ god_admin" && optionRank <= requesterRank) return null;
                                  return (
                                    <option key={r} value={r}>
                                      {r}
                                    </option>
                                  );
                                })}
                              </select>
                            )}
                            {updatingUserId === u._id && (
                              <Loader2 className="inline h-3.5 w-3.5 text-[#38BDF8] animate-spin ml-2 align-middle" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Settings;
