"use client";

import React, { useState } from "react";
import { useUser } from "@/lib/UserContext";
import { calculateEventSchedule } from "@/lib/scheduler";
import Link from "next/link";
import {
  SparklesIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  BookOpenIcon,
  BellAlertIcon,
  ChevronRightIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  ExclamationCircleIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleSolid,
  FireIcon as FireSolid,
} from "@heroicons/react/24/solid";

// ─── Mock analytics data (swap for real API data) ─────────────────────────────
const WEEKLY_HOURS = [3.5, 5, 4, 6.5, 5.5, 7, 4.5];
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_HOURS = 8;

const SKILL_STATS = [
  { name: "Data Structures", pct: 78, color: "#22d3ee" },
  { name: "Algorithms", pct: 62, color: "#a78bfa" },
  { name: "System Design", pct: 45, color: "#f472b6" },
  { name: "Machine Learning", pct: 55, color: "#34d399" },
];

const ACHIEVEMENTS = [
  { label: "Neural Pioneer", icon: "🧠" },
  { label: "Consistency King", icon: "🔥" },
  { label: "Elite Scheduler", icon: "🎯" },
  { label: "Night Owl", icon: "🦉" },
  { label: "Deep Work", icon: "🧘" },
  { label: "Verified Scholar", icon: "✨" },
];

const MOTIVATIONS = [
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Success doesn't just find you. You have to go out and get it.",
];

const TOPICS = [
  { name: "Binary Trees", tag: "DSA", diff: "Medium", color: "cyan" },
  { name: "Dynamic Programming", tag: "Algo", diff: "Hard", color: "purple" },
  { name: "System Design 101", tag: "Design", diff: "Easy", color: "green" },
  { name: "ML Fundamentals", tag: "ML", diff: "Medium", color: "pink" },
];

const WEAK_SUBJECTS = [
  { name: "Operating Systems", pct: 32 },
  { name: "Computer Networks", pct: 41 },
  { name: "Database Design", pct: 47 },
];

const QUIZZES = [
  { name: "DSA Mock Test #4", date: "Tomorrow", color: "cyan" },
  { name: "OS Chapter Quiz", date: "In 3 days", color: "amber" },
  { name: "ML Midterm Prep", date: "In 5 days", color: "purple" },
];

// ─── Primitives ───────────────────────────────────────────────────────────────

function Badge({ children, color = "cyan" }) {
  const MAP = {
    cyan: "bg-cyan-500/10   text-cyan-400   border-cyan-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    pink: "bg-pink-500/10   text-pink-400   border-pink-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10  text-amber-400  border-amber-500/20",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${MAP[color]}`}>
      {children}
    </span>
  );
}

function Card({ children, className = "", glow = false }) {
  return (
    <div className={`
      relative rounded-2xl border border-slate-800/60 bg-slate-900/50 backdrop-blur-sm p-5
      transition-all duration-300 hover:border-slate-700/80
      ${glow ? "hover:shadow-[0_0_30px_rgba(34,211,238,0.06)]" : ""}
      ${className}
    `}>
      {children}
    </div>
  );
}

function SectionHeading({ children, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{children}</h3>
      {action && (
        <span className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400 cursor-pointer transition-colors">
          {action}
        </span>
      )}
    </div>
  );
}

// ─── Profile Header ───────────────────────────────────────────────────────────

