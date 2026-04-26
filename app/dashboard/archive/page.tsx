"use client";

import React, { useState } from "react";
import { useUser } from "@/lib/UserContext";
import { 
  ArchiveBoxIcon, 
  ChatBubbleLeftRightIcon, 
  CheckBadgeIcon, 
  AcademicCapIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

export default function ArchivePage() {
  const { profile } = useUser();
  const [activeTab, setActiveTab] = useState<"all" | "tasks" | "chats" | "assessments">("all");
  const [search, setSearch] = useState("");

  // Aggregate Data
  const allTasks = profile.events.flatMap(e => 
    (e.completedTasks || []).map((t, idx) => ({ type: "task", title: `Completed Task from ${e.name}`, desc: t, date: e.date, id: `task-${e.id}-${idx}` }))
  );

  const allChats = profile.chatHistorySnapshot?.map((c, idx) => {
    // Handling generic structured chat histories gracefully
    const textPreview = typeof c === 'string' ? c : (c.content || c.message || JSON.stringify(c));
    return { type: "chat", title: "AI Tutor Session", desc: textPreview, date: new Date().toISOString(), id: `chat-${idx}` };
  }) || [];

  const allAssessments = profile.activityLogs?.filter(a => a.type === "quiz" || a.type === "assessment").map((a, idx) => (
    { type: "assessment", title: "Skill Evaluation", desc: a.detail || "Completed a quiz module.", date: a.date || new Date().toISOString(), id: `eval-${idx}` }
  )) || [];

  // Combine and sort
  const masterLog = [...allTasks, ...allChats, ...allAssessments].filter(item => {
    if (activeTab !== "all" && item.type !== (activeTab === "assessments" ? "assessment" : activeTab.slice(0, -1))) return false;
    if (search && !item.desc.toLowerCase().includes(search.toLowerCase()) && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <ArchiveBoxIcon className="w-5 h-5 text-indigo-500" />
            </div>
            <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">Memory Vault</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Data <span className="text-indigo-400">Archive</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Access your entire history of completed tasks, AI conversations, and evaluations.</p>
        </div>

        <div className="relative w-full md:w-72">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text"
            placeholder="Search archives..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors shadow-inner"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveTab("all")} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === "all" ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]" : "bg-slate-800/50 text-slate-400 hover:text-white"}`}>All History</button>
        <button onClick={() => setActiveTab("tasks")} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "tasks" ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "bg-slate-800/50 text-slate-400 hover:text-white"}`}>
          <CheckBadgeIcon className="w-4 h-4" /> Completed Tasks
        </button>
        <button onClick={() => setActiveTab("chats")} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "chats" ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]" : "bg-slate-800/50 text-slate-400 hover:text-white"}`}>
          <ChatBubbleLeftRightIcon className="w-4 h-4" /> AI Transcripts
        </button>
        <button onClick={() => setActiveTab("assessments")} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "assessments" ? "bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]" : "bg-slate-800/50 text-slate-400 hover:text-white"}`}>
          <AcademicCapIcon className="w-4 h-4" /> Quiz & Assessments
        </button>
      </div>

      {/* Vault Grid */}
      {masterLog.length === 0 ? (
        <div className="w-full flex justify-center py-20">
          <div className="text-center space-y-4">
            <ArchiveBoxIcon className="w-16 h-16 text-slate-800 mx-auto" />
            <p className="text-slate-500 font-medium">No archived records found for this filter.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {masterLog.map(record => (
            <div key={record.id} className="bg-slate-900 border border-slate-800/80 rounded-[1.5rem] p-6 flex flex-col hover:border-indigo-500/50 transition-all hover:-translate-y-1 shadow-lg group relative overflow-hidden">
              
              {/* Type Badge Header */}
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl flex items-center justify-center
                  ${record.type === "task" ? "bg-emerald-500/10 text-emerald-400" : 
                    record.type === "chat" ? "bg-cyan-500/10 text-cyan-400" : 
                    "bg-purple-500/10 text-purple-400"}`}>
                  {record.type === "task" && <CheckBadgeIcon className="w-5 h-5" />}
                  {record.type === "chat" && <ChatBubbleLeftRightIcon className="w-5 h-5" />}
                  {record.type === "assessment" && <AcademicCapIcon className="w-5 h-5" />}
                </div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-950 px-2 py-1 rounded-md">
                  {new Date(record.date).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-2">{record.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium line-clamp-4 group-hover:line-clamp-none transition-all">
                {typeof record.desc === 'string' ? record.desc : JSON.stringify(record.desc)}
              </p>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
