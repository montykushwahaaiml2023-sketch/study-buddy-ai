"use client";

import { useState } from "react";
import { useUser } from "@/lib/UserContext";

export default function InteractiveMiniCalendar() {
  const { profile } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  if (!profile.isLoggedIn) {
    return null;
  }

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const startOfMonth = new Date(year, month, 1);
  const startDay = startOfMonth.getDay(); // 0 is Sunday, 1 is Monday...

  const endOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = endOfMonth.getDate();

  const today = new Date();

  // Helper to normalize dates for comparison (ignoring time)
  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(year, month, day));
  };

  // Get events for specific date
  const getEventsForDate = (date: Date) => {
    return profile.events.filter((event) => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, date);
    });
  };

  const hasEvents = (day: number) => {
    const d = new Date(year, month, day);
    return getEventsForDate(d).length > 0;
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="w-full h-full flex flex-col gap-6 pointer-events-auto overflow-hidden">
      {/* Calendar Header & Grid */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 shadow-lg shrink-0">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-cyan-400"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="text-sm font-bold text-slate-100 uppercase tracking-widest">
            {currentDate.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </div>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-cyan-400"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div
              key={day}
              className="text-center text-[10px] font-bold text-slate-500 uppercase py-1"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="p-1" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const currentRenderDate = new Date(year, month, day);
            const isToday = isSameDay(currentRenderDate, today);
            const isSelected = selectedDate
              ? isSameDay(currentRenderDate, selectedDate)
              : false;
            const dayHasEvents = hasEvents(day);

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`relative w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-cyan-500 text-slate-900 shadow-[0_0_10px_rgba(56,189,248,0.5)] scale-110 z-10"
                    : isToday
                      ? "border border-cyan-500/50 text-cyan-400"
                      : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {day}
                {dayHasEvents && !isSelected && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-purple-400 shadow-[0_0_4px_rgba(192,132,252,0.8)]" />
                )}
                {dayHasEvents && isSelected && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-slate-900" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent flex flex-col gap-3 pb-6">
        <h3 className="text-sm font-bold text-slate-300 border-b border-slate-800/80 pb-2 mb-1 sticky top-0 bg-[#070b14]/70 backdrop-blur-md pt-2 z-10">
          {selectedDate
            ? selectedDate.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })
            : "Select a date"}
        </h3>

        {selectedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-900/30 rounded-xl border border-slate-800/40 border-dashed">
            <span className="text-2xl mb-2 opacity-50">☕</span>
            <p className="text-xs text-slate-500 font-medium">
              No targets set for this day.
            </p>
          </div>
        ) : (
          selectedEvents.map((event) => (
            <div
              key={event.id}
              className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:border-cyan-500/30 transition-all group"
            >
              <h4 className="text-sm font-bold text-slate-100 mb-1 group-hover:text-cyan-400 transition-colors">
                {event.name}
              </h4>
              <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                {event.syllabus}
              </p>

              <div className="flex items-center justify-between">
                {event.plan ? (
                  <div className="flex items-center gap-1.5 bg-green-900/20 px-2 py-1 rounded border border-green-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] text-green-400 font-bold uppercase tracking-wide">
                      Plan Ready
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-amber-900/20 px-2 py-1 rounded border border-amber-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wide">
                      Pending
                    </span>
                  </div>
                )}

                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(event.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
