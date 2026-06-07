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
        <div
          className="w-24 h-16 bg-[#DA251D] border-4 border-[#1a1a2e] flex items-center justify-center relative"
          style={{ boxShadow: "6px 6px 0px #000" }}
        >
          <span className="text-3xl" style={{ color: "#FFD700" }}>★</span>
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-[#FFD700]" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="pixel-font text-xl sm:text-2xl md:text-3xl text-[#FFD700] mb-3 leading-relaxed crt-glow"
        style={{ textShadow: "3px 3px 0px #8B1923, 6px 6px 0px #1a1a2e" }}
      >
        NHÀ NƯỚC PHÁP QUYỀN XÃ HỘI CHỦ NGHĨA VIỆT NAM
      </motion.h1>
      <motion.h2
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="pixel-font text-[8px] sm:text-[11px] md:text-[13px] text-[#ff6b6b] mb-2 leading-relaxed"
        style={{ textShadow: "2px 2px 0px #1a1a2e" }}
      >
        XÂY DỰNG CNXH & BẢO VỆ TỔ QUỐC
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="pixel-font text-[7px] sm:text-[9px] text-[#aaa] mb-6 tracking-wider"
      >
        ▸ TOP-DOWN SHOOTER ◂
      </motion.p>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.1, type: "spring" }}
        className="mb-8"
      >
        <PixelCharacter state="idle" />
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
        <button
          onClick={onStart}
          className="pixel-font text-[10px] sm:text-xs text-white hover:text-[#FFD700] transition-colors focus:outline-none"
          style={{ opacity: showPress ? 1 : 0.3 }}
        >
          ▶ NHẤN ĐỂ BẮT ĐẦU ◀
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 pixel-font text-[6px] sm:text-[7px] text-[#555] text-center space-y-1"
      >
        <p>WASD: DI CHUYỂN • CHUỘT: NGẮM • CLICK/SPACE: BẮN</p>
        <p>MLN131</p>
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
      className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 scanlines overflow-auto"
    >
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-5"
      >
        <span
          className="pixel-font text-[16px] sm:text-[18px] px-6 py-2.5 bg-[#FFD700] text-[#1a1a2e]"
        >
          📖 HƯỚNG DẪN CHƠI
        </span>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-5 sm:p-7 border-4 border-[#333] mb-5 w-full max-w-lg"
        style={{ background: "#12122a", boxShadow: "4px 4px 0px #000" }}
      >
        <p className="pixel-font text-[13px] sm:text-[14px] text-[#FFD700] mb-4">
          ⌨ ĐIỀU KHIỂN
        </p>
        <div className="space-y-3">
          {tips.map((t, i) => (
            <motion.div
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-3 text-left"
            >
              <span className="text-xl">{t.icon}</span>
              <span className="pixel-font text-[12px] sm:text-[13px] text-[#4fc3f7] min-w-[100px] sm:min-w-[130px]">
                {t.key}
              </span>
              <span className="pixel-font text-[11px] sm:text-[12px] text-[#aaa]">
                {t.desc}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Rules */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="p-5 sm:p-7 border-4 border-[#333] mb-6 w-full max-w-lg"
        style={{ background: "#12122a", boxShadow: "4px 4px 0px #000" }}
      >
        <p className="pixel-font text-[13px] sm:text-[14px] text-[#FFD700] mb-4">
          📋 CÁCH CHƠI
        </p>
        <div className="space-y-3">
          {rules.map((r, i) => (
            <motion.div
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="flex items-start gap-3 text-left"
            >
              <span className="text-lg mt-0.5">{r.icon}</span>
              <span className="pixel-font text-[11px] sm:text-[12px] text-[#ccc] leading-relaxed">
                {r.text}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        onClick={onStart}
        className="pixel-font text-[13px] sm:text-[15px] px-10 py-4 text-[#1a1a2e] font-bold border-4 border-[#1a1a2e] hover:translate-y-1 hover:shadow-none transition-all"
        style={{ background: "#FFD700", boxShadow: "4px 4px 0px #1a1a2e" }}
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
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 relative scanlines"
    >
      <motion.div
        initial={{ scale: 3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <p className="pixel-font text-[9px] sm:text-[10px] text-[#888] mb-3">— LEVEL —</p>
        <div
          className="w-20 h-20 mx-auto mb-4 flex items-center justify-center border-4 border-[#FFD700] relative"
          style={{ background: levelData.bg, boxShadow: "4px 4px 0px #1a1a2e" }}
        >
          <span className="pixel-font text-2xl text-white crt-glow">{level + 1}</span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFD700]" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#FFD700]" />
        </div>
      </motion.div>

      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
        <h2 className="pixel-font text-sm sm:text-base text-[#FFD700] mb-2" style={{ textShadow: "2px 2px 0px #1a1a2e" }}>
          {levelData.emoji} {levelData.name}
        </h2>
        <p className="pixel-font text-[7px] sm:text-[9px] text-[#aaa] mb-2">
          {WAVES_PER_LEVEL} WAVE CHIẾN ĐẤU + QUIZ
        </p>
        <p className="pixel-font text-[6px] sm:text-[7px] text-[#666] mb-8">
          TIÊU DIỆT KẺ THÙ → TRẢ LỜI CÂU HỎI → NHẬN THƯỞNG
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={onStart}
        className="pixel-font text-[10px] sm:text-xs px-8 py-4 text-[#1a1a2e] font-bold border-4 border-[#1a1a2e] hover:translate-y-1 hover:shadow-none transition-all"
        style={{ background: "#FFD700", boxShadow: "4px 4px 0px #1a1a2e" }}
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
      className="max-w-3xl mx-auto px-4 py-8"
    >
      <div className="text-center mb-5">
        <span className="pixel-font text-[14px] sm:text-[16px] px-4 py-1.5 bg-[#FFD700] text-[#1a1a2e]">
          ⚔ WAVE CLEARED — QUIZ TIME!
        </span>
      </div>

      <div
        className="p-6 sm:p-8 border-4 border-[#333] relative"
        style={{ background: "#12122a", boxShadow: "4px 4px 0px #000" }}
      >
        <p className="pixel-font text-[14px] sm:text-[16px] text-white leading-relaxed mb-6 mt-3">
          {question.question}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options.map((opt, i) => {
            const isThis = i === pick;
            const isCorrectOpt = i === question.correctIndex;
            let bg = "#1a1a3a";
            let border = "#444";
            let textColor = "#ccc";

            if (pick !== null) {
              if (isCorrectOpt) {
                bg = "#1b4332"; border = "#2d6a4f"; textColor = "#95d5b2";
              } else if (isThis) {
                bg = "#3d0000"; border = "#ff2222"; textColor = "#ff6b6b";
              } else {
                textColor = "#555";
              }
            }

            return (
              <button
                key={i}
                onClick={() => pick === null && setPick(i)}
                disabled={pick !== null}
                className="pixel-font text-[12px] sm:text-[14px] text-left px-5 py-5 transition-all hover:translate-y-[-2px] disabled:cursor-default"
                style={{
                  background: bg,
                  borderWidth: 3,
                  borderStyle: "solid",
                  borderColor: border,
                  color: textColor,
                  boxShadow: pick === null ? "3px 3px 0px #000" : "none",
                }}
              >
                <span
                  className="inline-block mr-2"
                  style={{
                    color: pick === null ? "#FFD700" : isCorrectOpt ? "#95d5b2" : isThis ? "#ff6b6b" : "#555",
                  }}
                >
                  {String.fromCharCode(65 + i)}
                  <span style={{ fontWeight: isCorrectOpt ? "bold" : "normal", fontSize: isCorrectOpt ? "1.3em" : "1em" }}>.</span>
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {pick !== null && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
              <div
                className="pixel-font text-[12px] sm:text-[14px] p-5 border-2 leading-relaxed"
                style={{
                  background: isCorrect ? "#1b4332" : "#3d0000",
                  borderColor: isCorrect ? "#2d6a4f" : "#cc0000",
                  color: isCorrect ? "#95d5b2" : "#ff6b6b",
                }}
              >
                <p className="mb-2 text-[14px] sm:text-[16px]">
                  {isCorrect ? "CHÍNH XÁC! +1 HP, +15 ĐẠN, +100 ĐIỂM" : "SAI RỒI! NHẤN CÂU MỚI ĐỂ THỬ LẠI"}
                </p>
              </div>

              <button
                onClick={() => onAnswer(isCorrect)}
                className="pixel-font text-[14px] sm:text-[16px] mt-4 px-10 py-4 text-[#1a1a2e] font-bold border-3 border-[#1a1a2e] hover:translate-y-1 hover:shadow-none transition-all"
                style={{ background: "#FFD700", boxShadow: "3px 3px 0px #1a1a2e" }}
              >
                TIẾP TỤC ▶
              </button>
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
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 scanlines"
    >
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="mb-4">
        <PixelCharacter state="victory" />
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
        className="pixel-font text-sm sm:text-base text-[#FFD700] mb-1"
        style={{ textShadow: "2px 2px 0px #1a1a2e" }}
      >
        {isLastLevel ? "🏆 HOÀN THÀNH!" : "LEVEL CLEAR!"}
      </motion.h2>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        className="pixel-font text-[8px] text-[#aaa] mb-4"
      >
        {levelData.emoji} {levelData.name}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, type: "spring" }}
        className="flex gap-3 mb-4"
      >
        {[0, 1, 2].map((i) => (
          <motion.div key={i} initial={{ rotate: -180, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 1 + i * 0.2, type: "spring" }}>
            <PixelStar filled={i < stars} size={32} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="p-4 border-4 border-[#333] mb-6 min-w-[220px]"
        style={{ background: "#12122a", boxShadow: "4px 4px 0 #000" }}
      >
        <div className="space-y-2 pixel-font text-[8px] sm:text-[9px]">
          <div className="flex justify-between">
            <span className="text-[#888]">QUIZ ĐÚNG:</span>
            <span className="text-[#95d5b2]">{correctCount} / {totalQ}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#888]">TỔNG ĐIỂM:</span>
            <span className="text-[#FFD700]">{totalScore.toString().padStart(5, "0")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#888]">ĐÁNH GIÁ:</span>
            <span className="text-[#FFD700]">
              {stars === 3 ? "XUẤT SẮC!" : stars === 2 ? "TỐT LẮM!" : stars === 1 ? "KHÁ ỔN!" : "CỐ THÊM!"}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
        onClick={onNext}
        className="pixel-font text-[9px] sm:text-[10px] px-8 py-4 text-[#1a1a2e] font-bold border-4 border-[#1a1a2e] hover:translate-y-1 hover:shadow-none transition-all"
        style={{ background: "#FFD700", boxShadow: "4px 4px 0px #1a1a2e" }}
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
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 scanlines"
    >
      <motion.div initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} className="mb-6">
        <PixelCharacter state="hurt" />
      </motion.div>

      <h2 className="pixel-font text-lg sm:text-xl text-[#ff2222] mb-2 crt-glow" style={{ textShadow: "3px 3px 0px #1a1a2e" }}>
        GAME OVER
      </h2>
      <p className="pixel-font text-[8px] text-[#888] mb-4">BẠN ĐÃ HẾT HP!</p>

      <div className="p-4 border-4 border-[#333] mb-6" style={{ background: "#12122a", boxShadow: "4px 4px 0 #000" }}>
        <p className="pixel-font text-[9px] text-[#888]">TỔNG ĐIỂM</p>
        <p className="pixel-font text-lg text-[#FFD700] mt-1">{score.toString().padStart(5, "0")}</p>
      </div>

      <button
        onClick={onRestart}
        className="pixel-font text-[10px] px-8 py-4 text-[#1a1a2e] font-bold border-4 border-[#1a1a2e] hover:translate-y-1 hover:shadow-none transition-all"
        style={{ background: "#FFD700", boxShadow: "4px 4px 0px #1a1a2e" }}
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
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 scanlines overflow-hidden"
    >
      <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", delay: 0.3 }} className="mb-4">
        <div className="pixel-font text-4xl sm:text-5xl mb-2">🏆</div>
      </motion.div>

      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }} className="mb-4">
        <PixelCharacter state="victory" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        className="pixel-font text-base sm:text-lg text-[#FFD700] mb-1 crt-glow"
        style={{ textShadow: "2px 2px 0px #1a1a2e" }}
      >
        CHIẾN THẮNG!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="pixel-font text-[7px] sm:text-[9px] text-[#aaa] mb-6 max-w-xs leading-relaxed"
      >
        BẠN ĐÃ HOÀN THÀNH TẤT CẢ CÁC LEVEL!
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
        className="p-5 border-4 border-[#FFD700] mb-6"
        style={{ background: "#12122a", boxShadow: "6px 6px 0 #000" }}
      >
        <p className="pixel-font text-[9px] text-[#888] mb-2">TỔNG ĐIỂM</p>
        <p className="pixel-font text-xl text-[#FFD700]">{score.toString().padStart(5, "0")}</p>
        <div className="flex gap-2 justify-center mt-3">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} initial={{ rotate: -360, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 1.5 + i * 0.15, type: "spring" }}>
              <PixelStar filled size={28} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onRestart}
          className="pixel-font text-[9px] sm:text-[10px] px-6 py-3 text-[#1a1a2e] font-bold border-3 border-[#1a1a2e] hover:translate-y-1 hover:shadow-none transition-all"
          style={{ background: "#FFD700", boxShadow: "3px 3px 0px #1a1a2e" }}
        >
          ↻ CHƠI LẠI
        </button>
        <Link
          href="/noi-dung-chinh"
          className="pixel-font text-[9px] sm:text-[10px] px-6 py-3 text-white font-bold border-3 border-[#333] hover:translate-y-1 hover:shadow-none transition-all text-center"
          style={{ background: "#1a5276", boxShadow: "3px 3px 0px #000" }}
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
    common:  { border: "#4a9eff", bg: "#0a1a3a", glow: "#4a9eff22", label: "THƯỜNG" },
    rare:    { border: "#a855f7", bg: "#1a0a3a", glow: "#a855f722", label: "HIẾM" },
    epic:    { border: "#f59e0b", bg: "#2a1a0a", glow: "#f59e0b30", label: "SỬ THI" },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4"
    >
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <span className="pixel-font text-[13px] sm:text-[15px] px-5 py-2 bg-[#FFD700] text-[#1a1a2e]">
          ⬆ CHỌN NÂNG CẤP
        </span>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-5 max-w-3xl w-full px-2">
        {choices.map(({ upgrade, stacks }, idx) => {
          const r = rarityStyle[upgrade.rarity] || rarityStyle.common;
          return (
            <motion.button
              key={upgrade.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 + idx * 0.15, type: "spring" }}
              onClick={() => onPick(upgrade.id)}
              className="flex-1 p-6 sm:p-7 border-3 transition-all hover:translate-y-[-6px] hover:scale-[1.04] cursor-pointer text-center relative"
              style={{
                borderColor: r.border,
                background: r.bg,
                boxShadow: `0 0 24px ${r.glow}, 5px 5px 0px #000`,
              }}
            >
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                <span
                  className="pixel-font text-[8px] px-2 py-0.5"
                  style={{ background: r.border, color: "#fff" }}
                >
                  {r.label}
                </span>
              </div>

              <div className="text-4xl sm:text-5xl mb-4 mt-1">{upgrade.emoji}</div>
              <p className="pixel-font text-[11px] sm:text-[13px] text-white mb-2">
                {upgrade.name}
              </p>
              <p className="pixel-font text-[8px] sm:text-[10px] text-[#aaa] leading-relaxed mb-2">
                {upgrade.description}
              </p>
              {stacks > 0 && (
                <p className="pixel-font text-[7px] text-[#666]">
                  ĐÃ CÓ: x{stacks}
                </p>
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
      className="max-w-2xl mx-auto px-4 py-8"
    >
      <div className="text-center mb-5">
        <span className="pixel-font text-[11px] sm:text-[13px] px-4 py-1.5 bg-[#FFD700] text-[#1a1a2e]">
          🏪 CỬA HÀNG VŨ KHÍ
        </span>
      </div>

      <div
        className="p-5 sm:p-7 border-4 border-[#333] relative"
        style={{ background: "#12122a", boxShadow: "4px 4px 0px #000" }}
      >
        <div className="absolute -top-3 right-4">
          <span className="pixel-font text-[9px] px-3 py-1 bg-[#FFD700] text-[#1a1a2e]">
            ⬡ {score.toString().padStart(5, "0")}
          </span>
        </div>

        <div className="space-y-3 mt-3">
          {WEAPONS.map((w) => {
            const owned = ownedWeapons.includes(w.id);
            const equipped = currentWeaponId === w.id;
            const canBuy = score >= w.cost && !owned;

            return (
              <div
                key={w.id}
                className="flex items-center justify-between p-4 border-2 transition-all"
                style={{
                  borderColor: equipped ? "#FFD700" : owned ? "#2d6a4f" : "#333",
                  background: equipped ? "#1a1a3a" : "#0a0a1e",
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{w.emoji}</span>
                    <span className="pixel-font text-[10px] sm:text-[12px] text-white">
                      {w.name}
                    </span>
                    {equipped && (
                      <span className="pixel-font text-[8px] px-2 py-0.5 bg-[#FFD700] text-[#1a1a2e]">
                        ĐANG DÙNG
                      </span>
                    )}
                  </div>
                  <p className="pixel-font text-[8px] sm:text-[9px] text-[#888]">
                    {w.description}
                  </p>
                </div>

                <div className="ml-3">
                  {equipped ? (
                    <span className="pixel-font text-[10px] text-[#FFD700]">✓</span>
                  ) : owned ? (
                    <button
                      onClick={() => onEquip(w.id)}
                      className="pixel-font text-[9px] sm:text-[10px] px-4 py-2.5 text-white border-2 border-[#2d6a4f] hover:bg-[#1b4332] transition-all"
                      style={{ background: "#1b4332" }}
                    >
                      TRANG BỊ
                    </button>
                  ) : (
                    <button
                      onClick={() => canBuy && onBuy(w.id)}
                      disabled={!canBuy}
                      className="pixel-font text-[9px] sm:text-[10px] px-4 py-2.5 border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: canBuy ? "#FFD700" : "#333",
                        color: canBuy ? "#1a1a2e" : "#666",
                        borderColor: canBuy ? "#1a1a2e" : "#444",
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

      <div className="text-center mt-5">
        <button
          onClick={onContinue}
          className="pixel-font text-[11px] sm:text-[13px] px-10 py-4 text-[#1a1a2e] font-bold border-3 border-[#1a1a2e] hover:translate-y-1 hover:shadow-none transition-all"
          style={{ background: "#FFD700", boxShadow: "3px 3px 0px #1a1a2e" }}
        >
          TIẾP TỤC CHIẾN ĐẤU ▶
        </button>
      </div>
    </motion.div>
  );
}
