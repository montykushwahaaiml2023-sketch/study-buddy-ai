"use client";

import React, { useState } from "react";
import { useUser } from "@/lib/UserContext";
import { 
  SparklesIcon,
  ArrowRightIcon,
  CircleStackIcon,
  RocketLaunchIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon
} from "@heroicons/react/24/outline";

export default function CareerMentorWithSidebar() {
  const { profile, updateProfile } = useUser();
  const [careerGoal, setCareerGoal] = useState(profile.careerGoal || "");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Use global roadmap from profile
  const roadmap = profile.careerRoadmap;

  // Chat State
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const handleGenerate = async () => {
    if (!careerGoal) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/career/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careerGoal, profile }),
      });
      
      if (!res.ok) {
        console.error("Roadmap API failed:", res.status);
        return;
      }

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        // Update global profile instead of local state
        updateProfile({ careerRoadmap: data, careerGoal });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/career/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMessage],
          roadmap,
          profile,
          careerGoal
        })
      });

      if (!res.ok) {
        console.error("Chat API failed:", res.status);
        setChatMessages(prev => [...prev, { role: "assistant", content: "I encountered an error. Please try again later." }]);
        return;
      }

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: "assistant", content: data.content }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] -mx-8 -mt-8 overflow-hidden animate-fadeIn">
      
      {/* ─── Main Content Area ─── */}
      <main className="flex-1 p-12 overflow-y-auto space-y-16">
        {/* Header */}
        <section className="space-y-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">Professional Strategist</h1>
          <p className="text-slate-500 text-sm max-w-lg leading-relaxed">
            Synchronize your academic progress with world-class career roadmaps.
          </p>
        </section>

        {/* Input area */}
        <section className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/50 p-2 rounded-3xl border border-slate-800 max-w-2xl">
          <input 
            type="text" 
            placeholder="Target role (e.g. Senior Backend Engineer)"
            className="flex-1 bg-transparent px-6 py-3 text-white placeholder:text-slate-600 outline-none font-medium"
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
          />
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-8 py-3 bg-white text-black font-bold rounded-2xl hover:bg-slate-200 transition-all flex items-center gap-2 group disabled:opacity-50"
          >
            {isGenerating ? "Generating..." : "Generate Plan"}
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </section>

        {/* Roadmap Display */}
        {roadmap ? (
          <div className="space-y-20 pt-8 pb-32">
            <div className="space-y-12 max-w-3xl">
              {roadmap.roadmap.map((step: any, i: number) => (
                <div key={i} className="flex gap-8 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                      step.status === 'completed' ? 'border-white bg-white text-black' : 'border-slate-800 text-slate-600'
                    }`}>
                      {i + 1}
                    </div>
                    {i < roadmap.roadmap.length - 1 && <div className="w-px flex-1 bg-slate-800 mt-4" />}
                  </div>
                  <div className="pb-12 space-y-4 flex-1">
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{step.stage} — {step.phase}</h3>
                      <div className="text-xl font-bold text-white mt-1">Growth Milestones</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {step.tasks.map((task: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 text-sm text-slate-400 p-3 rounded-xl border border-slate-900 bg-slate-900/10">
                          <div className="w-1 h-1 rounded-full bg-slate-600" />
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Analytics Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-slate-900 max-w-4xl">
               <div className="space-y-6">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                     <CircleStackIcon className="w-4 h-4 text-slate-400" />
                     Skill Acquisition
                  </h3>
                  <div className="space-y-4">
                     {roadmap.skillGap.map((skill: any, i: number) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                             <span>{skill.name}</span>
                             <span>{skill.current}%</span>
                          </div>
                          <div className="h-1 bg-slate-950 w-full overflow-hidden rounded-full">
                             <div className="h-full bg-slate-100" style={{ width: `${skill.current}%` }} />
                          </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-6">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                     <SparklesIcon className="w-4 h-4 text-slate-400" />
                     Strategy Projects
                  </h3>
                  <div className="space-y-3">
                     {roadmap.projects.map((proj: any, i: number) => (
                        <div key={i} className="p-4 rounded-2xl border border-slate-900 bg-slate-900/20">
                          <div className="text-[9px] uppercase font-black text-slate-600 tracking-tighter">{proj.level}</div>
                          <div className="text-sm font-bold text-slate-200 mt-1">{proj.title}</div>
                          <div className="text-[10px] text-slate-500 mt-1">{proj.tech}</div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="py-20 flex flex-col justify-start items-start space-y-6">
             <div className="flex gap-3">
                {[RocketLaunchIcon, CircleStackIcon, SparklesIcon].map((Icon, i) => (
                  <div key={i} className="p-3 rounded-full bg-slate-900/50 border border-slate-800 text-slate-700">
                     <Icon className="w-5 h-5" />
                  </div>
                ))}
             </div>
             <p className="text-slate-600 text-sm font-medium italic">Define your career goal to initialize the neural strategist...</p>
          </div>
        )}
      </main>

      {/* ─── Right Page Chat Sidebar ─── */}
      <aside className="w-80 border-l border-slate-900 bg-black/20 flex flex-col">
         <div className="p-6 border-b border-slate-900 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center">
               <ChatBubbleLeftRightIcon className="w-4 h-4 text-black" />
            </div>
            <div>
               <h3 className="text-xs font-black text-white uppercase tracking-widest">Career Mentor</h3>
               <p className="text-[10px] text-slate-500 font-bold">Context-Aware AI</p>
            </div>
         </div>

         {/* Chat Messages */}
         <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {chatMessages.length === 0 && (
               <div className="space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed italic">
                     Welcome, {profile.name}. I am observing your professional trajectory. How can I refine your strategy today?
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                     <button onClick={() => setChatInput("What are the best certifications?")} className="text-[10px] text-left p-3 rounded-xl border border-slate-900 text-slate-500 hover:text-white transition-colors">"What are the best certifications?"</button>
                     <button onClick={() => setChatInput("Industry salary trends?")} className="text-[10px] text-left p-3 rounded-xl border border-slate-800 text-slate-500 hover:text-white transition-colors">"Industry salary trends?"</button>
                  </div>
               </div>
            )}
            {chatMessages.map((msg, i) => (
               <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1`}>
                  <div className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-slate-100 text-black font-bold' 
                      : 'bg-slate-900 text-slate-300 border border-slate-800'
                  }`}>
                     {msg.content}
                  </div>
               </div>
            ))}
            {chatLoading && <div className="text-[10px] text-slate-500 font-bold animate-pulse">Consulting neural database...</div>}
         </div>

         {/* Chat Input */}
         <form onSubmit={handleChatSubmit} className="p-6 border-t border-slate-900 space-y-4">
            <div className="relative">
               <input 
                  type="text" 
                  placeholder="Ask advisor..."
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3 pl-4 pr-12 text-xs text-white outline-none focus:border-slate-700 transition-all"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
               />
               <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  <PaperAirplaneIcon className="w-4 h-4" />
               </button>
            </div>
         </form>
      </aside>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
