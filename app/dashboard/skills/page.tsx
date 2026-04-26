"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/lib/UserContext";
import { 
  PresentationChartLineIcon, 
  SparklesIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  ClockIcon,
  CodeBracketSquareIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  AcademicCapIcon as BrainIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";

// Helper for realistic progress bars
function ProgressBar({ pct, color }: { pct: number, color: string }) {
  return (
    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} transition-all duration-1000`} 
        style={{ width: `${pct}%` }} 
      />
    </div>
  );
}

// ----------------------------------------------------------------------
// DATA MOCKS (Simulating AI Test Generation tailored to profile)
// ----------------------------------------------------------------------

const generateTestForProfile = (profile: any) => {
  const isBeginner = profile.skillLevel === "Beginner";
  return {
    Aptitude: [
      { q: "If A can do a piece of work in 10 days and B in 15 days, how many days will they take together?", options: ["5 days", "6 days", "8 days", "9 days"], ans: "6 days" },
      { q: "What is the next number in the series: 2, 6, 12, 20, 30, ...?", options: ["40", "42", "44", "48"], ans: "42" },
    ],
    Verbal: [
      { q: "Choose the synonym for 'Abundant':", options: ["Scarce", "Plentiful", "Rare", "Limited"], ans: "Plentiful" },
      { q: "Identify the correct sentence:", options: ["He don't like it.", "He doesn't likes it.", "He doesn't like it.", "He do not likes it."], ans: "He doesn't like it." }
    ],
    Technical: [
      { q: isBeginner ? "Which of the following is not a programming language?" : "Which data structure is used for BFS?", options: isBeginner ? ["Python", "HTML", "Java", "C++"] : ["Queue", "Stack", "Tree", "Graph"], ans: isBeginner ? "HTML" : "Queue" },
      { q: "What is the time complexity of binary search?", options: ["O(n)", "O(1)", "O(log n)", "O(n^2)"], ans: "O(log n)" }
    ],
    Interview: [
      { q: "What is the STAR method used for?", options: ["Coding frameworks", "Behavioral questions", "System architecture", "Salary negotiation"], ans: "Behavioral questions" },
      { q: "How should you answer 'What is your greatest weakness?'", options: ["I work too hard.", "State a real weakness and how you are improving.", "Say you have no weaknesses.", "Refuse to answer."], ans: "State a real weakness and how you are improving." }
    ]
  };
};

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

export default function SkillAnalysis() {
  const { profile, updateProfile } = useUser();
  
  const [view, setView] = useState<"intro" | "testing" | "evaluating" | "results">("intro");
  
  // Test State
  const [testData, setTestData] = useState<any>(null);
  const [currentSection, setCurrentSection] = useState<string>("Aptitude");
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Record<number, string>>>({});
  
  // Results State
  const [scores, setScores] = useState<Record<string, number>>({});
  
  const sections = ["Aptitude", "Verbal", "Technical", "Interview"];

  useEffect(() => {
    // Generate test data tailored to the user once on mount
    setTestData(generateTestForProfile(profile));
  }, [profile]);

  const startTest = () => {
    setAnswers({ Aptitude: {}, Verbal: {}, Technical: {}, Interview: {} });
    setCurrentSection("Aptitude");
    setCurrentQuestionIdx(0);
    setView("testing");
  };

  const handleAnswer = (option: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentSection]: {
        ...prev[currentSection],
        [currentQuestionIdx]: option
      }
    }));
  };

  const nextQuestion = () => {
    const sectionData = testData[currentSection];
    if (currentQuestionIdx < sectionData.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // Next Section
      const sectionIdx = sections.indexOf(currentSection);
      if (sectionIdx < sections.length - 1) {
        setCurrentSection(sections[sectionIdx + 1]);
        setCurrentQuestionIdx(0);
      } else {
        finishTest();
      }
    }
  };

  const finishTest = () => {
    setView("evaluating");
    
    // Simulate AI grading & analysis
    setTimeout(() => {
      let newScores: Record<string, number> = {};
      sections.forEach(sec => {
        let correct = 0;
        testData[sec].forEach((q: any, i: number) => {
          if (answers[sec]?.[i] === q.ans) correct++;
        });
        newScores[sec] = Math.round((correct / testData[sec].length) * 100);
      });
      setScores(newScores);
      setView("results");
    }, 3500); // 3.5 seconds of "AI Processing"
  };

  // ----------------------------------------------------------------------
  // RENDER VIEWS
  // ----------------------------------------------------------------------

  if (view === "intro") {
    return (
      <div className="space-y-10 animate-fadeIn pb-12 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <SparklesIcon className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">Neural Assessment Engine</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Skill Calibration <span className="gradient-text">Matrix</span>
            </h1>
            <p className="text-slate-400 mt-2 font-medium">
              We need to map your exact proficiency across 4 placement pillars before building a personalized study strategy.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-12 rounded-[3rem] bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center gap-10">
           <div className="flex-1 space-y-6">
              <h2 className="text-2xl font-bold text-white">Targeted for {profile.careerGoal || "Placements"}</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                The AI will generate questions adjusting to your <strong className="text-white">{profile.skillLevel || "Beginner"}</strong> level. 
                Focus on accuracy. After the 8-question deep scan, we'll construct a 100% personalized daily study routine aligned with your available <strong className="text-white">{profile.studyTime || "time"}</strong>.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { t: "Quantitative Aptitude", i: ChartBarIcon, c: "text-blue-400 bg-blue-500/10" },
                   { t: "Verbal Processing", i: PresentationChartLineIcon, c: "text-purple-400 bg-purple-500/10" },
                   { t: "Technical & DSA", i: CodeBracketSquareIcon, c: "text-cyan-400 bg-cyan-500/10" },
                   { t: "HR & Behavioral", i: BriefcaseIcon, c: "text-emerald-400 bg-emerald-500/10" }
                 ].map(item => (
                   <div key={item.t} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50">
                     <div className={`p-2 rounded-xl ${item.c}`}>
                       <item.i className="w-5 h-5" />
                     </div>
                     <span className="text-xs font-bold text-slate-300">{item.t}</span>
                   </div>
                 ))}
              </div>

              <button 
                onClick={startTest}
                className="btn-primary px-10 py-4 w-full sm:w-auto text-sm font-black tracking-wider uppercase rounded-2xl flex items-center justify-center gap-3 shadow-glow"
              >
                Commence Skill Test <ArrowRightIcon className="w-4 h-4" />
              </button>
           </div>
           <div className="hidden lg:block w-72 h-72 relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-[80px] rounded-full animate-pulse" />
              <div className="relative w-full h-full border border-white/10 bg-slate-900 rounded-full flex flex-col items-center justify-center shadow-2xl">
                <BrainIcon className="w-20 h-20 text-cyan-400 mb-4" />
                <span className="text-xl font-black text-white tracking-widest">{profile.name || "Scholar"}</span>
                <span className="text-[10px] uppercase text-cyan-500 tracking-[0.2em]">{profile.stream} Neural Link</span>
              </div>
           </div>
        </div>
      </div>
    );
  }

  if (view === "testing") {
    const qData = testData[currentSection][currentQuestionIdx];
    const progressPct = ((sections.indexOf(currentSection) * testData[currentSection].length + currentQuestionIdx) / (sections.length * 2)) * 100;
    
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn pt-10 px-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Section {sections.indexOf(currentSection) + 1} of 4</span>
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Testing Phase</span>
          </div>
          <ProgressBar Math={Math} pct={progressPct} color="bg-cyan-500" />
          <h2 className="text-2xl font-black text-white">{currentSection} Assessment</h2>
        </div>

        <div className="p-8 rounded-[2rem] bg-slate-900 border border-slate-800 shadow-2xl space-y-8">
          <h3 className="text-xl font-bold text-white leading-relaxed">{qData.q}</h3>
          
          <div className="space-y-3">
            {qData.options.map((opt: string) => {
              const isSelected = answers[currentSection]?.[currentQuestionIdx] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all text-sm font-semibold ${
                    isSelected
                      ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                      : "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
             <button
                disabled={!answers[currentSection]?.[currentQuestionIdx]}
                onClick={nextQuestion}
                className={`px-8 py-3 rounded-xl text-sm font-black flex items-center gap-2 transition-all ${
                  answers[currentSection]?.[currentQuestionIdx]
                    ? "bg-white text-slate-900 hover:bg-slate-200"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
             >
                {currentSection === "Interview" && currentQuestionIdx === 1 ? "Submit & Analyze" : "Next Question"} <ArrowRightIcon className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "evaluating") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fadeIn">
         <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
            <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin" />
            <SparklesIcon className="w-10 h-10 text-cyan-400 animate-pulse" />
         </div>
         <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">AI is Processing Results</h2>
            <p className="text-slate-400 text-sm">Evaluating answers and mapping knowledge gaps...</p>
         </div>
      </div>
    );
  }

  // view === "results"
  const overallScore = Math.round((scores.Aptitude + scores.Verbal + scores.Technical + scores.Interview) / 4);
  const readinessColor = overallScore >= 70 ? "text-emerald-400" : overallScore >= 50 ? "text-amber-400" : "text-red-400";
  
  return (
    <div className="space-y-10 animate-fadeIn pb-12 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
         <div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Skill Gap <span className="gradient-text">Analysis</span>
            </h1>
            <p className="text-slate-400 mt-2 font-medium">Your personalized cognitive blueprint is ready.</p>
         </div>
         <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl">
            <div>
               <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Placement Readiness</p>
               <p className={`text-2xl font-black ${readinessColor}`}>{overallScore}%</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Scores Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-[2rem] bg-slate-900 border border-slate-800 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-slate-800 pb-4">Performance Metrics</h3>
            {sections.map(sec => (
              <div key={sec} className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">{sec}</span>
                  <span className={scores[sec] >= 50 ? "text-cyan-400" : "text-rose-400"}>{scores[sec]}%</span>
                </div>
                <ProgressBar pct={scores[sec]} color={scores[sec] >= 50 ? "bg-cyan-500" : "bg-rose-500"} />
              </div>
            ))}
          </div>

          {/* AI Feedback */}
          <div className="p-6 rounded-[2rem] bg-gradient-to-b from-purple-900/20 to-slate-900 border border-purple-500/20">
             <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-black text-purple-400 uppercase tracking-widest">AI Feedback</span>
             </div>
             <p className="text-sm text-slate-300 leading-relaxed font-medium">
               {overallScore >= 70 
                 ? "Excellent foundations! You have strong problem-solving skills. Focus on advanced DSA and mock interviews to secure a top-tier placement." 
                 : "We've identified critical knowledge gaps, especially in technical fundamentals. But don't worry—your personalized plan below is designed to fix this in weeks."}
             </p>
          </div>
        </div>

        {/* Generated Study Plan */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 rounded-[2rem] bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
             {/* Glow */}
             <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full" />
             
             <h3 className="text-lg font-black text-white mb-6">Your Adaptive Action Plan</h3>
             
             <div className="space-y-4 relative z-10">
                {/* Rule: Adaptive based on weak areas */}
                {scores.Technical < 100 && (
                  <div className="flex gap-4 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                     <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                       <CodeBracketSquareIcon className="w-5 h-5 text-rose-400" />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-white mb-1">Technical Deep-Dive Required</h4>
                        <p className="text-xs text-slate-400 mb-2">Your technical score is holding back your readiness. Focus 60% of your time here.</p>
                        <ul className="text-xs text-rose-300 font-medium list-disc list-inside space-y-1">
                           <li>Revise Data Structures (Trees & Graphs)</li>
                           <li>Practice 2 LeetCode Mediums daily</li>
                        </ul>
                     </div>
                  </div>
                )}

                {scores.Aptitude <= 100 && (
                  <div className="flex gap-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                     <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                       <ChartBarIcon className="w-5 h-5 text-amber-400" />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-white mb-1">Aptitude Speed Training</h4>
                        <p className="text-xs text-slate-400 mb-2">You know the formulas, but speed is crucial for first-round clearances.</p>
                        <ul className="text-xs text-amber-300 font-medium list-disc list-inside space-y-1">
                           <li>Daily 15-minute quantitative quiz</li>
                           <li>Focus on Time/Work & Probability</li>
                        </ul>
                     </div>
                  </div>
                )}
             </div>

             <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-400">Time Commitment Needed</span>
                  <span className="text-xs font-black text-cyan-400">{profile.studyTime || "2 Hours"} / Day</span>
                </div>
                
                <button 
                  onClick={() => {
                    const tasksToApply = [];
                    if (scores.Technical < 100) {
                      tasksToApply.push({ id: `tech-1-${Date.now()}`, title: "Revise Data Structures (Trees & Graphs)", type: "Technical", duration: "1 Hour", isCompleted: false });
                      tasksToApply.push({ id: `tech-2-${Date.now()}`, title: "Practice 2 LeetCode Mediums", type: "Technical", duration: "45 Mins", isCompleted: false });
                    }
                    if (scores.Aptitude <= 100) {
                      tasksToApply.push({ id: `apt-1-${Date.now()}`, title: "15-minute quantitative quiz", type: "Aptitude", duration: "15 Mins", isCompleted: false });
                      tasksToApply.push({ id: `apt-2-${Date.now()}`, title: "Focus on Time/Work & Probability", type: "Aptitude", duration: "30 Mins", isCompleted: false });
                    }
                    updateProfile({ skillTasks: tasksToApply });
                    alert("Skill Roadmap successfully embedded into your Dashboard!");
                  }}
                  className="w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-sm uppercase tracking-widest transition-all"
                >
                  Apply Plan to My Schedule
                </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
