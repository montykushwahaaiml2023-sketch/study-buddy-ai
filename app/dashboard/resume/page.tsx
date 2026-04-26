"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/lib/UserContext";
import { 
  DocumentDuplicateIcon, 
  SparklesIcon, 
  ArrowDownTrayIcon, 
  PrinterIcon,
  CheckCircleIcon,
  BoltIcon,
  ChartBarIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from "@heroicons/react/24/outline";

export default function ResumeBuilder() {
  const { profile } = useUser();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [resumeData, setResumeData] = useState({
    name: profile.name || "",
    email: "scholar@university.edu",
    phone: profile.phoneNumber || "",
    linkedin: "linkedin.com/in/scholar",
    targetRole: profile.careerGoal || "Software Developer",
    education: {
      degree: profile.stream ? `${profile.stream} in ${profile.branch}` : "B.Tech Computer Science",
      university: profile.school || "National Institute of Technology",
      year: profile.year || "3rd Year"
    },
    skills: profile.skills?.join(", ") || "React, Node.js, Python, Data Structures",
    projects: [
      { id: 1, title: "StudyBuddy AI", desc: "Built a web app to help students study better." }
    ]
  });

  const [atsScore, setAtsScore] = useState(45);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Dynamic ATS calculation
  useEffect(() => {
    let score = 30;
    if (resumeData.name) score += 5;
    if (resumeData.education.degree.length > 5) score += 10;
    if (resumeData.skills.split(",").length > 3) score += 15;
    if (resumeData.projects[0].desc.length > 50) score += 20;
    
    // Role based keywords
    const keywords = ["AI", "React", "Python", "Data", "Cloud", "Developer"];
    keywords.forEach(kw => {
      if ((resumeData.skills + resumeData.projects[0].desc).toLowerCase().includes(kw.toLowerCase())) {
        score += 5;
      }
    });

    setAtsScore(Math.min(98, score));
  }, [resumeData]);

  const simulateAIEnhance = () => {
    setIsEnhancing(true);
    setTimeout(() => {
      setResumeData(prev => ({
        ...prev,
        projects: [
          { 
            id: 1, 
            title: "StudyBuddy AI Workspace", 
            desc: "Engineered an AI-native full-stack application using Next.js and Groq LLMs. Optimized database synchronization which reduced load times by 40% and generated personalized roadmaps for 500+ simulated users."
          }
        ],
        skills: prev.skills.includes("Next.js") ? prev.skills : prev.skills + ", Next.js, AI Integration, prompt engineering"
      }));
      setIsEnhancing(false);
    }, 2500);
  };

  const handleExport = () => {
    // Temporarily rewrite document title to set the default PDF save name
    const originalTitle = document.title;
    const safeName = (resumeData.name || "Student").replace(/\s+/g, "_");
    document.title = `${safeName}_Resume`;
    
    window.print();
    
    // Restore original title immediately
    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  };

  return (
    <div className="min-h-screen animate-fadeIn pb-12 flex flex-col pt-8 lg:pt-0 max-w-[1600px] mx-auto px-4 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <DocumentDuplicateIcon className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Neural Resume Coach</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            AI <span className="text-emerald-400">Resume Builder</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Bypass ATS filters with an AI-optimized professional structure.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors">
            <PrinterIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={handleExport}
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-sm flex items-center gap-2 shadow-glow transition-all print:hidden"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* 3-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PANEL 1: Wizard Form (Col-Span 3) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-2xl flex flex-col h-[750px]">
           <div className="flex justify-between items-center mb-6">
             <span className="text-sm font-bold text-slate-300">Form Wizard</span>
             <span className="text-xs font-black text-emerald-400">Step {step} of {totalSteps}</span>
           </div>

           <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
             {step === 1 && (
               <div className="space-y-4 animate-fadeIn">
                 <h3 className="text-lg font-black text-white border-b border-slate-800 pb-2">Target & Identity</h3>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-slate-500">Target Role</label>
                   <input 
                     value={resumeData.targetRole}
                     onChange={e => setResumeData({...resumeData, targetRole: e.target.value})}
                     className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                   />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-slate-500">Full Name</label>
                   <input 
                     value={resumeData.name}
                     onChange={e => setResumeData({...resumeData, name: e.target.value})}
                     className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                   />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-slate-500">Email & LinkedIn</label>
                   <input 
                     value={resumeData.email}
                     onChange={e => setResumeData({...resumeData, email: e.target.value})}
                     className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none mb-2"
                   />
                 </div>
               </div>
             )}

             {step === 2 && (
               <div className="space-y-4 animate-fadeIn">
                 <h3 className="text-lg font-black text-white border-b border-slate-800 pb-2">Education Core</h3>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-slate-500">Degree & Branch</label>
                   <input 
                     value={resumeData.education.degree}
                     onChange={e => setResumeData({...resumeData, education: {...resumeData.education, degree: e.target.value}})}
                     className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                   />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-slate-500">College / University</label>
                   <input 
                     value={resumeData.education.university}
                     onChange={e => setResumeData({...resumeData, education: {...resumeData.education, university: e.target.value}})}
                     className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                   />
                 </div>
               </div>
             )}

             {step === 3 && (
               <div className="space-y-4 animate-fadeIn">
                 <h3 className="text-lg font-black text-white border-b border-slate-800 pb-2">Technical Engine</h3>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 flex justify-between">
                     Skills String
                     <span className="text-emerald-400">AI Managed</span>
                   </label>
                   <textarea 
                     value={resumeData.skills}
                     rows={5}
                     onChange={e => setResumeData({...resumeData, skills: e.target.value})}
                     className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none resize-none"
                   />
                   <p className="text-[10px] text-slate-500">Separate by commas. The AI reads this for ATS alignment.</p>
                 </div>
               </div>
             )}

             {step === 4 && (
               <div className="space-y-4 animate-fadeIn">
                 <h3 className="text-lg font-black text-white border-b border-slate-800 pb-2">Project Arsenal</h3>
                 <div className="space-y-4 p-4 rounded-xl border border-dashed border-slate-700 bg-slate-800/20">
                   <div className="space-y-1">
                     <label className="text-[10px] font-black uppercase text-slate-400">Project Title</label>
                     <input 
                       value={resumeData.projects[0].title}
                       onChange={e => setResumeData({...resumeData, projects: [{...resumeData.projects[0], title: e.target.value}]})}
                       className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                     />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] font-black uppercase text-slate-400">Short Description (Draft)</label>
                     <textarea 
                       value={resumeData.projects[0].desc}
                       rows={4}
                       placeholder="e.g. built a web app that does XYZ."
                       onChange={e => setResumeData({...resumeData, projects: [{...resumeData.projects[0], desc: e.target.value}]})}
                       className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none resize-none"
                     />
                   </div>
                 </div>
               </div>
             )}
           </div>

           {/* Wizard Controls */}
           <div className="pt-4 border-t border-slate-800 flex justify-between gap-2">
             <button 
               onClick={() => setStep(Math.max(1, step - 1))}
               disabled={step === 1}
               className="p-3 bg-slate-800 text-white rounded-xl disabled:opacity-30 transition-all hover:bg-slate-700"
             >
               <ChevronLeftIcon className="w-5 h-5" />
             </button>
             <button 
               onClick={() => setStep(Math.min(totalSteps, step + 1))}
               disabled={step === totalSteps}
               className="flex-1 flex justify-center items-center gap-2 p-3 bg-emerald-500/20 text-emerald-400 font-bold rounded-xl disabled:opacity-30 hover:bg-emerald-500/30 transition-all"
             >
               Next Phase <ChevronRightIcon className="w-4 h-4" />
             </button>
           </div>
        </div>

        {/* PANEL 2: Live Resume Preview (Col-Span 6) */}
        <div className="lg:col-span-5 bg-[#e2e8f0] rounded-[2rem] p-2 flex justify-center shadow-2xl h-[750px] overflow-hidden relative print-wrapper">
           <div id="resume-preview-container" className="bg-white w-full h-full rounded-[1.5rem] p-8 sm:p-12 text-slate-800 overflow-y-auto shadow-inner select-none transition-all duration-500 print-document">
              
              {/* Internal Resume Layout - Clean Harvard Style */}
              <div className="text-center border-b-[2px] border-slate-800 pb-4 mb-6">
                <h1 className="text-3xl font-serif font-bold uppercase tracking-tight">{resumeData.name || "YOUR NAME"}</h1>
                <p className="text-xs font-sans mt-2 tracking-wide text-slate-600">
                  {resumeData.email} • {resumeData.phone} • {resumeData.linkedin}
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3">Education</h2>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-sm">{resumeData.education.university}</h3>
                  <span className="text-xs italic">{resumeData.education.year}</span>
                </div>
                <p className="text-sm">{resumeData.education.degree}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3">Technical Skills</h2>
                <p className="text-sm leading-relaxed"><span className="font-bold">Core Competencies:</span> {resumeData.skills}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3">Academic Projects</h2>
                <div className="space-y-4">
                  {resumeData.projects.map(p => (
                    <div key={p.id}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-sm">{p.title}</h3>
                      </div>
                      <ul className="list-disc list-outside ml-4 text-sm text-slate-700 leading-relaxed space-y-1">
                        {p.desc.split('.').filter(d => d.trim().length > 0).map((bullet, idx) => (
                          <li key={idx} className={`${isEnhancing ? "animate-pulse bg-emerald-100/50 rounded" : "transition-all duration-500"}`}>{bullet.trim() + "."}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

           </div>
        </div>

        {/* PANEL 3: AI Audit & Enhancement (Col-Span 3) */}
        <div className="lg:col-span-4 space-y-6">
           
           {/* ATS Score Panel */}
           <div className="glass rounded-[2rem] p-6 border border-white/5 space-y-6 bg-slate-900/80 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5 text-emerald-400" />
                  ATS Audit Score
                </h3>
                <span className={`text-2xl font-black ${atsScore > 80 ? "text-emerald-400" : atsScore > 50 ? "text-amber-400" : "text-rose-400"}`}>
                  {atsScore}/100
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                 <div className={`h-full transition-all duration-1000 ${atsScore > 80 ? "bg-emerald-500" : atsScore > 50 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${atsScore}%` }} />
              </div>
              
              <ul className="text-xs space-y-3 font-medium text-slate-400">
                <li className="flex gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  Clean parsing architecture detected.
                </li>
                {atsScore < 60 && (
                  <li className="flex gap-2 text-rose-300">
                    <BoltIcon className="w-4 h-4 flex-shrink-0" />
                    Warning: Project descriptions are too short. ATS filters heavily weigh impact metrics.
                  </li>
                )}
                {resumeData.skills.length < 20 && (
                  <li className="flex gap-2 text-amber-300">
                    <BoltIcon className="w-4 h-4 flex-shrink-0" />
                    Skill density is dangerously low for a {resumeData.targetRole} role.
                  </li>
                )}
              </ul>
           </div>

           {/* Magic Enhancer Module */}
           <div className="p-8 rounded-[2rem] bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/30 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[60px] rounded-full" />
              
              <div className="relative z-10 space-y-4">
                <div className="p-3 bg-emerald-500/20 rounded-xl inline-block mb-2">
                  <SparklesIcon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-black text-white leading-tight">Neural Project <br />Rewriter</h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed mb-6">
                   Don't submit generic bullet points. Allow the AI to inject action verbs, quantify impact, and structure your text using the STAR framework.
                </p>
                <button 
                  onClick={simulateAIEnhance}
                  disabled={isEnhancing || atsScore > 80}
                  className="w-full py-4 bg-emerald-500 text-slate-900 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.3)] flex justify-center items-center gap-2"
                >
                  {isEnhancing ? (
                    <span className="animate-pulse">Optimizing...</span>
                  ) : (
                    "Rewrite with AI"
                  )}
                </button>
              </div>
           </div>

        </div>
      </div>

      <style jsx>{`
        .glass {
          backdrop-filter: blur(20px);
        }
        .shadow-glow {
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 4px;
        }
        
        /* ZERO DEPENDENCY PDF EXPORT STYLES */
        @media print {
          @page {
            margin: 0; /* Strip out browser navigation URLs and timestamps */
            size: A4 portrait;
          }
          body * {
            visibility: hidden;
          }
          .print-wrapper {
            background: transparent !important;
            padding: 0 !important;
            box-shadow: none !important;
            height: auto !important;
          }
          #resume-preview-container, #resume-preview-container * {
            visibility: visible;
          }
          #resume-preview-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            padding: 40px !important;
            margin: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
