"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { sounds } from "@/lib/sounds";

export type Event = {
  id: string;
  name: string;
  date: string; // ISO string or YYYY-MM-DD
  syllabus: string;
  phoneNumber?: string; // Optional field for the Twilio Agentic Call feature
  plan?: any; // To store the generated JSON plan later
  completedTasks?: string[]; // Store IDs or indices of completed tasks
  chatHistory?: any[]; // ISO-scoping history to each event
};

export type UserProfile = {
  isLoggedIn: boolean;
  token?: string;
  id?: string;
  name: string;
  studyLevel: string;
  school: string;
  course: string;
  stream: string;
  branch: string;
  year: string;
  semester: string;
  careerGoal: string;
  targetSalary: string;
  skills: string[];
  skillLevel: string;
  learningStyle: string;
  studyTime: string;
  language: string;
  access: string;
  interestedIn: string[];
  biggestProblem: string[];
  streak: number;
  weakTopics: string[];
  recommendedNextStep: string;
  events: Event[];
  careerRoadmap?: any;
  skillTasks?: any[];
  chatHistorySnapshot: any[];
  activityLogs: any[];
};

export const defaultProfile: UserProfile = {
  isLoggedIn: false,
  name: "",
  studyLevel: "",
  school: "",
  course: "",
  stream: "",
  branch: "",
  year: "",
  semester: "",
  careerGoal: "",
  targetSalary: "",
  skills: [],
  skillLevel: "",
  learningStyle: "",
  studyTime: "",
  language: "",
  access: "",
  interestedIn: [],
  biggestProblem: [],
  streak: 0,
  weakTopics: [],
  recommendedNextStep: "Complete your onboarding",
  events: [],
  careerRoadmap: null,
  skillTasks: [],
  chatHistorySnapshot: [],
  activityLogs: [],
};

type UserContextType = {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addEvent: (event: Omit<Event, "id">) => Event;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  toggleTaskCompletion: (eventId: string, taskId: string) => void;
  saveEventHistory: (eventId: string, history: any[]) => void;
  syncAllSchedules: () => void;
  updateEventPlanTasks: (eventId: string, newTasks: any[]) => void;
  syncEventStartTime: (eventId: string) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isMounted, setIsMounted] = useState(false);

  // Load from persistent storage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem("studysmart_user");
      if (stored) {
        setProfile({ ...defaultProfile, ...JSON.parse(stored) });
      }
    } catch (e) {
      console.error("Failed to parse user profile", e);
    }
  }, []);

  // Save to persistent storage when profile changes
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem("studysmart_user", JSON.stringify(profile));
      } catch (e) {
        console.error("Failed to stringify user profile", e);
      }
    }
  }, [profile, isMounted]);

  // Sync with Database (Background)
  useEffect(() => {
    if (isMounted && profile.isLoggedIn && profile.name) {
      const syncTimeout = setTimeout(async () => {
        try {
          console.log("=> Syncing with Database...");
          const res = await fetch("/api/user/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profile),
          });
          
          if (!res.ok) {
            let errorMsg = `Sync failed with status: ${res.status}`;
            try {
              const errorData = await res.json();
              if (errorData.error) errorMsg += ` - ${errorData.error}`;
            } catch (e) {
              // Not a JSON response
            }
            console.error(`=> ${errorMsg}`);
            return;
          }

          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            if (data.success) {
              console.log("=> Database Sync Complete");
            }
          } else {
             console.error("=> Sync Error: Server returned non-JSON response");
          }
        } catch (err) {
          console.error("Failed to sync with Database", err);
        }
      }, 2000); // Debounce sync by 2 seconds

      return () => clearTimeout(syncTimeout);
    }
  }, [profile, isMounted]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const addEvent = (event: Omit<Event, "id">) => {
    const newEvent: Event = { ...event, id: Date.now().toString() };
    setProfile((prev) => ({
      ...prev,
      events: [...prev.events, newEvent],
    }));
    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<Event>) => {
    setProfile((prev) => ({
      ...prev,
      events: prev.events.map((ev) => (ev.id === id ? { ...ev, ...updates } : ev)),
    }));
  };

  const deleteEvent = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      events: prev.events.filter((ev) => ev.id !== id),
    }));
  };
  
  const toggleTaskCompletion = (eventId: string, taskId: string) => {
    setProfile((prev) => ({
      ...prev,
      events: prev.events.map((ev) => {
        if (ev.id === eventId) {
            const completedTasks = ev.completedTasks || [];
            const isCompleted = completedTasks.includes(taskId);
            
            // Premium Sound Feedback
            if (!isCompleted) {
              sounds.playSuccess();
            }

            return {
              ...ev,
              completedTasks: isCompleted
                ? completedTasks.filter((id) => id !== taskId)
                : [...completedTasks, taskId],
            };
        }
        return ev;
      }),
    }));
  };

  const logout = () => {
    setProfile(defaultProfile);
    if (typeof window !== "undefined") {
      localStorage.clear();      // Hard reset for ALL project data
      sessionStorage.clear();    // Wipe session-specific tokens/history
      window.location.href = "/";
    }
  };

  const saveEventHistory = (eventId: string, history: any[]) => {
    setProfile((prev) => ({
      ...prev,
      events: prev.events.map((ev) => 
        ev.id === eventId ? { ...ev, chatHistory: history } : ev
      ),
    }));
  };

  const syncAllSchedules = () => {
    const now = new Date().toISOString();
    setProfile((prev) => ({
      ...prev,
      events: prev.events.map((ev) => 
        ev.plan ? { ...ev, plan: { ...ev.plan, generatedAt: now } } : ev
      ),
    }));
  };

  const updateEventPlanTasks = (eventId: string, newTasks: any[]) => {
    setProfile((prev) => ({
      ...prev,
      events: prev.events.map((ev) => 
        ev.id === eventId 
          ? { ...ev, plan: { ...ev.plan, today_tasks: newTasks, generatedAt: new Date().toISOString() } } 
          : ev
      ),
    }));
  };

  const syncEventStartTime = (eventId: string) => {
    setProfile((prev) => ({
      ...prev,
      events: prev.events.map((ev) =>
        ev.id === eventId
          ? { ...ev, plan: { ...ev.plan, generatedAt: new Date().toISOString() } }
          : ev
      ),
    }));
  };

  if (!isMounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <UserContext.Provider
      value={{
        profile,
        setProfile,
        updateProfile,
        addEvent,
        updateEvent,
        deleteEvent,
        toggleTaskCompletion,
        saveEventHistory,
        syncAllSchedules,
        updateEventPlanTasks,
        syncEventStartTime,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
