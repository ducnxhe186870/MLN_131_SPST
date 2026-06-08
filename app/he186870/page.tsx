"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal as TerminalIcon, ShieldCheck, Cpu, Code2 } from "lucide-react";

const logSequence = [
  "LOG: Initializing security protocol...",
  "LOG: Establishing secure socket connection to local gateway...",
  "LOG: Bypassing standard routing tables...",
  "LOG: Connection established successfully.",
  "LOG: Querying core authentication module...",
  "LOG: Authentication successful. Token parsed.",
  "--------------------------------------------------",
  "DECRYPTED DEVELOPER DATA FOUND:",
  "  • FULL NAME: Nguyễn Xuân Đức",
  "  • STUDENT ID: HE186870",
  "  • ROLE: Lead Web Developer & Architect",
  "  • CLASS: SE1867 — Nhóm 5",
  "  • SUBJECT: Chủ nghĩa xã hội khoa học",
  "  • PROJECT: Nhà nước Pháp quyền XHCN VN (1975-1981)",
  "--------------------------------------------------",
  "LOG: Status set to ACTIVE.",
  "LOG: Systems ready. Redirect listening active.",
  "SYS: Press [ENTER] or click anywhere to exit secure shell."
];

export default function DevSecretPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < logSequence.length) {
        const nextLine = logSequence[index];
        if (nextLine !== undefined) {
          setLogs((prev) => [...prev, nextLine]);
        }
        index++;
      } else {
        setIsFinished(true);
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = () => {
      router.push("/");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <div 
      onClick={() => router.push("/")}
      className="fixed inset-0 z-50 bg-[#070913] text-[#10b981] font-mono p-6 md:p-12 flex flex-col justify-between cursor-pointer select-none overflow-hidden"
    >
      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] z-20" />
      
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none" 
        style={{
          backgroundImage: "radial-gradient(#10b981 1px, transparent 0)",
          backgroundSize: "24px 24px"
        }}
      />

      <div className="max-w-4xl mx-auto w-full z-10 space-y-6">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-[#10b981]/30 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <TerminalIcon className="text-[#10b981] animate-pulse" size={20} />
            <span className="text-sm font-bold tracking-widest uppercase">SECURE DEV CONSOLE V1.0</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#10b981]/60">
            <Cpu size={12} />
            <span>HE186870_NODE</span>
          </div>
        </div>

        {/* Log content */}
        <div className="space-y-2 text-xs md:text-sm min-h-[350px]">
          {logs.map((log, idx) => {
            if (!log) return null;
            const isHeader = log.startsWith("DECRYPTED");
            const isInfo = log.trim().startsWith("•");
            return (
              <div 
                key={idx} 
                className={`transition-all duration-300 ${
                  isHeader 
                    ? "text-red-500 font-extrabold text-sm md:text-base mt-2" 
                    : isInfo 
                      ? "text-slate-100 font-bold pl-4" 
                      : "text-[#10b981]/90"
                }`}
              >
                {log.startsWith("LOG:") || log.startsWith("SYS:") ? (
                  <>
                    <span className="text-[#10b981]/40 mr-2">&gt;</span>
                    {log}
                  </>
                ) : (
                  log
                )}
              </div>
            );
          })}
          {!isFinished && (
            <span className="inline-block w-2.5 h-4 bg-[#10b981] animate-pulse ml-1 align-middle" />
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="max-w-4xl mx-auto w-full border-t border-[#10b981]/30 pt-4 flex flex-col md:flex-row items-center justify-between text-[10px] text-[#10b981]/50 z-10 gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={12} />
          <span>ENCRYPTED LAYER 256-AES</span>
        </div>
        <div>
          <span>NHÓM 5 — SE1867 — CNXHKH</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Code2 size={12} />
          <span>NEXT.JS APP CONTEXT</span>
        </div>
      </div>
    </div>
  );
}
