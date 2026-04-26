"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  HomeIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  AcademicCapIcon,
  DocumentDuplicateIcon,
  PresentationChartLineIcon,
  ArchiveBoxIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout } = useUser();

  const navItems = [
    { name: "Command Center", href: "/dashboard", icon: HomeIcon },
    { name: "Study Planner", href: "/dashboard/planner", icon: CalendarIcon },
    { name: "Career Guidance", href: "/dashboard/career", icon: RocketLaunchIcon },
    { name: "Skill Analysis", href: "/dashboard/skills", icon: PresentationChartLineIcon },
    { name: "Resume Builder", href: "/dashboard/resume", icon: DocumentDuplicateIcon },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#070b14]/80 backdrop-blur-xl border-r border-slate-800/50 flex flex-col z-50">
      {/* Logo Section */}
      <div className="p-6 flex flex-col items-center">
        <Link href="/dashboard" className="group">
          <img 
            src="/logo.png" 
            alt="StudySmart Logo" 
            className="w-40 h-auto object-contain mix-blend-screen opacity-90 transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]"
          />
        </Link>
        <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-[0.2em] mt-2 opacity-50">
          Neural OS v2.0
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent"
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
              <span className="text-sm font-bold tracking-tight">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              )}
            </Link>
          );
        })}
        <LanguageSwitcher />
      </nav>

      {/* User Section */}
      <div className="p-4 mt-auto border-t border-slate-800/50 space-y-4">
        <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center text-white font-black text-lg shadow-glow">
            {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-slate-100 truncate">{profile.name || "Scholar"}</span>
            <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest truncate">{profile.course || "General Stream"}</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all group font-bold text-sm"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span>Exit System</span>
        </button>
      </div>
    </aside>
  );
}
