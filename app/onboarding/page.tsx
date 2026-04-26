"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import { 
  AcademicCapIcon, 
  BriefcaseIcon, 
  CpuChipIcon, 
  BeakerIcon, 
  RocketLaunchIcon, 
  ChatBubbleBottomCenterTextIcon,
  ClockIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";

type OnboardingData = {
  name: string;
  phoneNumber: string;
  stream: string;
  branch: string;
  year: string;
  careerGoal: string;
  skillLevel: string;
  dailyStudyTime: string;
  workingStatus: string;
  internetAccess: string;
  locationType: string;
  resourcesAccess: string;
};

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, updateProfile } = useUser();
  const [step, setStep] = useState(1);
  const totalSteps = 12; // 11 questions + 1 summary

  const [data, setData] = useState<OnboardingData>({
    name: "",
    phoneNumber: "+91",
    stream: "",
    branch: "",
    year: "",
    careerGoal: "",
    skillLevel: "",
    dailyStudyTime: "",
    workingStatus: "",
    internetAccess: "",
    locationType: "",
    resourcesAccess: "",
  });

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleComplete = async () => {
    // Generate a profile summary
    const summary = `${data.year} ${data.stream} student specializing in ${data.branch}. Goal: ${data.careerGoal}. Skill level: ${data.skillLevel}.`;
    
    const profilePayload = {
      name: data.name || "Scholar",
      phoneNumber: data.phoneNumber,
      stream: data.stream,
      branch: data.branch,
      year: data.year,
      careerGoal: data.careerGoal,
      skillLevel: data.skillLevel,
      studyLevel: data.year,
      course: `${data.stream} - ${data.branch}`,
      studyTime: data.dailyStudyTime,
      access: data.internetAccess,
      isLoggedIn: true,
    };

    // Sync with database
    try {
      const res = await fetch("/api/user/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profilePayload),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.user) {
          updateProfile({ ...result.user, isLoggedIn: true });
        } else {
          updateProfile(profilePayload);
        }
      } else {
        updateProfile(profilePayload);
      }
    } catch (err) {
      console.error("Failed to sync onboarding data:", err);
      updateProfile(profilePayload);
    }

    router.push("/dashboard");
  };

  const toggleMultiSelect = (key: keyof OnboardingData, value: string) => {
    setData(prev => {
      const current = prev[key] as string[];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter(i => i !== value) };
      } else {
        return { ...prev, [key]: [...current, value] };
      }
    });
  };

  const isNextDisabled = () => {
    switch (step) {
      case 1: return !data.name || !data.phoneNumber || data.phoneNumber.length < 10;
      case 2: return !data.stream;
      case 3: return !data.branch;
      case 4: return !data.year;
      case 5: return !data.careerGoal;
      case 6: return !data.skillLevel;
      case 7: return !data.dailyStudyTime;
      case 8: return !data.workingStatus;
      case 9: return !data.internetAccess;
      case 10: return !data.locationType;
      case 11: return !data.resourcesAccess;
      default: return false;
    }
  };

  // UI Components for cards
  const OptionCard = ({ 
    label, 
    active, 
    onClick, 
    icon: Icon 
  }: { 
    label: string; 
    active: boolean; 
    onClick: () => void; 
    icon?: any 
  }) => (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 group ${
        active 
          ? "bg-cyan-500/20 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] animate-pulse-subtle" 
          : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
      }`}
    >
      {Icon && (
        <div className={`mb-3 p-3 rounded-xl transition-colors ${active ? "text-cyan-400 bg-cyan-500/10" : "text-slate-500 bg-slate-800"}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
      <span className={`text-sm font-bold tracking-tight ${active ? "text-cyan-400" : "text-slate-300"}`}>
        {label}
      </span>
      {active && (
        <div className="absolute top-2 right-2">
          <CheckCircleIcon className="w-5 h-5 text-cyan-400" />
        </div>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Progress Header */}
      <header className="sticky top-0 z-50 w-full p-4 lg:p-6 backdrop-blur-xl bg-black/20 border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-black tracking-tighter text-lg uppercase">Study Buddy <span className="text-cyan-500">AI</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Onboarding Progress</span>
              <span className="text-xs font-bold text-cyan-400">Step {step} of {totalSteps}</span>
            </div>
            <div className="w-24 sm:w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500 ease-out"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-4xl">
          
          {/* Step Renderings */}
          <div className="animate-fadeInUp">
            {step === 1 && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Let's build your <span className="gradient-text">Identity Card</span></h1>
                  <p className="text-slate-400 max-w-lg mx-auto">We need your basic demographic nodes to initialize your neural study persona.</p>
                </div>
                <div className="max-w-md mx-auto space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Legal Full Name</label>
                      <input 
                        type="text"
                        placeholder="e.g. Alex Rivera"
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-xl font-bold focus:border-cyan-500 outline-none transition-all focus:ring-4 focus:ring-cyan-500/10 placeholder:text-slate-700"
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                        autoFocus
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Neural Alert Number (Twilio Ready)</label>
                      <input 
                        type="tel"
                        placeholder="+919302139664"
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-xl font-bold focus:border-cyan-500 outline-none transition-all focus:ring-4 focus:ring-cyan-500/10 placeholder:text-slate-700 font-mono"
                        value={data.phoneNumber}
                        onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
                      />
                      <p className="text-[9px] text-slate-600 font-medium px-1">Your AI coach will use this to call you for deadline enforcement.</p>
                   </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Choose your <span className="gradient-text">College Stream</span></h1>
                  <p className="text-slate-400 max-w-lg mx-auto">Help us understand your academic foundation so we can tailor resources for you.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {["B.Tech", "BCA", "BBA", "B.Com", "B.Sc", "Medical", "Law", "Arts", "Other"].map(item => (
                    <OptionCard 
                      key={item}
                      label={item}
                      icon={AcademicCapIcon}
                      active={data.stream === item}
                      onClick={() => setData({ ...data, stream: item })}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight">What's your <span className="gradient-text">Specialization</span>?</h1>
                  <p className="text-slate-400">Tell us your specific branch or major (e.g., Computer Science, Mechanical, Finance).</p>
                </div>
                <div className="max-w-md mx-auto">
                  <div className="relative group">
                    <input 
                      type="text"
                      placeholder="e.g. CSE, AI & ML, HR, Accounts..."
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-xl font-bold focus:border-cyan-500 outline-none transition-all focus:ring-4 focus:ring-cyan-500/10 placeholder:text-slate-600"
                      value={data.branch}
                      onChange={(e) => setData({ ...data, branch: e.target.value })}
                      autoFocus
                    />
                    <div className="mt-6 flex flex-wrap gap-2 justify-center">
                      {["CSE", "Mechanical", "Civil", "ECE", "Biotechnology", "IT"].map(suggestion => (
                        <button 
                          key={suggestion}
                          onClick={() => setData({ ...data, branch: suggestion })}
                          className="px-4 py-2 rounded-full bg-slate-800 text-xs font-bold hover:bg-slate-700 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Current <span className="gradient-text">Year</span></h1>
                  <p className="text-slate-400">Where are you in your college journey?</p>
                </div>
                <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
                  {["1st Year", "2nd Year", "3rd Year", "Final Year"].map(item => (
                    <OptionCard 
                      key={item}
                      label={item}
                      icon={ClockIcon}
                      active={data.year === item}
                      onClick={() => setData({ ...data, year: item })}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Your <span className="gradient-text">Career Goal</span></h1>
                  <p className="text-slate-400">What's the primary target after graduation?</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Placement", icon: BriefcaseIcon },
                    { label: "Higher Studies", icon: AcademicCapIcon },
                    { label: "Government Exam", icon: GlobeAltIcon },
                    { label: "Startup", icon: RocketLaunchIcon },
                    { label: "Freelancing", icon: DevicePhoneMobileIcon },
                    { label: "Research", icon: BeakerIcon },
                    { label: "MBA", icon: AcademicCapIcon },
                    { label: "Still Exploring", icon: SparklesIcon }
                  ].map(item => (
                    <OptionCard 
                      key={item.label}
                      label={item.label}
                      icon={item.icon}
                      active={data.careerGoal === item.label}
                      onClick={() => setData({ ...data, careerGoal: item.label })}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Current <span className="gradient-text">Skill Level</span></h1>
                  <p className="text-slate-400">Be honest! We adjust the roadmap difficulty based on this.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  {[
                    { label: "Beginner", desc: "Just starting out" },
                    { label: "Intermediate", desc: "Know the basics well" },
                    { label: "Advanced", desc: "Ready for specialized topics" }
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={() => setData({ ...data, skillLevel: item.label })}
                      className={`p-8 rounded-3xl border transition-all duration-300 text-left ${
                        data.skillLevel === item.label 
                          ? "bg-cyan-500/20 border-cyan-500 shadow-glow" 
                          : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <h3 className={`text-xl font-black mb-2 ${data.skillLevel === item.label ? "text-cyan-400" : "text-white"}`}>{item.label}</h3>
                      <p className="text-slate-400 text-sm font-medium">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight"><span className="gradient-text">Daily</span> Study Time</h1>
                  <p className="text-slate-400">Be realistic. How much time can you consistently dedicate every day?</p>
                </div>
                <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
                  {["1-2 Hours", "3-4 Hours", "5-6 Hours", "8+ Hours"].map(item => (
                    <OptionCard 
                      key={item}
                      label={item}
                      icon={ClockIcon}
                      active={data.dailyStudyTime === item}
                      onClick={() => setData({ ...data, dailyStudyTime: item })}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 8 && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight"><span className="gradient-text">Job Status</span></h1>
                  <p className="text-slate-400">Are you currently working or doing a part-time job?</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  {[
                    { label: "No, full-time student", desc: "100% focused on studies" },
                    { label: "Yes, part-time", desc: "Working ~20 hours/week" },
                    { label: "Yes, full-time", desc: "Working 40+ hours/week" }
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={() => setData({ ...data, workingStatus: item.label })}
                      className={`p-6 rounded-3xl border transition-all duration-300 text-left ${
                        data.workingStatus === item.label 
                          ? "bg-cyan-500/20 border-cyan-500 shadow-glow" 
                          : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <h3 className={`text-lg font-black mb-1 ${data.workingStatus === item.label ? "text-cyan-400" : "text-white"}`}>{item.label}</h3>
                      <p className="text-slate-400 text-xs font-medium">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 9 && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight"><span className="gradient-text">Internet</span> Availability</h1>
                  <p className="text-slate-400">This helps us optimize content delivery for offline use.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  {[
                    "Good (Wi-Fi/5G)", 
                    "Limited (Daily Data Cap)", 
                    "Low (Spotty Connection)"
                  ].map(item => (
                    <OptionCard 
                      key={item}
                      label={item}
                      icon={GlobeAltIcon}
                      active={data.internetAccess === item}
                      onClick={() => setData({ ...data, internetAccess: item })}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 10 && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight"><span className="gradient-text">Location</span> Type</h1>
                  <p className="text-slate-400">Where are you currently based?</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  {["Urban (Metro/Tech Hub)", "Semi-urban (Tier 2/3)", "Rural"].map(item => (
                    <OptionCard 
                      key={item}
                      label={item}
                      icon={GlobeAltIcon}
                      active={data.locationType === item}
                      onClick={() => setData({ ...data, locationType: item })}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 11 && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Access to <span className="gradient-text">Resources</span></h1>
                  <p className="text-slate-400">How do you primarily study?</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  {["Coaching / Tuition", "College Classes Only", "100% Self Study"].map(item => (
                    <OptionCard 
                      key={item}
                      label={item}
                      icon={AcademicCapIcon}
                      active={data.resourcesAccess === item}
                      onClick={() => setData({ ...data, resourcesAccess: item })}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 12 && (
              <div className="space-y-12 animate-fadeIn">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30 animate-successPulse">
                    <CheckCircleIcon className="w-12 h-12 text-green-400" />
                  </div>
                  <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
                    Your AI assistant <br /><span className="gradient-text">is ready.</span>
                  </h1>
                  <p className="text-slate-400 text-lg max-w-xl mx-auto">
                    We've synthesized your goals into a custom neural blueprint.
                  </p>
                </div>

                <div className="glass rounded-[32px] p-8 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/20 transition-all duration-700" />
                   
                   <div className="relative z-10 space-y-8">
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-8 border-b border-white/5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center text-white font-black text-2xl shadow-glow">
                          {data.name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-2xl font-black text-white">{data.name || "Student"} Identity Summary</h3>
                            <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-[10px] font-black text-white uppercase tracking-widest">Synced</span>
                          </div>
                          <p className="text-slate-400 font-medium">Personalized for {data.year} {data.stream}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <div className="space-y-2">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Academic Specialization</span>
                           <span className="text-white font-bold block">{data.branch}</span>
                        </div>
                        <div className="space-y-2">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Target Trajectory</span>
                           <span className="text-white font-bold block">{data.careerGoal}</span>
                        </div>
                        <div className="space-y-2">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Current Readiness</span>
                           <span className="text-white font-bold block">{data.skillLevel}</span>
                        </div>
                        <div className="space-y-2">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">System Optimization</span>
                           <span className="text-white font-bold block">Adaptive Planning Active</span>
                        </div>
                      </div>

                      <div className="pt-8 border-t border-white/5 space-y-4">
                        <div className="flex items-center gap-3 text-cyan-400">
                          <SparklesIcon className="w-5 h-5" />
                          <span className="text-sm font-bold uppercase tracking-widest">Motivational Directive</span>
                        </div>
                        <p className="text-slate-300 italic font-medium leading-relaxed">
                          "You've taken the first step toward masterly consistency. Your profile is now synchronized with our neural study planners. Let's start building your roadmap."
                        </p>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col items-center gap-6">
                  <button 
                    onClick={handleComplete}
                    className="w-full sm:w-auto btn btn-primary px-12 py-6 text-xl font-black group shadow-glow rounded-3xl"
                  >
                    Enter My Command Center
                    <ArrowRightIcon className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <div className="flex items-center gap-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Link: Secure
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                      Persona: Synchronized
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Navigation Footer */}
      {step < totalSteps && (
        <footer className="p-6 sm:p-12 border-t border-slate-800/50 bg-black/20 backdrop-blur-md">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <button
              onClick={prevStep}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                step === 1 
                  ? "opacity-0 pointer-events-none" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={nextStep}
              disabled={isNextDisabled()}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all group ${
                isNextDisabled()
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-cyan-500 text-white hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              }`}
            >
              {step === totalSteps - 1 ? "Finish Survey" : "Next Step"}
              <ArrowRightIcon className={`w-4 h-4 transition-transform ${!isNextDisabled() && "group-hover:translate-x-1"}`} />
            </button>
          </div>
        </footer>
      )}

      {/* Decorative Grid */}
      <div className="fixed inset-0 z-[-1] opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
    </div>
  );
}
