"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import ChatCloudButton from "@/components/ChatCloudButton";
import { useUser } from "@/lib/UserContext";
import { calculateEventSchedule } from "@/lib/scheduler";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, isLoggedIn } = useUser();

  // If not logged in, we should probably handle redirect, 
  // but for now we'll just wrap the content.

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen relative flex flex-col">
        {/* Background Decorative Grids */}
        <div 
          className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
        />
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex-1 p-8 lg:p-12">
          {children}
        </div>
      </main>

      {/* Persistent Floating Chat */}
      <ChatCloudButton
        contextData={{
          todaysTasks: profile.events.flatMap(event => 
             calculateEventSchedule(event).map((t: any) => ({ ...t, eventName: event.name, eventId: event.id }))
          ),
          summaryData: null, // This can be updated if needed
          quizAnswers: {},
          quizSubmitted: false,
        }}
      />
    </div>
  );
}
