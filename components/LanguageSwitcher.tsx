"use client";

import { useEffect, useState } from "react";
import { GlobeAltIcon } from "@heroicons/react/24/outline";

export default function LanguageSwitcher() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    // Check cookie to set initial state
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
    if (match) {
      setLang(match[1]);
    }

    // Add Google Translate script
    const addScript = () => {
      if (document.getElementById("google-translate-script")) return;
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          { pageLanguage: "en", autoDisplay: false },
          "google_translate_element"
        );
      };
    };

    addScript();
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === "en" ? "hi" : "en";
    setLang(newLang);
    
    // Set Google Translate cookie
    if (newLang === "en") {
      document.cookie = "googtrans=/en/en; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=/en/en; domain=" + location.hostname + "; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } else {
      document.cookie = `googtrans=/en/${newLang}; path=/`;
      document.cookie = `googtrans=/en/${newLang}; domain=.${location.hostname}; path=/`;
    }
    
    // Reload to apply the translation natively across all elements
    window.location.reload();
  };

  return (
    <>
      <div id="google_translate_element" style={{ display: "none" }}></div>
      <button 
        onClick={toggleLanguage}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent"
      >
        <GlobeAltIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
        <span className="text-sm font-bold tracking-tight">
          {lang === "en" ? "हिन्दी में बदलें" : "Switch to English"}
        </span>
      </button>
    </>
  );
}
