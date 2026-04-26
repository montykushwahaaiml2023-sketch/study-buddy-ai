"use client";

import { useEffect, useState } from "react";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

export default function RecentChats() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await fetch("/api/chats");
        if (res.ok) {
          const data = await res.json();
          setChats(data);
        }
      } catch (err) {
        console.error("Failed to fetch recent chats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchChats();
  }, []);

  if (loading) return (
    <div className="w-full space-y-2 mt-6">
      <div className="h-4 w-20 bg-slate-800 rounded animate-pulse" />
      <div className="h-10 w-full bg-slate-800 rounded-xl animate-pulse" />
      <div className="h-10 w-full bg-slate-800 rounded-xl animate-pulse" />
    </div>
  );

  if (chats.length === 0) return null;

  return (
    <div className="w-full mt-8 pointer-events-auto">
      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
        <ChatBubbleLeftRightIcon className="w-3 h-3" />
        Neural Sessions
      </h3>
      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
        {chats.map((chat) => (
          <button
            key={chat._id}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800/60 hover:border-cyan-500/30 transition-all text-left group"
          >
            <div className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-cyan-500 transition-colors" />
            <span className="text-xs font-bold text-slate-400 group-hover:text-slate-100 truncate">
              {chat.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