function ProfileHeader({ profile, totalTasks, completedTasks, achievementCount }) {

  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : "S";

  return (
    <Card glow className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-600/5 pointer-events-none rounded-2xl" />
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative">

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-cyan-500/10">
            {initial}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <h1 className="text-xl font-black text-slate-100">{profile.name || "Neural Scholar"}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Badge color="cyan">✓ Verified</Badge>
              <Badge color="purple">
                <FireSolid className="w-2.5 h-2.5" />
                {profile.streak || 0} streak
              </Badge>
            </div>
          </div>

          <p className="text-sm text-slate-400 mb-3">
            {profile.course || "Computer Science"}&nbsp;·&nbsp;
            <span className="text-cyan-400 font-semibold">{profile.careerGoal || "AI/ML Engineer"}</span>
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-6 mb-4">
            {[
              { label: "Studies", value: profile.events.length },
              { label: "Tasks", value: totalTasks },
              { label: "Done", value: completedTasks },
              { label: "Medals", value: achievementCount },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-lg font-black text-slate-100 leading-none">{value}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </div>


        </div>

        {/* Quick actions */}
        <div className="flex sm:flex-col gap-2 flex-shrink-0">
          <button className="px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/40 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-colors whitespace-nowrap">
            View Archive
          </button>
        </div>
      </div>
      
      {/* Absolute Vault Button pushed sideways */}
      <Link 
        href="/dashboard/archive" 
        className="absolute top-5 right-5 sm:top-6 sm:right-6 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-slate-900 border border-indigo-500/30 hover:border-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest text-indigo-400 transition-all shadow-md group"
        title="View your archived tasks and AI histories"
      >
        <ArchiveBoxIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">Memory Vault</span>
      </Link>
    </Card>
  );
}

// ─── Highlights ───────────────────────────────────────────────────────────────

function Highlights() {
  const items = [
    { label: "New", emoji: "+" },
  ];
  return (
    <div className="flex gap-4 overflow-x-auto py-1 no-scrollbar">
      {items.map(({ label, emoji }, i) => (
        <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group">
          <div className={`
            w-14 h-14 rounded-2xl flex items-center justify-center text-xl
            transition-all duration-200 group-hover:scale-105
            ${i === items.length - 1
              ? "bg-slate-800/50 border-2 border-dashed border-slate-700 text-slate-500 text-2xl font-light"
              : "bg-slate-800/70 border border-slate-700/50 group-hover:border-cyan-500/40"}
          `}>
            {emoji}
          </div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Motivation Card ──────────────────────────────────────────────────────────

function MotivationCard() {
  const [idx] = useState(() => Math.floor(Math.random() * MOTIVATIONS.length));
  return (
    <div className="relative rounded-2xl overflow-hidden p-5 bg-gradient-to-br from-cyan-500/10 via-slate-900 to-purple-600/10 border border-cyan-500/10">
      <div className="absolute top-3 right-4 text-2xl opacity-20">✨</div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 mb-2">Daily Motivation</p>
      <p className="text-sm font-semibold text-slate-200 leading-relaxed italic">"{MOTIVATIONS[idx]}"</p>
    </div>
  );
}

// ─── Today's Tasks ────────────────────────────────────────────────────────────

function TodayTasks({ profile }) {
  const allTasks = profile.events
    .flatMap(e => calculateEventSchedule(e).slice(0, 2).map(t => ({ ...t, eventName: e.name })))
    .slice(0, 5);

  const [checked, setChecked] = useState({});
  const toggle = (i) => setChecked(p => ({ ...p, [i]: !p[i] }));

  return (
    <Card>
      <SectionHeading action="View all →">Today's Tasks</SectionHeading>
      {allTasks.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-6">
          No tasks scheduled — create a study plan to get started.
        </p>
      ) : (
        <ul className="space-y-2">
          {allTasks.map((task, i) => (
            <li
              key={i}
              onClick={() => toggle(i)}
              className={`
                flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150
                ${checked[i]
                  ? "bg-emerald-500/5 border border-emerald-500/10"
                  : "hover:bg-slate-800/50 border border-transparent"}
              `}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                ${checked[i] ? "border-emerald-500 bg-emerald-500" : "border-slate-600"}`}>
                {checked[i] && <CheckCircleIcon className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${checked[i] ? "line-through text-slate-500" : "text-slate-200"}`}>
                  {task.topic || task.title || `Task ${i + 1}`}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{task.eventName}</p>
              </div>
              <ClockIcon className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ─── Skill Analysis Tasks ─────────────────────────────────────────────────────

function SkillAnalysisTasks({ profile, updateProfile }) {
  if (!profile.skillTasks || profile.skillTasks.length === 0) return null;

  const toggle = (id) => {
    updateProfile({
      skillTasks: profile.skillTasks.map(t => 
        t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
      )
    });
  };

  return (
    <Card glow className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-slate-900/50">
      <SectionHeading action="Manage">AI Roadmap Directives</SectionHeading>
      <ul className="space-y-2">
        {profile.skillTasks.map((task) => (
          <li
            key={task.id}
            onClick={() => toggle(task.id)}
            className={`
              flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150
              ${task.isCompleted
                ? "bg-emerald-500/5 border border-emerald-500/10"
                : "bg-slate-800/60 border border-slate-700/50 hover:border-cyan-500/30 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"}
            `}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
              ${task.isCompleted ? "border-emerald-500 bg-emerald-500" : "border-slate-500"}`}>
              {task.isCompleted && <CheckCircleSolid className="w-3 h-3 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold truncate ${task.isCompleted ? "line-through text-slate-500" : "text-cyan-50"}`}>
                {task.title}
              </p>
              <div className="flex gap-2 items-center mt-0.5">
                <Badge color={task.type === "Technical" ? "pink" : "amber"}>{task.type}</Badge>
                <span className="text-[10px] text-slate-400">{task.duration}</span>
              </div>
            </div>
            <BoltIcon className={`w-4 h-4 flex-shrink-0 ${task.isCompleted ? "text-slate-600" : "text-cyan-400 animate-pulse"}`} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

// ─── Study Plans Grid ─────────────────────────────────────────────────────────

function StudyPlansGrid({ profile }) {
  return (
    <Card>
      <SectionHeading action="Open Planner →">Active Study Plans</SectionHeading>
      {profile.events.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-2xl mx-auto mb-3">📚</div>
          <p className="text-sm text-slate-400 font-semibold">No study plans yet</p>
          <p className="text-xs text-slate-600 mt-1">Create your first plan to begin tracking progress</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {profile.events.map(event => {
            const tasks = calculateEventSchedule(event).length;
            const done = event.completedTasks?.length || 0;
            const pct = tasks > 0 ? Math.round((done / tasks) * 100) : 0;
            return (
              <Link
                key={event.id}
                href="/dashboard/planner"
                className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:border-cyan-500/30 hover:bg-slate-800/70 transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-black text-sm mb-2.5">
                  {event.name.charAt(0)}
                </div>
                <p className="text-xs font-bold text-slate-200 line-clamp-2 mb-2 group-hover:text-white transition-colors">
                  {event.name}
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-600">{done}/{tasks} tasks</span>
                    <span className="text-[10px] text-cyan-500 font-bold">{pct}%</span>
                  </div>
                  <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ─── Recommended Topics ───────────────────────────────────────────────────────

function RecommendedTopics() {
  return (
    <Card>
      <SectionHeading action="Explore →">Recommended Topics</SectionHeading>
      <div className="space-y-2">
        {TOPICS.map(({ name, tag, diff, color }) => (
          <div key={name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/40 transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/40 flex items-center justify-center flex-shrink-0">
              <BookOpenIcon className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors">{name}</p>
              <p className="text-[11px] text-slate-500">{tag}</p>
            </div>
            <Badge color={color}>{diff}</Badge>
            <ChevronRightIcon className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Weak Subjects ────────────────────────────────────────────────────────────

function WeakSubjects() {
  return (
    <Card>
      <SectionHeading>Weak Areas — Focus Here</SectionHeading>
      <div className="space-y-3">
        {WEAK_SUBJECTS.map(({ name, pct }) => (
          <div key={name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <ExclamationCircleIcon className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-slate-300">{name}</span>
              </div>
              <span className="text-[11px] font-black text-amber-400">{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Upcoming Quizzes ─────────────────────────────────────────────────────────

function UpcomingQuizzes() {
  return (
    <Card>
      <SectionHeading>Upcoming Quizzes</SectionHeading>
      <div className="space-y-2.5">
        {QUIZZES.map(({ name, date, color }) => (
          <div key={name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/40 transition-colors cursor-pointer">
            <div className="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{name}</p>
              <p className="text-[11px] text-slate-500">{date}</p>
            </div>
            <Badge color={color}>
              <BellAlertIcon className="w-2.5 h-2.5" />
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Achievements ─────────────────────────────────────────────────────────────

function AchievementsGrid({ profile }) {
  const enriched = ACHIEVEMENTS.map(a => ({
    ...a,
    unlocked: a.label === "Neural Pioneer" ? true
      : a.label === "Consistency King" ? profile.streak >= 3
        : a.label === "Elite Scheduler" ? profile.events.length >= 2
          : a.label === "Verified Scholar" ? true
            : false,
  }));
  return (
    <Card>
      <SectionHeading>Medals & Achievements</SectionHeading>
      <div className="grid grid-cols-3 gap-2">
        {enriched.map(({ label, icon, unlocked }) => (
          <div key={label} className={`
            flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all
            ${unlocked
              ? "bg-slate-800/60 border-slate-700/50 hover:border-cyan-500/30"
              : "bg-slate-900/30 border-slate-800/30 opacity-30 grayscale"}
          `}>
            <span className="text-2xl">{icon}</span>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-tight leading-tight">{label}</span>
            {unlocked && (
              <div className="text-[8px] font-bold text-cyan-400 border border-cyan-400/20 px-1.5 py-0.5 rounded-full uppercase">
                Unlocked
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Right Panel Widgets ──────────────────────────────────────────────────────

function QuickStats({ profile, totalTasks, completedTasks }) {
  const items = [
    { label: "Total Events", value: profile.events.length, icon: CalendarDaysIcon, color: "text-cyan-400" },
    { label: "Tasks Done", value: completedTasks, icon: CheckCircleSolid, color: "text-emerald-400" },
    { label: "Day Streak", value: `${profile.streak || 0}🔥`, icon: FireSolid, color: "text-amber-400" },
    { label: "Skills Tracked", value: profile.skills?.length || 0, icon: BoltIcon, color: "text-purple-400" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(({ label, value, icon: Icon, color }) => (
        <Card key={label} className="p-4 !rounded-xl">
          <Icon className={`w-4 h-4 ${color} mb-2`} />
          <p className="text-xl font-black text-slate-100 leading-none">{value}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{label}</p>
        </Card>
      ))}
    </div>
  );
}

function PlacementScore({ profile }) {
  const score = Math.min(100, Math.round(
    (profile.events.length * 5) +
    ((profile.streak || 0) * 3) +
    (profile.skills?.length || 0) * 4 + 40
  ));
  const circumference = 2 * Math.PI * 30;
  const offset = circumference - (score / 100) * circumference;
  return (
    <Card glow>
      <SectionHeading>Placement Readiness</SectionHeading>
      <div className="flex items-center gap-5">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
            <circle cx="35" cy="35" r="30" fill="none" stroke="#1e293b" strokeWidth="6" />
            <circle
              cx="35" cy="35" r="30"
              fill="none"
              stroke="url(#scoreGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700"
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-black text-slate-100">{score}%</span>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-bold text-slate-200">
            {score >= 70 ? "On Track 🚀" : score >= 50 ? "Progressing 📈" : "Keep Grinding 💪"}
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            {score >= 70
              ? "You're well-prepared. Keep the momentum going."
              : "Focus on weak areas and build consistency."}
          </p>
          <Badge color={score >= 70 ? "green" : score >= 50 ? "cyan" : "amber"}>
            {score >= 70 ? "Strong" : score >= 50 ? "Moderate" : "Beginner"}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

function WeeklyChart() {
  const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0 … Sun=6
  return (
    <Card>
      <SectionHeading>Study Hours This Week</SectionHeading>
      <div className="flex items-end gap-2 h-28 mt-2">
        {WEEKLY_HOURS.map((h, i) => {
          const heightPct = (h / MAX_HOURS) * 100;
          const isToday = i === todayIdx;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
              <div className="relative w-full flex items-end" style={{ height: "90px" }}>
                <div
                  className={`
                    w-full rounded-t-md transition-all duration-500
                    ${isToday
                      ? "bg-gradient-to-t from-cyan-600 to-cyan-400"
                      : "bg-slate-700/60 group-hover:bg-slate-600/80"}
                  `}
                  style={{ height: `${heightPct}%` }}
                />
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {h}h
                </span>
              </div>
              <span className={`text-[9px] font-bold uppercase ${isToday ? "text-cyan-400" : "text-slate-600"}`}>
                {WEEK_DAYS[i]}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-[11px] text-slate-500">
          Total: <span className="text-slate-300 font-bold">{WEEKLY_HOURS.reduce((a, b) => a + b, 0)}h</span>
        </span>
        <Badge color="cyan">
          <ArrowTrendingUpIcon className="w-2.5 h-2.5" />
          +12% vs last week
        </Badge>
      </div>
    </Card>
  );
}

function SkillStats() {
  return (
    <Card>
      <SectionHeading>Skill Improvement</SectionHeading>
      <div className="space-y-3">
        {SKILL_STATS.map(({ name, pct, color }) => (
          <div key={name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-400">{name}</span>
              <span className="text-[11px] font-black" style={{ color }}>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────
// Drop this directly inside your existing layout's <main> or content wrapper.
// No sidebar is included here — your layout already provides one.

export default function InstagramStyleProfile() {
  const { profile, updateProfile } = useUser();

  const totalTasks = profile.events.flatMap(e => calculateEventSchedule(e)).length;
  const completedTasks = profile.events.flatMap(e => e.completedTasks || []).length;
  const achievementCount =
    (profile.streak >= 3 ? 1 : 0) +
    (profile.events.length >= 2 ? 1 : 0) + 2;

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Center Feed ── */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-5 min-w-0">
        <ProfileHeader
          profile={profile}
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          achievementCount={achievementCount}
        />
        <Highlights />
        <MotivationCard />
        <TodayTasks profile={profile} />
        <SkillAnalysisTasks profile={profile} updateProfile={updateProfile} />
        <StudyPlansGrid profile={profile} />
        <RecommendedTopics />
        <WeakSubjects />
        <UpcomingQuizzes />
        <AchievementsGrid profile={profile} />
      </main>

      {/* ── Right Analytics Panel (hidden below xl breakpoint) ── */}
      <aside className="hidden xl:flex flex-col w-80 2xl:w-96 border-l border-slate-800/40 overflow-y-auto px-5 py-6 space-y-5 flex-shrink-0">
        <QuickStats
          profile={profile}
          totalTasks={totalTasks}
          completedTasks={completedTasks}
        />
        <PlacementScore profile={profile} />
        <WeeklyChart />
        <SkillStats />

        {/* AI Mentor CTA */}
        <div className="relative rounded-2xl overflow-hidden border border-purple-500/20 bg-gradient-to-br from-purple-600/10 via-slate-900 to-cyan-500/5 p-5">
          <SparklesIcon className="w-8 h-8 text-purple-400 mb-3 opacity-80" />
          <p className="text-sm font-black text-slate-100 mb-1">Talk to AI Mentor</p>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Get personalised advice, quiz yourself, or ask anything about your curriculum.
          </p>
          <Link
            href="/dashboard/mentor"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-bold hover:bg-purple-600/30 transition-colors"
          >
            Open Mentor
            <ChevronRightIcon className="w-3 h-3" />
          </Link>
        </div>
      </aside>
    </div>
  );
}
