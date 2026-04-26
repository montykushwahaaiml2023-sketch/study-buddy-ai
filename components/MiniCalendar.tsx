"use client";

import { useUser } from "@/lib/UserContext";

export default function MiniCalendar() {
  const { profile } = useUser();

  if (!profile.isLoggedIn || profile.events.length === 0) {
    return null;
  }

  // Sort events by date
  const sortedEvents = [...profile.events].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <div className="w-full pointer-events-auto mt-4 mb-4">
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 shadow-md">
        <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
          <span className="text-purple-400">📅</span> Upcoming Targets
        </h4>
        <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {sortedEvents.map((event) => {
            const eventDate = new Date(event.date);
            const today = new Date();
            const isPast =
              eventDate < today &&
              eventDate.toDateString() !== today.toDateString();
            const isToday = eventDate.toDateString() === today.toDateString();

            return (
              <div
                key={event.id}
                className={`p-2.5 rounded-lg border ${
                  isToday
                    ? "bg-cyan-900/20 border-cyan-500/30"
                    : isPast
                      ? "bg-slate-800/20 border-slate-800/50 opacity-60"
                      : "bg-slate-800/40 border-slate-700/50"
                } flex flex-col gap-1 transition-all hover:bg-slate-800`}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`text-xs font-bold truncate max-w-[140px] ${isToday ? "text-cyan-400" : "text-slate-300"}`}
                  >
                    {event.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {eventDate.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {event.plan ? (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[9px] text-green-400/80 uppercase tracking-wider font-semibold">
                      Plan Generated
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">
                      No plan yet
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
