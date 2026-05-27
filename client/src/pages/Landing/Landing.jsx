import { Link } from "react-router-dom";
import { HelpCircle, Sparkles, Brain, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Landing = () => {
  const features = [
    {
      title: "AI-Powered Automation",
      description: "Automatically detect complaint categories and predict issue priorities using Google Gemini AI integrations.",
      icon: Brain,
      color: "from-purple-500/20 to-indigo-500/20 text-[#A78BFA]",
    },
    {
      title: "Smart Response Suggestions",
      description: "Generate helpful resolution hints and draft replies to speed up support turnarounds by up to 40%.",
      icon: Sparkles,
      color: "from-[#06B6D4]/20 to-blue-500/20 text-[#22D3EE]",
    },
    {
      title: "Real-time Tracking",
      description: "Submit complaints and track their lifecycle transparently from Pending and In-Progress to Resolved and Closed.",
      icon: Clock,
      color: "from-emerald-500/20 to-teal-500/20 text-[#34D399]",
    },
    {
      title: "Enterprise Grade Security",
      description: "State-of-the-art authentication using JWT, bcrypt password hashing, and role-based access control.",
      icon: ShieldCheck,
      color: "from-blue-500/20 to-sky-500/20 text-[#60A5FA]",
    },
  ];

  return (
    <div className="bg-[#0F172A] text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Glow Spheres */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-36 left-1/3 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Tagline Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#2563EB]/40 bg-[#2563EB]/10 text-xs font-semibold text-[#60A5FA] mb-6"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Powered by Google Gemini AI
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight"
        >
          Smart Complaint & Support Management,{" "}
          <span className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
            Simplified.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-[#CBD5E1] max-w-2xl leading-relaxed"
        >
          SupportSphere AI centralizes issue tracking, predicts complaint priorities automatically, and suggests AI remedies to resolve support tickets faster.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 z-10"
        >
          <Link
            to="/register"
            className="w-full sm:w-auto text-center px-8 py-4 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#3B82F6] hover:to-[#8B5CF6] text-white font-semibold rounded-xl shadow-xl shadow-blue-500/20 hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto text-center px-8 py-4 border border-[#334155] hover:bg-[#1E293B] text-[#CBD5E1] hover:text-white font-semibold rounded-xl transition-all duration-200"
          >
            Sign In
          </Link>
        </motion.div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="border-t border-[#334155] bg-[#0A0F1D]/60 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
              Engineered for Resolution Speed
            </h2>
            <p className="mt-4 text-lg text-[#CBD5E1] max-w-2xl mx-auto">
              A comprehensive suite of intelligence tools designed to streamline issue workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-8 rounded-2xl border border-[#334155]/60 bg-[#1E293B]/20 backdrop-blur-sm flex gap-5 hover:border-[#2563EB]/40 hover:bg-[#1E293B]/30 transition-all duration-300"
                >
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-tr ${feat.color} shrink-0`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feat.title}</h3>
                    <p className="text-[#CBD5E1] text-sm leading-relaxed">{feat.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Platform */}
      <section id="about" className="border-t border-[#334155] py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-xl text-left"
          >
            <h2 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
              Who is SupportSphere AI For?
            </h2>
            <p className="mt-6 text-[#CBD5E1] leading-relaxed">
              We replace chaotic WhatsApp threads, emails, phone calls, and manual spreadsheet trackers with a unified operational workspace.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-[#CBD5E1]">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#06B6D4]" />
                <strong>Colleges & Hostels:</strong> Track room, internet, and facility complaints.
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#06B6D4]" />
                <strong>Startups & SaaS:</strong> Manage customer bug queries and support inquiries.
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#06B6D4]" />
                <strong>Institutes:</strong> Allocate operations work to facilities managers.
              </li>
            </ul>
          </motion.div>

          {/* Visual Showcase Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full lg:max-w-md p-8 rounded-3xl border border-[#334155] bg-gradient-to-br from-[#1E293B]/70 to-[#0F172A]/70 shadow-2xl relative"
          >
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 h-12 w-12 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg animate-pulse">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-4">Sample AI Analysis</h3>
            <div className="space-y-3.5 text-xs text-[#CBD5E1]">
              <div className="p-3.5 rounded-lg bg-[#0F172A]/80 border border-[#334155]/50">
                <span className="text-[10px] text-[#CBD5E1]/60 uppercase tracking-wider block mb-1">User Input</span>
                &quot;The hostel high-speed WiFi router in block B has been down for 24 hours, hindering my assignment submission.&quot;
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/30">
                  <span className="text-[#60A5FA] block font-semibold mb-0.5">Category</span>
                  Technical / Network
                </div>
                <div className="p-3.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30">
                  <span className="text-[#F87171] block font-semibold mb-0.5">Priority</span>
                  High
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#7C3AED]/10 border border-[#7C3AED]/30">
                <span className="text-[#C084FC] block font-semibold mb-1">AI Suggested Solution</span>
                Perform a power cycle on the Block B network switch. If offline, dispatch a hardware support technician.
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
