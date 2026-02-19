"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  RunStatus,
  StepStatus,
  BugType,
  FixStatus,
  LogEntry,
  Failure,
  FixAttempt,
  Iteration,
  ExecutionStep,
  RunData,
} from "@/src/types/execution";
import { useThemeStore } from "@/src/Zustand_Store/ThemeStore";
import axios from "axios";

// --- Icons (Inline SVGs for portability) ---
const Icons = {
  CheckCircle: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-emerald-500"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  XCircle: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-rose-500"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  Clock: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Play: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  Terminal: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  Bug: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="14" x="8" y="6" rx="4" />
      <path d="m19 7-3 2" />
      <path d="m5 7 3 2" />
      <path d="m19 19-3-2" />
      <path d="m5 19 3-2" />
      <path d="M20 13h-4" />
      <path d="M4 13h4" />
      <path d="m10 4 1 2" />
    </svg>
  ),
  Wrench: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  GitBranch: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  ),
  Loader: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-blue-500"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
  Activity: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  Layers: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  Trophy: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
};

// --- Helper Components ---

const StatusBadge = ({
  status,
}: {
  status: RunStatus | StepStatus | FixStatus | string;
}) => {
  // added string to fix potential type mismatch
  let colorClass = "bg-gray-700 text-gray-300";
  let icon = null;

  switch (status) {
    case "PASSED":
    case "SUCCESS":
    case "VALIDATED":
    case "APPLIED":
      colorClass =
        "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      icon = <Icons.CheckCircle />;
      break;
    case "FAILED":
    case "ERROR":
    case "TERMINATED":
      colorClass = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      icon = <Icons.XCircle />;
      break;
    case "RUNNING":
    case "ACTIVE":
    case "INITIALIZING":
    case "WAITING_FOR_CI":
      colorClass = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      icon = <Icons.Loader />;
      break;
    case "PENDING":
    case "GENERATED":
    case "QUEUED":
    default:
      colorClass = "bg-gray-800 text-gray-400 border border-gray-700";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${colorClass}`}
    >
      {icon ? icon : null}
      {status.replace(/_/g, " ")}
    </span>
  );
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
};

// --- Main Component ---

interface LiveExecutionProps {
  projectId?: string;
}

const LiveExecution = ({ projectId }: LiveExecutionProps) => {
  const { primaryColor, secondaryColor, tertiaryColor } = useThemeStore();
  // --- State for Simulation ---
  const [runData, setRunData] = useState<RunData | null>(null);
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");
  const [showOverview, setShowOverview] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // --- Real-time Polling ---
  useEffect(() => {
    if (!projectId) return;

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/agent/project/${projectId}`,
        );
        setRunData(response.data);
        if (
          response.data.status === "PASSED" ||
          response.data.status === "FAILED"
        ) {
          // Stop polling? Optional, but maybe good to keep polling for a bit
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
      }
    };

    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [projectId]);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [runData?.logs.length]);

  if (!runData)
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{
          backgroundColor: secondaryColor,
          color: primaryColor,
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <Icons.Loader />
          <p className="text-gray-400 animate-pulse">
            Initializing Interface...
          </p>
        </div>
      </div>
    );

  const isFinished = runData.status === "PASSED" || runData.status === "FAILED";

  return (
    <div
      className="min-h-screen p-6 font-sans flex items-start justify-center"
      style={{
        backgroundColor: "#000",
        color: primaryColor,
      }}
    >
      <div className="w-full max-w-6xl rounded-2xl border border-gray-800 bg-black/40 shadow-2xl backdrop-blur-md px-8 py-6 relative">
        {/* Overview Modal */}
        {/* Overview Modal - Portal */}
        {showOverview &&
          typeof document !== "undefined" &&
          createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="relative w-full max-w-3xl bg-[#0A0A0A] border border-gray-800 rounded-2xl p-8 shadow-2xl overflow-hidden ring-1 ring-white/10">
                {/* Close Button */}
                <button
                  onClick={() => setShowOverview(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>

                <div className="flex flex-col items-center text-center">
                  {/* Success Icon */}
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                    <Icons.Trophy />
                  </div>

                  <h2 className="text-3xl font-bold text-white mb-2">
                    Execution Successful
                  </h2>
                  <p className="text-gray-400 max-w-md mb-8">
                    RepLay autonomously fixed{" "}
                    <span className="text-white font-medium">
                      {runData.totalFailuresDetected} issues
                    </span>{" "}
                    across{" "}
                    <span className="text-white font-medium">
                      {runData.iterationCount} iterations
                    </span>
                    .
                  </p>

                  {/* Metrics Graphic */}
                  <div className="grid grid-cols-3 gap-4 w-full mb-8">
                    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 flex flex-col items-center justify-center hover:border-gray-700 transition-colors">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                        Success Rate
                      </p>
                      <p className="text-2xl font-bold text-emerald-400">
                        98.4%
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 flex flex-col items-center justify-center hover:border-gray-700 transition-colors">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                        Time Saved
                      </p>
                      <p className="text-2xl font-bold text-blue-400">
                        14h 20m
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 flex flex-col items-center justify-center hover:border-gray-700 transition-colors">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                        Iterations
                      </p>
                      <p className="text-2xl font-bold text-gray-300">
                        {runData.iterationCount}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 flex flex-col items-center justify-center hover:border-gray-700 transition-colors">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                        Failures
                      </p>
                      <p className="text-2xl font-bold text-rose-400">
                        {runData.totalFailuresDetected}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 flex flex-col items-center justify-center hover:border-gray-700 transition-colors">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                        Auto-fixes
                      </p>
                      <p className="text-2xl font-bold text-purple-400">
                        {runData.fixes.length || 42}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 flex flex-col items-center justify-center hover:border-gray-700 transition-colors">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                        Steps
                      </p>
                      <p className="text-2xl font-bold text-gray-300">
                        {
                          runData.steps.filter((s) => s.status === "SUCCESS")
                            .length
                        }
                        /{runData.steps.length}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 w-full max-w-md">
                    <button className="flex-1 py-3 px-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      View Changes
                    </button>
                    <button className="flex-1 py-3 px-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 border border-gray-700 transition-colors text-sm">
                      Full Report
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )}

        {/* Header / Top Bar */}
        <header className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800/70">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-semibold">
                {runData.projectId || "checkout-service"}
              </h1>
              <StatusBadge status={runData.status} />
            </div>
            <p className="text-xs flex items-center gap-2 opacity-70">
              <span className="font-mono">
                main branch • Last run 2 mins ago
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-600"></span>
              <span className="flex items-center gap-1">
                <Icons.GitBranch /> {runData.generatedBranchName}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider mb-1 opacity-60">
                Duration
              </p>
              <p className="text-lg font-mono font-medium tabular-nums">
                {formatTime(runData.totalDurationSeconds)}
              </p>
            </div>
            {isFinished ? (
              <button
                className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 transition-colors cursor-pointer"
                style={{ color: "red" }}
              >
                Abort Run
              </button>
            ) : (
              <button
                onClick={() => setShowOverview(true)}
                className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border border-white/40 bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                style={{ color: "white" }}
              >
                See Overview
              </button>
            )}
          </div>
        </header>

        {/* Execution Interactive Stage Tracker - Moved to Top */}
        <div className="bg-black/30 backdrop-blur-md rounded-xl border border-gray-800 p-6 shadow-lg flex flex-col justify-center w-full min-h-[160px] mb-6">
          {/* Horizontal Circles Row */}
          <div className="flex items-center justify-between w-full mb-6 px-2 relative">
            {/* Connecting Line */}
            <div className="absolute left-2 right-2 top-1/2 h-0.5 bg-gray-800 -z-10 -translate-y-1/2"></div>

            {runData.steps.map((step, idx) => {
              const isActive = step.status === "ACTIVE";
              const isSuccess = step.status === "SUCCESS";
              const isError = step.status === "ERROR";

              return (
                <div
                  key={step.id}
                  className="relative group bg-[#0A0A0A] p-1 rounded-full"
                >
                  <div
                    className={`
                            flex items-center justify-center w-12 h-12 rounded-full border-2 text-xs font-bold font-mono transition-all duration-300
                            ${
                              isSuccess
                                ? "bg-emerald-500 border-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                : isActive
                                  ? "bg-black border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] scale-110"
                                  : isError
                                    ? "bg-rose-500 border-rose-500 text-white"
                                    : "bg-black border-gray-700 text-gray-600"
                            }
                          `}
                  >
                    {isSuccess ? (
                      <span>{step.duration?.replace("s", "")}s</span>
                    ) : isActive ? (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    ) : isError ? (
                      <span>!</span>
                    ) : (
                      <span className="opacity-0">.</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Stage Name Label */}
          <div className="h-8 pl-1">
            {runData.steps.map((step) => {
              if (step.status !== "ACTIVE") return null;
              return (
                <div
                  key={step.id}
                  className="animate-in fade-in slide-in-from-left-2 duration-300"
                >
                  <p className="text-emerald-500 font-mono text-sm tracking-wide flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {step.name.toLowerCase()}...
                  </p>
                </div>
              );
            })}
            {runData.steps.every(
              (s) => s.status === "SUCCESS" || s.status === "PENDING",
            ) &&
              runData.status === "PASSED" && (
                <p className="text-emerald-500 font-mono text-sm tracking-wide">
                  execution complete.
                </p>
              )}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 h-fit pb-12">
          {/* MAIN CONTENT: Logs & Results (Full Width) */}
          <div className="col-span-12 flex flex-col gap-6">
            {/* Live Logs (Terminal) */}
            <div className="h-[500px] bg-gray-900/30 backdrop-blur-md rounded-xl border border-gray-800 overflow-hidden flex flex-col shadow-lg">
              <div className="bg-white/5 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icons.Terminal />
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Terminal Output
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500"></div>
                </div>
              </div>
              <div className="flex-1 p-6 font-mono text-xs overflow-y-auto custom-scrollbar space-y-1">
                {runData.logs.length === 0 && (
                  <span className="text-gray-600 italic">
                    Initializing logs...
                  </span>
                )}
                {runData.logs.map((log, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 hover:bg-white/[0.02] rounded px-2 py-0.5 transition-colors leading-relaxed border-b border-transparent hover:border-gray-800/30"
                  >
                    <span className="text-gray-500 shrink-0 select-none w-20 text-right opacity-60">
                      {log.timestamp}
                    </span>
                    <span
                      className={`font-semibold shrink-0 w-12 text-center text-[10px] uppercase tracking-wider py-0.5 rounded ${
                        log.level === "INFO"
                          ? "bg-blue-500/10 text-blue-400"
                          : log.level === "ERROR"
                            ? "bg-rose-500/10 text-rose-400"
                            : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {log.level}
                    </span>
                    <span
                      className={`${log.level === "ERROR" ? "text-rose-300" : "text-gray-300"} break-all flex-1 pl-2`}
                    >
                      {log.message}
                    </span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>

            {/* Resolution Table (Bottom Section) */}
            <div className="h-[400px] bg-gray-900/30 backdrop-blur-md rounded-xl border border-gray-800 overflow-hidden flex flex-col shadow-lg">
              {/* Table Header */}
              <div className="flex w-full items-center gap-4 px-6 py-4 border-b border-gray-800 bg-white/5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                <div className="w-[30%]">Issue</div>
                <div className="w-[40%]">Action Taken</div>
                <div className="w-[15%]">Duration</div>
                <div className="w-[15%]">Status</div>
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar font-mono">
                {runData.failures.map((failure, i) => {
                  const fix = runData.fixes[i];
                  const fileName = failure.filePath.split("/").pop();
                  const issueText = `${failure.bugType === "SYNTAX" ? "SyntaxError" : failure.bugType} at ${fileName}:${failure.lineNumber}`;

                  return (
                    <div
                      key={failure.id}
                      className="flex w-full items-center gap-4 px-6 py-4 border-b border-gray-800/40 hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Issue Column */}
                      <div className="w-[30%] text-xs text-rose-400 truncate pr-4">
                        {issueText}
                      </div>

                      {/* Action Column */}
                      <div className="w-[40%] text-xs text-gray-300 truncate pr-4">
                        {fix ? fix.commitMessage : "Analyzing causal chain..."}
                      </div>

                      {/* Duration Column */}
                      <div className="w-[15%] text-xs text-gray-400">
                        {fix ? "12s" : "-"}
                      </div>

                      {/* Status Column */}
                      <div className="w-[15%] text-xs font-medium">
                        {fix ? (
                          <span className="text-emerald-400">Fixed</span>
                        ) : (
                          <span className="text-blue-400 animate-pulse">
                            Processing
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Fallback empty state */}
                {runData.failures.length === 0 && (
                  <div className="p-8 text-center text-gray-500 text-xs italic">
                    No active issues detected. System healthy.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(31, 41, 55, 0.5);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(75, 85, 99, 0.5);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(107, 114, 128, 0.8);
                }
            `,
          }}
        />
      </div>
    </div>
  );
};

export default LiveExecution;
