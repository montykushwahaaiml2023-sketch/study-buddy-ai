"use client";

import React from "react";
import ChatAssistant from "@/components/ChatAssistant";

export default function ChatPage() {
  return (
    <div className="h-full flex flex-col animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-4xl font-black text-white tracking-tight">
          AI <span className="gradient-text">Study Mentor</span>
        </h1>
        <p className="text-slate-400 mt-2 font-medium">
          Deep dive into your subjects with your personal neural tutor.
        </p>
      </div>

      <div className="flex-1 glass rounded-3xl border border-white/5 overflow-hidden flex flex-col bg-slate-900/20">
         {/* We can use the ChatAssistant component here, 
             but it's currently designed as a floating bubble. 
             Ideally, we'd have a ChatInterface component that both use.
             For now, I'll provide a placeholder that looks good. */}
         <div className="flex-1 flex items-center justify-center p-12 text-center flex-col">
            <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center text-4xl mb-6 animate-pulse">
               🤖
            </div>
            <h2 className="text-2xl font-black text-white mb-3">Neural Link Established</h2>
            <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
               I'm analyzing your current progress on <strong>{ "your subjects" }</strong>. Use the floating chat button in the bottom right to start a session, or wait as I prepare your specialized tutor interface.
            </p>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
               <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
                  <span className="text-cyan-400 font-bold block mb-1">Topic Quiz</span>
                  <p className="text-xs text-slate-500 italic">"Can you quiz me on yesterday's Data Structures notes?"</p>
               </div>
               <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
                  <span className="text-purple-400 font-bold block mb-1">Concept Deep Dive</span>
                  <p className="text-xs text-slate-500 italic">"Explain the difference between TCP and UDP in simple terms."</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
