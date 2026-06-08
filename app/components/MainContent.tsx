"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState, useRef } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Terminal, ShieldAlert, X, Heart, Fingerprint, Cpu, Layers } from "lucide-react";

interface MainContentProps {
  children: ReactNode;
}

export default function MainContent({ children }: MainContentProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [showSecretModal, setShowSecretModal] = useState(false);
  const typedKeysRef = useRef("");

  // Secret Dev Modal Upgrade States
  const [scrambledName, setScrambledName] = useState("*******");
  const [decryptProgress, setDecryptProgress] = useState(0);

  // 3D Card tilt motion values to prevent layout jitter and component re-renders
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for card rotation (Max 12 degrees tilt)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), { damping: 25, stiffness: 250 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { damping: 25, stiffness: 250 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const xVal = e.clientX - box.left - box.width / 2;
    const yVal = e.clientY - box.top - box.height / 2;
    mouseX.set(xVal / box.width);
    mouseY.set(yVal / box.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Trigger text scrambler, audio text-to-speech, and decrypt progress
  useEffect(() => {
    if (!showSecretModal) {
      setDecryptProgress(0);
      setScrambledName("*******");
      return;
    }

    // Voice synthesis greeting
    try {
      const msg = new SpeechSynthesisUtterance("Access granted. Welcome, Developer Nguyen Xuan Duc.");
      msg.lang = "en-US";
      msg.rate = 1.05;
      msg.volume = 0.55;
      window.speechSynthesis.speak(msg);
    } catch (err) {
      console.log("SpeechSynthesis blocked or unsupported.");
    }

    // Decryption Progress simulation
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 4;
      if (progress >= 100) {
        setDecryptProgress(100);
        clearInterval(progressInterval);

        // Run text scrambler after decryption progress is complete
        const target = "Nguyễn Xuân Đức";
        const chars = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
        let iterations = 0;
        const scramblerInterval = setInterval(() => {
          setScrambledName(() => {
            return target
              .split("")
              .map((char, index) => {
                if (index < iterations) {
                  return target[index];
                }
                return chars[Math.floor(Math.random() * chars.length)];
              })
              .join("");
          });
          iterations += 1/3; // solve speed multiplier
          if (iterations >= target.length) {
            setScrambledName(target);
            clearInterval(scramblerInterval);
          }
        }, 30);
      } else {
        setDecryptProgress(progress);
      }
    }, 25);

    return () => {
      clearInterval(progressInterval);
    };
  }, [showSecretModal]);

  // Listen to the custom event from the Logo clicks
  useEffect(() => {
    const handleSecretTrigger = () => {
      setShowSecretModal(true);
    };
    window.addEventListener("trigger-dev-secret", handleSecretTrigger);
    return () => window.removeEventListener("trigger-dev-secret", handleSecretTrigger);
  }, []);

  // Listen to keyboard cheat code "devduc"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowSecretModal(false);
        return;
      }

      // Avoid triggering when writing in input elements
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.getAttribute("contenteditable") === "true")) {
        return;
      }

      // Use e.code (physical keys) with e.key fallback to bypass Unikey / EVKey / Vietnamese IME issues
      let char = "";
      if (e.code && e.code.startsWith("Key")) {
        char = e.code.substring(3).toLowerCase(); // "KeyD" -> "d"
      } else if (e.key && e.key.length === 1) {
        char = e.key.toLowerCase();
      }

      if (char && char.match(/[a-z]/)) {
        typedKeysRef.current = (typedKeysRef.current + char).slice(-6); // track last 6 characters
        if (typedKeysRef.current === "devduc") {
          setShowSecretModal((curr) => !curr);
          typedKeysRef.current = "";
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main className={`${isHomePage ? "pt-[200px]" : "pt-[72px]"} min-h-screen relative`}>
      {children}

      {/* Secret Dev Modal - Futuristic Holographic Agent Passport */}
      <AnimatePresence>
        {showSecretModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg"
            style={{ perspective: 1000 }}
            onClick={() => setShowSecretModal(false)}
          >
            <motion.div
              style={{ 
                rotateX, 
                rotateY, 
                transformStyle: "preserve-3d", 
                backfaceVisibility: "hidden", 
                WebkitBackfaceVisibility: "hidden" 
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 20, stiffness: 220 }}
              className="w-full max-w-xl p-8 relative overflow-hidden border border-red-500/35 rounded-3xl bg-[#090b16]/95 shadow-[0_0_60px_rgba(239,68,68,0.25)] text-slate-200 cursor-default select-none antialiased"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Futuristic Scanning Line Overlay */}
              <motion.div 
                animate={{ y: ["-10%", "110%", "-10%"] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }} 
                className="absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_rgba(239,68,68,0.8)] z-10 pointer-events-none"
                style={{ top: 0 }}
              />

              {/* Digital Grid pattern */}
              <div 
                className="absolute inset-0 opacity-[0.04] z-0 pointer-events-none" 
                style={{
                  backgroundImage: "radial-gradient(var(--accent-color, #ef4444) 1px, transparent 0)",
                  backgroundSize: "16px 16px"
                }}
              />

              {/* Scanline pattern backdrop */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] opacity-20 z-0" />

              {/* Close Button with cyber hover */}
              <button 
                onClick={() => setShowSecretModal(false)}
                className="absolute top-5 right-5 p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-red-550 hover:border-red-500/30 transition-all cursor-pointer z-20 hover:scale-105"
              >
                <X size={16} />
              </button>

              {decryptProgress < 100 ? (
                /* Dynamic Cyber Decryption Progress Screen */
                <div className="flex flex-col items-center justify-center py-16 space-y-6 font-mono text-center">
                  <div className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                    <Cpu className="animate-spin" size={40} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-red-500 font-extrabold tracking-widest text-xs uppercase animate-pulse">
                      DECRYPTING AGENT ACCESS KEY
                    </h3>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider">
                      BYPASSING SE1867 SECURITY GATEWAY ...
                    </p>
                  </div>
                  
                  {/* Custom Tech Progress Bar */}
                  <div className="w-full max-w-xs h-2 bg-slate-950 border border-slate-800/80 rounded-full overflow-hidden p-0.5 shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-red-650 to-red-500 rounded-full transition-all duration-75 shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                      style={{ width: `${decryptProgress}%` }} 
                    />
                  </div>
                  <span className="text-[10px] text-red-500/90 font-bold tracking-widest">{decryptProgress}% SOLVED</span>
                </div>
              ) : (
                /* Upgraded Holographic Card Content */
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                  style={{ transform: "translateZ(30px)" }}
                >
                  {/* Header block with animated credentials - pr-12 added to avoid close button X overlap */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6 pr-12">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">
                        <ShieldAlert size={20} className="animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-mono text-xs font-black uppercase tracking-[0.2em] text-red-500">
                          SECURE DEV PASSPORT
                        </h3>
                        <p className="font-mono text-[9px] text-slate-400 flex items-center gap-1.5 uppercase mt-0.5">
                          <Cpu size={10} className="animate-spin text-red-500/50" /> NODE_HE186870 // SYSTEM_CONNECTED
                        </p>
                      </div>
                    </div>
                    
                    {/* Auth indicator */}
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[9px] font-extrabold uppercase select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      AUTH_VERIFIED
                    </div>
                  </div>

                  {/* Two Column ID layout */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    
                    {/* Column 1: Cyber picture/HUD & Barcode */}
                    <div className="md:col-span-4 flex flex-col items-center" style={{ transform: "translateZ(40px)" }}>
                      {/* Cyberpunk HUD Frame */}
                      <div className="relative w-32 h-32 border border-red-500/20 rounded-2xl flex items-center justify-center bg-black/45 shadow-inner overflow-hidden group">
                        {/* Glowing scanning matrix */}
                        <div className="absolute inset-0 bg-red-500/[0.02] animate-pulse" />
                        
                        {/* HUD Circular rings rotating */}
                        <svg className="w-24 h-24 text-red-500/30 animate-[spin_12s_linear_infinite]" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" strokeDasharray="5 5" fill="none" />
                          <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="1.5" strokeDasharray="40 10" fill="none" />
                        </svg>
                        <svg className="absolute w-20 h-20 text-red-500/50 animate-[spin_8s_linear_infinite_reverse]" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" strokeDasharray="15 30" fill="none" />
                          <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                        </svg>
                        
                        {/* Fingerprint scanner */}
                        <Fingerprint className="absolute text-red-500/80 animate-pulse group-hover:scale-110 transition-transform duration-300" size={36} />
                      </div>

                      {/* Simulated Barcode */}
                      <div className="w-full flex flex-col items-center gap-1 mt-5">
                        <div className="flex gap-[2px] h-8 items-center bg-slate-900/60 px-3.5 py-1.5 rounded-xl border border-slate-800/80">
                          {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3].map((h, i) => (
                            <span 
                              key={i} 
                              className="w-[1.5px] bg-red-500/70 block" 
                              style={{ height: `${h * 10}%` }} 
                            />
                          ))}
                        </div>
                        <span className="text-[7px] text-slate-400 tracking-[0.25em] font-sans font-bold uppercase mt-0.5">AGENT_HE186870</span>
                      </div>
                    </div>

                    {/* Column 2: Decrypted details */}
                    <div className="md:col-span-8 space-y-4" style={{ transform: "translateZ(20px)" }}>
                      <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px] border-b border-slate-800/50 pb-2">
                        <Terminal size={12} className="animate-pulse" />
                        <span>&gt; decrypting_identity ... SUCCESS</span>
                      </div>

                      <div className="space-y-3 font-mono text-xs md:text-sm">
                        <div className="grid grid-cols-12 gap-2 border-b border-slate-900/50 pb-2">
                          <span className="col-span-4 text-slate-400 font-semibold uppercase text-[10px] tracking-wide self-center">Developer</span>
                          <span className="col-span-8 text-red-400 font-black text-sm md:text-base leading-none tracking-wide animate-pulse [text-shadow:0_0_8px_rgba(239,68,68,0.45)]">
                            {scrambledName}
                          </span>
                        </div>
                        <div className="grid grid-cols-12 gap-2 border-b border-slate-900/50 pb-2">
                          <span className="col-span-4 text-slate-400 font-semibold uppercase text-[10px] tracking-wide self-center">StudentID</span>
                          <span className="col-span-8 text-white font-extrabold tracking-wide">HE186870</span>
                        </div>
                        <div className="grid grid-cols-12 gap-2 border-b border-slate-900/50 pb-2">
                          <span className="col-span-4 text-slate-400 font-semibold uppercase text-[10px] tracking-wide self-center">Assignment</span>
                          <span className="col-span-8 text-white font-extrabold">Lập trình viên</span>
                        </div>
                        <div className="grid grid-cols-12 gap-2 border-b border-slate-900/50 pb-2">
                          <span className="col-span-4 text-slate-400 font-semibold uppercase text-[10px] tracking-wide self-center">Division</span>
                          <span className="col-span-8 text-white font-extrabold">Lớp SE1867 — Nhóm 5</span>
                        </div>
                        <div className="grid grid-cols-12 gap-2 border-b border-slate-900/50 pb-2">
                          <span className="col-span-4 text-slate-400 font-semibold uppercase text-[10px] tracking-wide self-center">Subject</span>
                          <span className="col-span-8 text-slate-100 font-bold leading-normal">Chủ nghĩa xã hội khoa học</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Security bottom warning banner */}
                  <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-[9px] text-red-500/80 font-bold uppercase tracking-wider">
                      <Layers size={12} className="animate-bounce" />
                      <span>SYSTEM_CLEARANCE: LEVEL_5 // CODE_READY</span>
                    </div>
                    <div className="text-[10px] text-slate-400 italic text-center flex items-center justify-center gap-1">
                      Made with <Heart size={10} className="text-red-500 fill-current animate-pulse" /> by HE186870
                    </div>
                  </div>
                </motion.div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
