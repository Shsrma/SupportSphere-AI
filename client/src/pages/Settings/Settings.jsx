import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Fingerprint, Loader2, ShieldCheck, KeyRound } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const Settings = () => {
  const { user, registerPasskey } = useContext(AuthContext);
  const [registering, setRegistering] = useState(false);

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
    </div>
  );
};

export default Settings;
