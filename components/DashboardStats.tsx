"use client";

import { useEffect, useState } from "react";
import { 
  FireIcon, 
  ExclamationCircleIcon, 
  ArrowTrendingUpIcon, 
  ChatBubbleLeftEllipsisIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

export default function DashboardStats() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-32 bg-slate-800/50 rounded-2xl border border-slate-700/50" />
      ))}
    </div>
  );

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="glass p-6 rounded-2xl border border-orange-500/20 group hover:border-orange-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <FireIcon className="w-8 h-8 text-orange-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Study Streak</span>
          </div>
          <div className="text-3xl font-black text-white">{data.profile.streak} Days</div>
          <p className="text-xs text-slate-400 mt-1">Keep it up! Master consistency.</p>
        </div>

        {/* Recommended Step */}
        <div className="glass p-6 rounded-2xl border border-cyan-500/20 group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <ArrowTrendingUpIcon className="w-8 h-8 text-cyan-400" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Next Step</span>
          </div>
          <div className="text-sm font-bold text-white line-clamp-2">{data.profile.recommendedNextStep}</div>
          <p className="text-[10px] text-cyan-400 mt-2 uppercase font-bold tracking-tighter">AI Recommended</p>
        </div>

        {/* Weak Topics */}
        <div className="glass p-6 rounded-2xl border border-red-500/20 group hover:border-red-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <ExclamationCircleIcon className="w-8 h-8 text-red-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Weak Nodes</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {data.profile.weakTopics.length > 0 ? (
              data.profile.weakTopics.map((topic: string) => (
                <span key={topic} className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 font-bold">
                  {topic}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 font-medium">All systems stable.</span>
            )}
          </div>
        </div>

        {/* Continue Last Chat */}
        <div className="glass p-6 rounded-2xl border border-purple-500/20 group hover:border-purple-500/40 transition-all cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <ChatBubbleLeftEllipsisIcon className="w-8 h-8 text-purple-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Persistence</span>
          </div>
          <div className="text-xs font-bold text-white truncate">{data.lastChat ? data.lastChat.title : "No recent chats"}</div>
          <button className="mt-3 text-[10px] text-purple-400 font-black uppercase tracking-widest hover:text-purple-300 transition-colors">
            Continue Session →
          </button>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="glass p-6 rounded-3xl border border-slate-800/80">
        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-slate-400" />
          Neural Activity Logs
        </h3>
        <div className="space-y-4">
          {data.recentActivities.length > 0 ? (
            data.recentActivities.map((log: any) => (
              <div key={log._id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2 group-hover:scale-150 transition-transform" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-slate-200">{log.activityType}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{log.description}</p>
                </div>
              </div>
            ))
          ) : (
             <p className="text-sm text-slate-500 italic text-center py-4">Initialize more systems to see status logs.</p>
          )}
        </div>
      </div>
    </div>
  );
}
