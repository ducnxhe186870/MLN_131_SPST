"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { GameQuestion, LevelData, WeaponType, Upgrade } from "../data";
import { WEAPONS, UPGRADES, WAVES_PER_LEVEL } from "../data";
import { PixelHeart, PixelStar, PixelCharacter } from "./PixelArt";

/* ═══════════════════════════════════════════════════════════════════ */
/*  TITLE SCREEN                                                       */
/* ═══════════════════════════════════════════════════════════════════ */

export function TitleScreen({ onStart }: { onStart: () => void }) {
  const [showPress, setShowPress] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setShowPress((p) => !p), 700);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-4 scanlines overflow-hidden"
    >
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full pixel-blink"
            style={{
              width: Math.random() > 0.5 ? 3 : 2,
              height: Math.random() > 0.5 ? 3 : 2,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.4 + Math.random() * 0.6,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", delay: 0.3 }}
        className="mb-6"
      >
        {/* Stylized State Crest Emblem */}
        <div
          className="w-20 h-20 rounded-full border-4 border-[#FFD700] bg-gradient-to-br from-[#DA251D] to-[#b31410] flex items-center justify-center relative"
          style={{ boxShadow: "0 0 20px rgba(255,215,0,0.35), 4px 4px 0px #000" }}
        >
          <span className="text-4xl animate-pulse" style={{ color: "#FFD700", textShadow: "0 0 8px #FFD700" }}>★</span>
          {/* Subtle tech border ring inside the crest */}
          <div className="absolute inset-1 rounded-full border border-[#FFD700]/30 pointer-events-none" />
        </div>
      </motion.div>

      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-1 mb-5"
      >
        <p className="pixel-font text-[8px] sm:text-[10px] text-slate-400 tracking-[0.2em] uppercase">
          ▸ TRÒ CHƠI TRẮC NGHIỆM HỌC TẬP ◂
        </p>
        <h1
          className="pixel-font text-lg sm:text-2xl md:text-3xl text-[#FFD700] leading-relaxed crt-glow"
          style={{ textShadow: "2px 2px 0px #1a1a2e" }}
        >
          NHÀ NƯỚC PHÁP QUYỀN
        </h1>
        <h2
          className="pixel-font text-base sm:text-lg md:text-xl text-[#ff4a4a] leading-relaxed"
          style={{ textShadow: "2px 2px 0px #1a1a2e" }}
        >
          XÃ HỘI CHỦ NGHĨA VIỆT NAM
        </h2>
        <p className="pixel-font text-[8px] sm:text-[9px] text-[#aaa] tracking-widest mt-1">
          XÂY DỰNG CNXH & BẢO VỆ TỔ QUỐC
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="pixel-font text-[7px] sm:text-[9px] text-[#4fc3f7] mb-6 tracking-wider uppercase"
      >
        ▸ Top-Down Shooter Edition ◂
      </motion.p>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.1, type: "spring" }}
        className="mb-8"
      >
        <PixelCharacter state="idle" />
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mb-8">
        <button
          onClick={onStart}
          className="pixel-font text-[11px] sm:text-xs text-white hover:text-[#FFD700] transition-colors focus:outline-none px-6 py-2.5 bg-[#12122a]/90 border-2 border-slate-700/80 hover:border-[#FFD700]/60 rounded-xl cursor-pointer"
          style={{ opacity: showPress ? 1 : 0.4, boxShadow: "3px 3px 0 #000" }}
        >
          ▶ NHẤN ĐỂ BẮT ĐẦU ◀
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 max-w-md w-[90%] mx-auto bg-[#090b16]/75 border border-slate-800/80 rounded-2xl p-3 shadow-lg backdrop-blur-sm"
      >
        <p className="pixel-font text-[8px] sm:text-[10px] text-slate-400 text-center leading-relaxed">
          <span className="text-[#4fc3f7] font-bold">WASD</span>: DI CHUYỂN • <span className="text-[#4fc3f7] font-bold">CHUỘT</span>: NGẮM • <span className="text-[#4fc3f7] font-bold">CLICK/SPACE</span>: BẮN
        </p>
        <p className="pixel-font text-[9px] sm:text-[11px] text-[#FFD700] font-bold tracking-wider text-center mt-1">
          MÃ MÔN: MLN131
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  TUTORIAL SCREEN                                                    */
/* ═══════════════════════════════════════════════════════════════════ */

export function TutorialScreen({ onStart }: { onStart: () => void }) {
  const tips = [
    { icon: "🎮", key: "WASD", desc: "Di chuyển nhân vật" },
    { icon: "🖱️", key: "CHUỘT", desc: "Ngắm hướng bắn" },
    { icon: "💥", key: "CLICK / SPACE", desc: "Bắn đạn tiêu diệt kẻ thù" },
  ];

  const rules = [
    { icon: "⚔", text: "Tiêu diệt hết kẻ thù trong mỗi wave để mở câu hỏi quiz" },
    { icon: "📝", text: "Trả lời đúng câu hỏi lịch sử để nhận thưởng: +1 HP, +10 đạn, +100 điểm" },
    { icon: "⬆", text: "Sau mỗi wave, chọn 1 trong 3 nâng cấp để tăng sức mạnh" },
    { icon: "💔", text: "Hết HP = Game Over! Hãy bảo vệ máu của bạn" },
    { icon: "🏆", text: "Hoàn thành tất cả 7 level để chiến thắng" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 scanlines py-8 max-w-xl mx-auto"
    >
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <span
          className="pixel-font text-[14px] sm:text-[16px] px-6 py-2 bg-gradient-to-r from-[#FFD700] to-[#ffa500] text-[#1a1a2e] font-bold rounded-xl uppercase"
          style={{ boxShadow: "3px 3px 0 #000" }}
        >
          📖 HƯỚNG DẪN CHƠI
        </span>
      </motion.div>

      {/* Main glass panel */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full bg-[#0a0b16]/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6 text-left mb-6"
      >
        {/* Controls block */}
        <div>
          <p className="pixel-font text-[12px] sm:text-[13px] text-[#FFD700] font-bold border-b border-slate-800/80 pb-2 mb-3">
            ⌨ ĐIỀU KHIỂN BÀN PHÍM
          </p>
          <div className="space-y-2.5">
            {tips.map((t, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-lg w-6 text-center">{t.icon}</span>
                <span className="pixel-font text-[10px] sm:text-[11px] bg-slate-800 px-2 py-0.5 border border-slate-700/60 rounded text-[#4fc3f7] font-bold min-w-[100px] sm:min-w-[120px] text-center">
                  {t.key}
                </span>
                <span className="pixel-font text-[10px] sm:text-[11px] text-slate-300">
                  {t.desc}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Rules block */}
        <div>
          <p className="pixel-font text-[12px] sm:text-[13px] text-[#FFD700] font-bold border-b border-slate-800/80 pb-2 mb-3">
            🏆 LUẬT CHƠI & QUIZ
          </p>
          <div className="space-y-2.5">
            {rules.map((r, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 + i * 0.08 }}
                className="flex items-start gap-3"
              >
                <span className="text-base text-[#FFD700] mt-0.5">{r.icon}</span>
                <span className="pixel-font text-[10px] sm:text-[11px] text-slate-300 leading-relaxed">
                  {r.text}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        onClick={onStart}
        className="pixel-font text-[12px] sm:text-[14px] px-8 py-3.5 text-[#1a1a2e] font-black border-2 border-slate-900 rounded-xl hover:translate-y-[-1px] active:translate-y-[1px] hover:shadow-none transition-all cursor-pointer bg-gradient-to-r from-[#FFD700] to-[#ffa500]"
        style={{ boxShadow: "4px 4px 0px #000" }}
      >
        ▶ BẮT ĐẦU CHIẾN ĐẤU!
      </motion.button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  LEVEL INTRO                                                        */
/* ═══════════════════════════════════════════════════════════════════ */

export function LevelIntro({
  level,
  levelData,
  onStart,
}: {
  level: number;
  levelData: LevelData;
  onStart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 relative scanlines py-10"
    >
      <motion.div
        initial={{ scale: 3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <p className="pixel-font text-[9px] sm:text-[10px] text-slate-400 mb-3 tracking-widest uppercase">— LEVEL —</p>
        <div
          className="w-20 h-20 mx-auto mb-6 flex items-center justify-center border-4 border-[#FFD700] rounded-full relative shadow-[0_0_25px_rgba(255,215,0,0.25)]"
          style={{ background: `radial-gradient(circle, ${levelData.bg} 0%, #0a0a1e 100%)`, boxShadow: "0 0 25px rgba(255,215,0,0.25), 4px 4px 0px #000" }}
        >
          <span className="pixel-font text-3xl text-white crt-glow font-black">{level + 1}</span>
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FFD700] rounded-full animate-ping" />
        </div>
      </motion.div>

      <motion.div 
        initial={{ y: 30, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ delay: 0.3 }}
        className="max-w-md w-full bg-[#0a0b16]/85 border border-slate-800/80 rounded-2xl p-6 shadow-xl mb-6"
      >
        <h2 className="pixel-font text-sm sm:text-base text-[#FFD700] mb-2 font-bold animate-pulse" style={{ textShadow: "2px 2px 0px #1a1a2e" }}>
          {levelData.emoji} {levelData.name}
        </h2>
        <p className="pixel-font text-[9px] sm:text-[10px] text-[#4fc3f7] mb-2 font-semibold tracking-wider uppercase">
          {WAVES_PER_LEVEL} WAVE CHIẾN ĐẤU + HỎI QUIZ
        </p>
        <p className="pixel-font text-[8px] sm:text-[9px] text-slate-400 leading-relaxed">
          TIÊU DIỆT KẺ THÙ → TRẢ LỜI CÂU HỎI LỊCH SỬ → NHẬN THƯỞNG
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={onStart}
        className="pixel-font text-[11px] sm:text-xs px-10 py-3.5 text-[#1a1a2e] font-black border-2 border-slate-900 rounded-xl hover:translate-y-[-1px] active:translate-y-[1px] hover:shadow-none transition-all cursor-pointer bg-[#FFD700]"
        style={{ boxShadow: "4px 4px 0px #000" }}
      >
        ▶ XUẤT KÍCH!
      </motion.button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  QUIZ SCREEN                                                        */
/* ═══════════════════════════════════════════════════════════════════ */

export function QuizScreen({
  question,
  onAnswer,
}: {
  question: GameQuestion;
  onAnswer: (correct: boolean) => void;
}) {
  const [pick, setPick] = useState<number | null>(null);
  const isCorrect = pick === question.correctIndex;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto px-4 py-8"
    >
      <div className="text-center mb-6">
        <span className="pixel-font text-[12px] sm:text-[14px] px-5 py-2 bg-gradient-to-r from-[#FFD700] to-[#ffa500] text-[#1a1a2e] font-black rounded-xl uppercase" style={{ boxShadow: "3px 3px 0 #000" }}>
          ⚔ WAVE CLEARED — QUIZ TIME!
        </span>
      </div>

      <div
        className="p-6 sm:p-8 border border-slate-800/80 rounded-2xl relative bg-[#0c0d1b]/95 shadow-2xl"
        style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
      >
        {/* Terminal Indicator bar */}
        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[9px] mb-4 pb-3 border-b border-slate-800/80">
          <span className="w-2 h-2 rounded-full bg-red-500/80" />
          <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
          <span className="w-2 h-2 rounded-full bg-green-500/80" />
          <span className="ml-2 font-semibold text-slate-400">QUIZ DATABASE ACTIVE // LEVEL_QUESTION</span>
        </div>

        <p className="pixel-font text-[13px] sm:text-[15px] text-white leading-relaxed mb-6 mt-1 font-bold">
          {question.question}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {question.options.map((opt, i) => {
            const isThis = i === pick;
            const isCorrectOpt = i === question.correctIndex;
            let bg = "rgba(18, 18, 42, 0.6)";
            let border = "rgba(51, 65, 85, 0.4)";
            let textColor = "#ccc";

            if (pick !== null) {
              if (isCorrectOpt) {
                bg = "rgba(27, 67, 50, 0.85)";
                border = "#2d6a4f";
                textColor = "#a3e635";
              } else if (isThis) {
                bg = "rgba(61, 0, 0, 0.85)";
                border = "#cc0000";
                textColor = "#fca5a5";
              } else {
                textColor = "#555";
                bg = "rgba(10, 10, 26, 0.4)";
                border = "rgba(51, 65, 85, 0.1)";
              }
            }

            return (
              <button
                key={i}
                onClick={() => pick === null && setPick(i)}
                disabled={pick !== null}
                className="pixel-font text-[11px] sm:text-[13px] text-left px-5 py-4 transition-all rounded-xl disabled:cursor-default flex items-center gap-3 border-2 hover:bg-slate-800/40 hover:border-slate-600/40 cursor-pointer"
                style={{
                  background: bg,
                  borderColor: border,
                  color: textColor,
                  boxShadow: pick === null ? "2px 2px 0px rgba(0,0,0,0.5)" : "none",
                }}
              >
                {/* Option badge index */}
                <span
                  className="w-6 h-6 rounded-full border flex items-center justify-center font-bold text-[10px] sm:text-[11px] shrink-0"
                  style={{
                    borderColor: pick === null ? "#FFD700" : isCorrectOpt ? "#a3e635" : isThis ? "#fca5a5" : "#555",
                    color: pick === null ? "#FFD700" : isCorrectOpt ? "#a3e635" : isThis ? "#fca5a5" : "#555",
                    background: pick === null ? "transparent" : isCorrectOpt ? "rgba(45, 106, 79, 0.3)" : "rgba(204, 0, 0, 0.15)",
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="leading-snug">{opt}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {pick !== null && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 pt-4 border-t border-slate-800/80">
              <div
                className="pixel-font text-[11px] sm:text-[13px] p-4 border-2 rounded-xl leading-relaxed text-center"
                style={{
                  background: isCorrect ? "rgba(27, 67, 50, 0.5)" : "rgba(61, 0, 0, 0.5)",
                  borderColor: isCorrect ? "#2d6a4f" : "#cc0000",
                  color: isCorrect ? "#a3e635" : "#ff8888",
                  textShadow: isCorrect ? "0 0 6px rgba(163, 230, 53, 0.3)" : "0 0 6px rgba(255, 136, 136, 0.3)"
                }}
              >
                <p className="font-bold text-[12px] sm:text-[14px]">
                  {isCorrect ? "✓ CHÍNH XÁC! +1 HP, +15 ĐẠN, +100 ĐIỂM" : "✗ SAI RỒI! NHẤN TIẾP TỤC ĐỂ ĐẾN CÂU HỎI MỚI"}
                </p>
              </div>

              <div className="text-center mt-5">
                <button
                  onClick={() => onAnswer(isCorrect)}
                  className="pixel-font text-[12px] sm:text-[14px] px-10 py-3.5 text-[#1a1a2e] font-black border-2 border-slate-900 rounded-xl hover:translate-y-[-1px] active:translate-y-[1px] hover:shadow-none transition-all cursor-pointer bg-[#FFD700]"
                  style={{ boxShadow: "4px 4px 0px #000" }}
                >
                  TIẾP TỤC ▶
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  LEVEL COMPLETE                                                     */
/* ═══════════════════════════════════════════════════════════════════ */

export function LevelComplete({
  levelData,
  correctCount,
  totalQ,
  totalScore,
  onNext,
  isLastLevel,
}: {
  levelData: LevelData;
  correctCount: number;
  totalQ: number;
  totalScore: number;
  onNext: () => void;
  isLastLevel: boolean;
}) {
  const stars = correctCount === totalQ ? 3 : correctCount >= totalQ * 0.6 ? 2 : correctCount > 0 ? 1 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 scanlines py-10"
    >
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="mb-4">
        <PixelCharacter state="victory" />
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
        className="pixel-font text-base sm:text-lg text-[#FFD700] mb-1 font-bold crt-glow"
        style={{ textShadow: "2px 2px 0px #1a1a2e" }}
      >
        {isLastLevel ? "🏆 HOÀN THÀNH TOÀN BỘ!" : "LEVEL CLEAR!"}
      </motion.h2>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        className="pixel-font text-[9px] text-slate-400 mb-5 uppercase tracking-wider"
      >
        {levelData.emoji} {levelData.name}
      </motion.p>

      {/* Stars section */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, type: "spring" }}
        className="flex gap-4 mb-6"
      >
        {[0, 1, 2].map((i) => (
          <motion.div key={i} initial={{ rotate: -180, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 1 + i * 0.2, type: "spring" }}>
            <PixelStar filled={i < stars} size={36} />
          </motion.div>
        ))}
      </motion.div>

      {/* Score and Stats board */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="p-5 border border-slate-800/80 rounded-2xl mb-6 min-w-[260px] bg-[#0a0b16]/90 shadow-xl"
      >
        <div className="space-y-3 pixel-font text-[10px] sm:text-[11px]">
          <div className="flex justify-between border-b border-slate-900/60 pb-1.5">
            <span className="text-[#888]">QUIZ ĐÚNG:</span>
            <span className="text-[#a3e635] font-bold">{correctCount} / {totalQ}</span>
          </div>
          <div className="flex justify-between border-b border-slate-900/60 pb-1.5">
            <span className="text-[#888]">TỔNG ĐIỂM:</span>
            <span className="text-[#FFD700] font-black">{totalScore.toString().padStart(5, "0")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#888]">ĐÁNH GIÁ:</span>
            <span className="text-[#FFD700] font-bold">
              {stars === 3 ? "XUẤT SẮC! ★★★" : stars === 2 ? "TỐT LẮM! ★★" : stars === 1 ? "KHÁ ỔN! ★" : "CỐ THÊM!"}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
        onClick={onNext}
        className="pixel-font text-[11px] sm:text-xs px-10 py-3.5 text-[#1a1a2e] font-black border-2 border-slate-900 rounded-xl hover:translate-y-[-1px] active:translate-y-[1px] hover:shadow-none transition-all cursor-pointer bg-[#FFD700]"
        style={{ boxShadow: "4px 4px 0px #1a1a2e" }}
      >
        {isLastLevel ? "VỀ TRANG CHỦ ▶" : "LEVEL TIẾP ▶"}
      </motion.button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  GAME OVER                                                          */
/* ═══════════════════════════════════════════════════════════════════ */

export function GameOverScreen({ score, onRestart }: { score: number; onRestart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 scanlines py-10"
    >
      <motion.div initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} className="mb-6">
        <PixelCharacter state="hurt" />
      </motion.div>

      <h2 className="pixel-font text-lg sm:text-xl text-[#ff3333] mb-2 crt-glow font-black" style={{ textShadow: "2px 2px 0px #1a1a2e" }}>
        GAME OVER
      </h2>
      <p className="pixel-font text-[9px] text-slate-400 mb-5">BẠN ĐÃ HẾT HP!</p>

      <div className="p-5 border border-slate-800/80 rounded-2xl mb-6 min-w-[200px] bg-[#0a0b16]/95 shadow-xl">
        <p className="pixel-font text-[9px] text-slate-400 uppercase tracking-widest">TỔNG ĐIỂM ĐẠT ĐƯỢC</p>
        <p className="pixel-font text-2xl text-[#FFD700] mt-2 font-black tracking-wide">{score.toString().padStart(5, "0")}</p>
      </div>

      <button
        onClick={onRestart}
        className="pixel-font text-[11px] sm:text-xs px-10 py-3.5 text-[#1a1a2e] font-black border-2 border-slate-900 rounded-xl hover:translate-y-[-1px] active:translate-y-[1px] hover:shadow-none transition-all cursor-pointer bg-[#FFD700]"
        style={{ boxShadow: "4px 4px 0px #1a1a2e" }}
      >
        ↻ THỬ LẠI
      </button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  VICTORY                                                            */
/* ═══════════════════════════════════════════════════════════════════ */

export function VictoryScreen({ score, onRestart }: { score: number; onRestart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 scanlines overflow-hidden py-10"
    >
      <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", delay: 0.3 }} className="mb-4">
        <div className="pixel-font text-5xl mb-2 animate-bounce">🏆</div>
      </motion.div>

      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }} className="mb-4">
        <PixelCharacter state="victory" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        className="pixel-font text-base sm:text-lg text-[#FFD700] mb-2 crt-glow font-bold"
        style={{ textShadow: "2px 2px 0px #1a1a2e" }}
      >
        CHIẾN THẮNG QUYẾT ĐỊNH!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="pixel-font text-[9px] text-slate-400 mb-6 max-w-xs leading-relaxed uppercase tracking-wider"
      >
        BẠN ĐÃ HOÀN THÀNH TẤT CẢ CÁC LEVEL!
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
        className="p-6 border border-[#FFD700]/60 rounded-2xl mb-6 bg-[#0a0b16]/95 shadow-[0_0_30px_rgba(255,215,0,0.15)] min-w-[240px]"
        style={{ boxShadow: "0 0 30px rgba(255,215,0,0.15), 5px 5px 0px #000" }}
      >
        <p className="pixel-font text-[9px] text-slate-400 uppercase tracking-widest mb-1">TỔNG ĐIỂM CUỐI CÙNG</p>
        <p className="pixel-font text-2xl text-[#FFD700] font-black tracking-wide">{score.toString().padStart(5, "0")}</p>
        <div className="flex gap-2.5 justify-center mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} initial={{ rotate: -360, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 1.5 + i * 0.15, type: "spring" }}>
              <PixelStar filled size={28} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onRestart}
          className="pixel-font text-[10px] sm:text-xs px-8 py-3.5 text-[#1a1a2e] font-black border-2 border-slate-900 rounded-xl hover:translate-y-[-1px] active:translate-y-[1px] hover:shadow-none transition-all cursor-pointer bg-[#FFD700]"
          style={{ boxShadow: "3px 3px 0px #1a1a2e" }}
        >
          ↻ CHƠI LẠI
        </button>
        <Link
          href="/noi-dung-chinh"
          className="pixel-font text-[10px] sm:text-xs px-8 py-3.5 text-white font-bold border-2 border-slate-800 rounded-xl hover:translate-y-[-1px] active:translate-y-[1px] hover:shadow-none transition-all text-center bg-[#1a5276]/90 hover:bg-[#1a5276] cursor-pointer animate-pulse"
          style={{ boxShadow: "3px 3px 0px #000" }}
        >
          📖 XEM BÀI HỌC
        </Link>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  UPGRADE SCREEN (Archero style — pick 1 of 3)                      */
/* ═══════════════════════════════════════════════════════════════════ */

export function UpgradeScreen({
  choices,
  onPick,
}: {
  choices: { upgrade: Upgrade; stacks: number }[];
  onPick: (upgradeId: string) => void;
}) {
  const rarityStyle: Record<string, { border: string; bg: string; glow: string; label: string }> = {
    common:  { border: "#3b82f6", bg: "linear-gradient(180deg, #09132c 0%, #060b18 100%)", glow: "rgba(59, 130, 246, 0.15)", label: "THƯỜNG" },
    rare:    { border: "#a855f7", bg: "linear-gradient(180deg, #1b0a2f 0%, #0b0616 100%)", glow: "rgba(168, 85, 247, 0.15)", label: "HIẾM" },
    epic:    { border: "#f59e0b", bg: "linear-gradient(180deg, #271407 0%, #0d0a06 100%)", glow: "rgba(245, 158, 11, 0.15)", label: "SỬ THI" },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-8"
    >
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <span className="pixel-font text-[12px] sm:text-[14px] px-5 py-2 bg-gradient-to-r from-[#FFD700] to-[#ffa500] text-[#1a1a2e] font-black rounded-xl uppercase" style={{ boxShadow: "3px 3px 0 #000" }}>
          ⬆ CHỌN NÂNG CẤP
        </span>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-5 max-w-2xl w-full px-2">
        {choices.map(({ upgrade, stacks }, idx) => {
          const r = rarityStyle[upgrade.rarity] || rarityStyle.common;
          return (
            <motion.button
              key={upgrade.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 + idx * 0.15, type: "spring" }}
              onClick={() => onPick(upgrade.id)}
              className="flex-1 p-6 sm:p-7 border-2 rounded-2xl transition-all hover:translate-y-[-4px] hover:scale-[1.03] cursor-pointer text-center relative flex flex-col items-center justify-between"
              style={{
                borderColor: r.border,
                background: r.bg,
                boxShadow: `0 0 20px ${r.glow}, 4px 4px 0px rgba(0,0,0,0.5)`,
              }}
            >
              {/* Rarity label */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span
                  className="pixel-font text-[8px] px-2.5 py-0.5 rounded-full font-bold border"
                  style={{ background: r.border, color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}
                >
                  {r.label}
                </span>
              </div>

              <div className="text-4xl sm:text-5xl mb-4 mt-2 select-none animate-pulse">{upgrade.emoji}</div>
              
              <div className="space-y-1 w-full">
                <p className="pixel-font text-[11px] sm:text-[12px] text-white font-bold tracking-wide">
                  {upgrade.name}
                </p>
                <p className="pixel-font text-[8px] sm:text-[9.5px] text-[#aaa] leading-normal min-h-[40px] flex items-center justify-center">
                  {upgrade.description}
                </p>
              </div>

              {stacks > 0 ? (
                <p className="pixel-font text-[8px] text-slate-500 mt-3 border-t border-slate-900 pt-2 w-full">
                  ĐÃ NÂNG: <span className="text-[#FFD700] font-bold">x{stacks}</span>
                </p>
              ) : (
                <div className="h-4 mt-3" />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  SHOP SCREEN                                                        */
/* ═══════════════════════════════════════════════════════════════════ */

export function ShopScreen({
  score,
  currentWeaponId,
  ownedWeapons,
  onBuy,
  onEquip,
  onContinue,
}: {
  score: number;
  currentWeaponId: string;
  ownedWeapons: string[];
  onBuy: (weaponId: string) => void;
  onEquip: (weaponId: string) => void;
  onContinue: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-xl mx-auto px-4 py-8"
    >
      <div className="text-center mb-6">
        <span className="pixel-font text-[12px] sm:text-[14px] px-5 py-2 bg-gradient-to-r from-[#FFD700] to-[#ffa500] text-[#1a1a2e] font-black rounded-xl uppercase" style={{ boxShadow: "3px 3px 0 #000" }}>
          🏪 CỬA HÀNG VŨ KHÍ
        </span>
      </div>

      <div
        className="p-6 sm:p-7 border border-slate-800/80 rounded-2xl relative bg-[#0a0b16]/95 shadow-xl"
        style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
      >
        {/* Score indicator */}
        <div className="absolute -top-3.5 right-6">
          <span className="pixel-font text-[9px] px-3.5 py-1 bg-[#FFD700] text-[#1a1a2e] font-bold rounded-full border border-slate-950">
            ĐIỂM: ⬡ {score.toString().padStart(5, "0")}
          </span>
        </div>

        <div className="space-y-3 mt-4">
          {WEAPONS.map((w) => {
            const owned = ownedWeapons.includes(w.id);
            const equipped = currentWeaponId === w.id;
            const canBuy = score >= w.cost && !owned;

            return (
              <div
                key={w.id}
                className="flex items-center justify-between p-4 border-2 rounded-xl transition-all"
                style={{
                  borderColor: equipped ? "#FFD700" : owned ? "rgba(45, 106, 79, 0.4)" : "rgba(51, 65, 85, 0.3)",
                  background: equipped ? "rgba(26, 26, 58, 0.5)" : "rgba(10, 10, 30, 0.4)",
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-xl select-none">{w.emoji}</span>
                    <span className="pixel-font text-[11px] sm:text-[12px] text-white font-bold">
                      {w.name}
                    </span>
                    {equipped && (
                      <span className="pixel-font text-[7px] px-1.5 py-0.5 bg-[#FFD700] text-[#1a1a2e] font-bold rounded">
                        ĐANG DÙNG
                      </span>
                    )}
                  </div>
                  <p className="pixel-font text-[8px] sm:text-[9.5px] text-slate-400 leading-normal">
                    {w.description}
                  </p>
                </div>

                <div className="ml-4 shrink-0">
                  {equipped ? (
                    <span className="pixel-font text-[12px] text-[#FFD700] font-black px-2">✓</span>
                  ) : owned ? (
                    <button
                      onClick={() => onEquip(w.id)}
                      className="pixel-font text-[9px] sm:text-[10px] px-4 py-2 text-white border border-[#2d6a4f] rounded-lg hover:bg-[#1b4332] transition-all cursor-pointer bg-[#1b4332]/80"
                    >
                      TRANG BỊ
                    </button>
                  ) : (
                    <button
                      onClick={() => canBuy && onBuy(w.id)}
                      disabled={!canBuy}
                      className="pixel-font text-[9px] sm:text-[10px] px-4 py-2 border rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      style={{
                        background: canBuy ? "#FFD700" : "#222",
                        color: canBuy ? "#1a1a2e" : "#555",
                        borderColor: canBuy ? "#1a1a2e" : "#333",
                        boxShadow: canBuy ? "2px 2px 0px rgba(0,0,0,0.4)" : "none",
                      }}
                    >
                      ⬡ {w.cost}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center mt-6">
        <button
          onClick={onContinue}
          className="pixel-font text-[12px] sm:text-[13px] px-10 py-3.5 text-[#1a1a2e] font-black border-2 border-slate-900 rounded-xl hover:translate-y-[-1px] active:translate-y-[1px] hover:shadow-none transition-all cursor-pointer bg-[#FFD700]"
          style={{ boxShadow: "4px 4px 0px #1a1a2e" }}
        >
          TIẾP TỤC CHIẾN ĐẤU ▶
        </button>
      </div>
    </motion.div>
  );
}
