"use client";
import React, { useState, useEffect } from "react";
import {
  Folder,
  GitBranch,
  Minus,
  Plus,
  Lock,
  Rocket,
  Terminal,
  ChevronDown,
  Cpu,
  Activity,
  Zap,
} from "lucide-react";
import { useThemeStore } from "../../../Zustand_Store/ThemeStore";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const HealPage = () => {
  const { primaryColor } = useThemeStore();
  const router = useRouter();

  // Form State
  const [repoUrl, setRepoUrl] = useState("");
  const [baseBranch, setBaseBranch] = useState("main");
  const [maxRetries, setMaxRetries] = useState(5);
  const [teamName, setTeamName] = useState("");
  const [teamLeader, setTeamLeader] = useState("");
  const [token, setToken] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Blinking cursor effect for terminal header
  const [cursorVisible, setCursorVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setRepoUrl("");
    setBaseBranch("main");
    setMaxRetries(5);
    setTeamName("");
    setTeamLeader("");
    setToken("");
  };

  const handleRunAgent = async () => {
    if (!repoUrl) {
      toast.error("Repository URL is required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/agent/run-agent`,
        {
          repoUrl,
          teamName: teamName || "Anonymous Team",
          leaderName: teamLeader || "Anonymous Leader",
        },
      );

      if (response.data.success) {
        toast.success("Agent started successfully!");
        router.push(`/project/${response.data.projectId}`);
      } else {
        toast.error("Failed to start agent");
      }
    } catch (error) {
      console.error("Error running agent:", error);
      toast.error("Error communicating with server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center pt-32 pb-12 px-4 relative overflow-hidden font-sans">
      {/* Background Ambient Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Configuration Card */}
      <div className="w-full max-w-3xl bg-[#0A0A0A] rounded-xl border border-white/10 overflow-hidden shadow-2xl relative z-10 backdrop-blur-sm">
        {/* Terminal Header Bar */}
        <div className="bg-[#111111] border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs text-gray-400 select-none">
            <div className="flex gap-1.5 mr-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
            </div>
            <span className="text-green-500 font-bold">replay</span>
            <span className="text-gray-600">›</span>
            <span className="text-blue-400">configure_healing_agent.sh</span>
            <span
              className={`${cursorVisible ? "opacity-100" : "opacity-0"} inline-block w-1.5 h-4 bg-gray-500 ml-1 mb-[-2px] transition-opacity`}
            />
          </div>
          <div className="text-[10px] uppercase font-bold text-white/20 tracking-widest">
            v2.4.0-stable
          </div>
        </div>

        <div className="p-8 md:p-10 space-y-8">
          {/* Header Section */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
              Configure Healing Agent
              <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20 uppercase tracking-wide">
                System Online
              </div>
            </h1>
            <p className="text-gray-400 text-sm md:text-base max-w-xl leading-relaxed">
              Initialize autonomous CI repair protocols for your repository. The
              agent will monitor, analyze, and attempt to fix build failures
              automatically.
            </p>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Repo URL - Full Width */}
            <div className="md:col-span-2 space-y-2 group">
              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1 group-focus-within:text-white transition-colors">
                Github Repository URL
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-white/5 group-focus-within:bg-white/10 transition-colors">
                  <Folder className="w-4 h-4 text-gray-400 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/organization/repo"
                  className="w-full bg-[#151515] border border-white/5 rounded-lg py-4 pl-12 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 focus:bg-[#1A1A1A] focus:ring-1 focus:ring-white/10 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Base Branch */}
            <div className="space-y-2 group">
              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1 group-focus-within:text-white transition-colors">
                Base Branch
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-white/5 group-focus-within:bg-white/10 transition-colors">
                  <GitBranch className="w-4 h-4 text-gray-400 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="text"
                  value={baseBranch}
                  onChange={(e) => setBaseBranch(e.target.value)}
                  className="w-full bg-[#151515] border border-white/5 rounded-lg py-4 pl-12 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 focus:bg-[#1A1A1A] focus:ring-1 focus:ring-white/10 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Max Retry Iterations */}
            <div className="space-y-2 group">
              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1 group-focus-within:text-white transition-colors">
                Max Retry Iterations
              </label>
              <div className="flex items-center bg-[#151515] border border-white/5 rounded-lg overflow-hidden h-[54px] shadow-inner focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10 transition-all">
                <button
                  onClick={() => setMaxRetries(Math.max(1, maxRetries - 1))}
                  className="px-5 h-full hover:bg-white/5 text-gray-500 hover:text-white transition-colors flex items-center justify-center border-r border-white/5 active:bg-white/10"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center font-mono text-white select-none text-lg">
                  {maxRetries}
                </div>
                <button
                  onClick={() => setMaxRetries(maxRetries + 1)}
                  className="px-5 h-full hover:bg-white/5 text-gray-500 hover:text-white transition-colors flex items-center justify-center border-l border-white/5 active:bg-white/10"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Team Name */}
            <div className="space-y-2 group">
              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1 group-focus-within:text-white transition-colors">
                Team Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="RIFT ORGANISERS"
                className="w-full bg-[#151515] border border-white/5 rounded-lg py-4 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 focus:bg-[#1A1A1A] focus:ring-1 focus:ring-white/10 transition-all shadow-inner"
              />
            </div>

            {/* Team Leader Name */}
            <div className="space-y-2 group">
              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1 group-focus-within:text-white transition-colors">
                Team Leader Name
              </label>
              <input
                type="text"
                value={teamLeader}
                onChange={(e) => setTeamLeader(e.target.value)}
                className="w-full bg-[#151515] border border-white/5 rounded-lg py-4 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 focus:bg-[#1A1A1A] focus:ring-1 focus:ring-white/10 transition-all shadow-inner"
              />
            </div>

            {/* Github PAT */}
            <div className="md:col-span-2 space-y-2 group">
              <div className="flex items-center justify-between ml-1 text-[10px] uppercase tracking-wider font-bold text-gray-500">
                <label className="group-focus-within:text-white transition-colors">
                  Github Personal Access Token
                </label>
                <a
                  href="#"
                  className="flex items-center gap-1 text-[10px] normal-case font-medium text-white/40 hover:text-white hover:underline transition-colors"
                >
                  <span>generate new token</span>
                  <span className="text-xs">↗</span>
                </a>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-white/5 group-focus-within:bg-white/10 transition-colors">
                  <Lock className="w-4 h-4 text-gray-400 group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-[#151515] border border-white/5 rounded-lg py-4 pl-12 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 focus:bg-[#1A1A1A] focus:ring-1 focus:ring-white/10 transition-all shadow-inner font-mono"
                />
              </div>
              <p className="text-[10px] text-gray-600 ml-1 flex items-center gap-1.5">
                <span className="inline-block w-1 h-1 rounded-full bg-orange-500" />
                Token requires{" "}
                <span className="text-gray-500 font-mono bg-white/5 px-1 rounded">
                  repo
                </span>{" "}
                and{" "}
                <span className="text-gray-500 font-mono bg-white/5 px-1 rounded">
                  workflow
                </span>{" "}
                scopes.
              </p>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="pt-4 border-t border-white/5">
            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="flex items-center justify-between w-full p-4 rounded-lg hover:bg-white/5 transition-colors group text-left"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-md bg-[#1A1A1A] border border-white/5 group-hover:border-white/20 transition-all`}
                >
                  <Cpu className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                    Advanced Execution Settings
                  </span>
                  <span className="block text-xs text-gray-600 mt-0.5">
                    Configure environment variables, timeout limits, and docker
                    containers.
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${advancedOpen ? "rotate-180" : ""}`}
              />
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out overflow-hidden ${advancedOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"}`}
            >
              <div className="min-h-0 bg-[#0F0F0F] border border-white/5 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs text-yellow-500/80 bg-yellow-500/10 p-3 rounded border border-yellow-500/20">
                  <Activity className="w-3 h-3" />
                  Advanced settings are reserved for enterprise environments.
                </div>
                {/* Placeholder content for advanced */}
                <div className="h-20 flex items-center justify-center text-xs text-gray-700 italic border-2 border-dashed border-white/5 rounded">
                  No additional properties available
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 mt-4 border-t border-white/5">
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-lg text-sm font-medium text-gray-500 hover:text-white hover:bg-white/5 transition-all focus:outline-none focus:ring-1 focus:ring-white/10"
            >
              Reset Configuration
            </button>
            <button
              onClick={handleRunAgent}
              disabled={isLoading}
              className="group relative px-8 py-3 rounded-lg text-sm font-bold text-black flex items-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden"
              style={{ backgroundColor: primaryColor || "#E0E1DD" }}
            >
              <span className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <Rocket className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative z-10">
                {isLoading ? "Initializing..." : "Run Healing Agent"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealPage;
