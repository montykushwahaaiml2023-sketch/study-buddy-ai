"use client";

import { useState, useRef, useEffect } from "react";
import { streamTextInChunks, createParticleBurst } from "@/lib/animations";
import { useUser } from "@/lib/UserContext";
import { calculateEventSchedule } from "@/lib/scheduler";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export default function ChatAssistant() {
  const { 
    profile, 
    toggleTaskCompletion, 
    saveEventHistory, 
    updateEvent, 
    syncAllSchedules,
    updateEventPlanTasks,
  } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [activeEventName, setActiveEventName] = useState<string>("");
  
  const initialMessage: Message[] = [
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm StudySmart Assistant. Ask me anything about your study materials!",
    },
  ];
  
  const [messages, setMessages] = useState<Message[]>(initialMessage);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Global event listener for task verification requests
  useEffect(() => {
    const handleVerifyEvent = (e: CustomEvent<{ taskId: string; taskName: string; eventId: string }>) => {
      const { taskId, taskName, eventId } = e.detail;
      
      // Auto-switch context to this event
      setActiveEventId(eventId);
      setIsOpen(true);
      
      const verifyMsg = `I have finished the task: "${taskName}". Please quiz me to verify this (Task ID: ${taskId})!`;
      setInputValue(verifyMsg);
    };

    const handleFocusEvent = (e: CustomEvent<{ eventId: string; eventName: string }>) => {
      const { eventId, eventName } = e.detail;
      if (activeEventId !== eventId) {
        setActiveEventId(eventId);
        setActiveEventName(eventName);
      }
    };

    window.addEventListener('verify-task' as any, handleVerifyEvent as any);
    window.addEventListener('focus-event' as any, handleFocusEvent as any);
    return () => {
      window.removeEventListener('verify-task' as any, handleVerifyEvent as any);
      window.removeEventListener('focus-event' as any, handleFocusEvent as any);
    };
  }, [activeEventId]);

  // Load history when active event changes
  useEffect(() => {
    if (activeEventId) {
      const event = profile.events.find(ev => ev.id === activeEventId);
      if (event && event.chatHistory) {
        setMessages(event.chatHistory);
      } else {
        setMessages(initialMessage);
      }
    }
  }, [activeEventId, profile.events]);
  
  // Auto-send when inputValue is set by verification event
  useEffect(() => {
    if (inputValue.includes("Please quiz me to verify this (Task ID: task-")) {
      handleSendMessage();
    }
  }, [inputValue]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const eventsToSend = activeEventId 
        ? profile.events.filter(e => e.id === activeEventId)
        : profile.events;

      const enrichedEvents = eventsToSend.map(event => ({
        ...event,
        current_schedule: calculateEventSchedule(event)
      }));

      // Call chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputValue,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          contextData: { 
            profile: {
              ...profile,
              events: enrichedEvents
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Stream the response with smooth animation
      let streamedContent = "";
      for await (const chunk of streamTextInChunks(data.reply, 15, 40)) {
        streamedContent += chunk;
        let displayContent = streamedContent;

        // Hide the raw JSON output and machine tags from the user.
        // We only want to show what's inside [CONFIRMATION] or what's before [UPDATE_PLAN].
        if (displayContent.includes("[CONFIRMATION]")) {
           const match = displayContent.match(/\[CONFIRMATION\]([\s\S]*?)\[\/CONFIRMATION\]/);
           if (match) displayContent = match[1].trim();
           else displayContent = displayContent.split("[CONFIRMATION]")[1] || "Processing Update...";
        } else if (displayContent.includes("[UPDATE_PLAN]")) {
           displayContent = displayContent.split("[UPDATE_PLAN]")[0].trim() || "Updating your dashboard...";
        }

        // Add a visual indicator if an update is happening
        if (streamedContent.includes("[UPDATE_PLAN]") && !streamedContent.includes("[/UPDATE_PLAN]")) {
           displayContent += "\n\n🔄 *Synchronizing Dashboard...*";
        }
        
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content = displayContent;
          return updated;
        });
      }

      // Check for Dashboard Mutations
      let finalStoredContent = streamedContent;
      const updateMatch = streamedContent.match(/\[UPDATE_PLAN\]([\s\S]*?)\[\/UPDATE_PLAN\]/);
      
      if (updateMatch && activeEventId) {
        try {
          const rawBlock = updateMatch[1].trim().replace(/```json/g, "").replace(/```/g, "");
          const newTasks = JSON.parse(rawBlock);
          
          // Use the dynamic atomic helper to prevent stale closures
          updateEventPlanTasks(activeEventId, newTasks);
          
          console.log("✅ Dashboard Mutated Atomically from Chat Assistant");
        } catch (e) {
          console.error("Failed to parse AI dashboard mutation:", e);
        }
        
        // Clean up ALL tags for final storage
        finalStoredContent = finalStoredContent
          .replace(/\[UPDATE_PLAN\][\s\S]*?\[\/UPDATE_PLAN\]/g, "")
          .replace(/\[CONFIRMATION\]/g, "")
          .replace(/\[\/CONFIRMATION\]/g, "")
          .trim();
        
        if (!finalStoredContent) finalStoredContent = "✅ *Dashboard has been updated!*";
        else finalStoredContent += "\n\n✅ *Dashboard updated!*";
      }

      // Check for verification, quiz, or sync signals
      if (finalStoredContent.includes("[VERIFIED:")) {
        const match = finalStoredContent.match(/\[VERIFIED:\s*(task-[^\]]+)\]/);
        if (match && match[1]) {
          const taskId = match[1];
          const [_, eventId, taskIdx] = taskId.split("-");
          toggleTaskCompletion(eventId, taskId);
          import("@/lib/animations").then(lib => lib.createConfetti()); // Celebrate!
        }
      }

      if (finalStoredContent.includes("[SYNC_NOW]")) {
        window.dispatchEvent(new CustomEvent("sync-schedule")); // Trigger UI shift
      }

      // Save history back to context with the cleaned text
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].content = finalStoredContent;
        updated[updated.length - 1].isStreaming = false;
        if (activeEventId) {
          saveEventHistory(activeEventId, updated);
        }
        return updated;
      });
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Open chat"
      >
        <div className="relative">
          {/* Animated glow ring */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>

          {/* Button */}
          <div className="relative w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center cursor-pointer transform transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg shadow-cyan-500/50 group-hover:shadow-cyan-500/80">
            <svg
              className="w-6 h-6 text-white transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>

            {/* Notification dot */}
            {isOpen && (
              <div className="absolute top-0 right-0 w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-24 right-6 z-40 transition-all duration-300 ease-out transform origin-bottom-right ${
          isOpen
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div className="glass rounded-2xl shadow-2xl w-96 max-w-[calc(100vw-2rem)] h-96 flex flex-col border border-slate-700/30 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-b border-slate-700/30 p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 italic">StudySmart Assistant</h3>
              <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest animate-pulse">
                {activeEventName ? `Focusing: ${activeEventName}` : "General Mentor"}
              </p>
            </div>
            <button
              onClick={toggleChat}
              className="text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/30">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fadeInUp`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl transition-all ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-br-none shadow-lg shadow-cyan-500/20"
                      : "bg-slate-800/60 text-slate-100 rounded-bl-none border border-slate-700/30 shadow-lg shadow-slate-700/20"
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words font-medium">
                    {message.content}
                    {message.isStreaming && (
                      <span className="inline-block ml-1 w-2 h-4 bg-slate-400 rounded animate-pulse"></span>
                    )}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-fadeInUp">
                <div className="bg-slate-800/60 text-slate-100 rounded-2xl rounded-bl-none border border-slate-700/30 px-4 py-3">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-700/30 p-4 bg-slate-900/30">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg px-4 py-2 font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7m0 0l-7 7m7-7H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
