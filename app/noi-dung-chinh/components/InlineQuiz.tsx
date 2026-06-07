import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, ChevronRight } from "lucide-react";
import { QuizItem } from "../data/quiz";
import { useTheme } from "../../components/ThemeProvider";

export function InlineQuiz({ data }: { data: QuizItem[] }) {
  const { isDarkMode } = useTheme();
  const [idx, setIdx] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = data[idx];
  const right = pick === q.correctIndex;

  function select(i: number) {
    if (pick !== null) return;
    setPick(i);
    if (i === q.correctIndex) setScore((s) => s + 1);
  }
  function next() {
    if (idx + 1 >= data.length) setDone(true);
    else {
      setIdx((i) => i + 1);
      setPick(null);
    }
  }
  function restart() {
    setIdx(0);
    setPick(null);
    setScore(0);
    setDone(false);
  }

  if (done) {
    const pct = Math.round((score / data.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="relative inline-block mb-6">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r="62"
              fill="none"
              stroke={isDarkMode ? "#333" : "#e5e5e5"}
              strokeWidth="8"
            />
            <motion.circle
              cx="70"
              cy="70"
              r="62"
              fill="none"
              stroke={pct >= 70 ? "#27ae60" : "#DA251D"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={390}
              initial={{ strokeDashoffset: 390 }}
              animate={{ strokeDashoffset: 390 - (390 * pct) / 100 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-3xl font-black"
              style={{ color: pct >= 70 ? "#27ae60" : "#DA251D" }}
            >
              {pct}%
            </span>
            <span className={`text-xs font-medium ${isDarkMode ? 'text-white/60' : 'text-[#585858]'}`}>
              {score}/{data.length}
            </span>
          </div>
        </div>
        <p className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-[#1C1C1C]'}`}>
          {pct >= 90
            ? "Xuất sắc!"
            : pct >= 70
            ? "Tốt lắm!"
            : pct >= 50
            ? "Khá ổn!"
            : "Cố gắng thêm!"}
        </p>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-white/60' : 'text-[#585858]'}`}>
          {pct >= 70
            ? "Bạn nắm vững kiến thức rồi."
            : "Hãy đọc lại nội dung và thử lại nhé."}
        </p>
        <button
          onClick={restart}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#DA251D] hover:bg-[#8B1923] text-white rounded-full font-semibold transition-colors"
        >
          <RotateCcw size={16} /> Làm lại
        </button>
      </motion.div>
    );
  }

  return (
    <div>
      {/* progress */}
      <div className="flex items-center gap-2 mb-6">
        {data.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < idx
                ? "bg-[#DA251D]"
                : i === idx
                ? "bg-[#DA251D]/60"
                : isDarkMode ? "bg-white/10" : "bg-black/10"
            }`}
          />
        ))}
      </div>
      <div className={`flex justify-between items-center mb-6 p-3 rounded-sm border transition-colors duration-500 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
        <div className="flex flex-col">
          <span className={`text-[10px] uppercase font-bold opacity-60 ${isDarkMode ? 'text-[#E8D9C5]' : 'text-[#585858]'}`}>Tiến độ</span>
          <span className={`text-sm font-black transition-colors ${isDarkMode ? 'text-white' : 'text-[#2C2A29]'}`}>
            Câu {idx + 1} <span className="text-[#999] font-normal mx-1">/</span> {data.length}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-[10px] uppercase font-bold opacity-60 ${isDarkMode ? 'text-[#E8D9C5]' : 'text-[#585858]'}`}>Kết quả</span>
          <span className="text-sm font-black text-[#DA251D]">{score} đúng</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
        >
          <p className={`text-lg md:text-xl font-serif-heading font-bold mb-5 leading-snug transition-colors ${isDarkMode ? 'text-white' : 'text-[#2C2A29]'}`}>
            {q.question}
          </p>
          <div className="grid gap-3">
            {q.options.map((opt, i) => {
              const isCorrectOpt = i === q.correctIndex;
              const isPicked = i === pick;
              let cls =
                "w-full text-left px-5 py-4 rounded-sm border-2 font-serif-body text-base font-bold transition-all flex items-center gap-4 cursor-pointer hover:-translate-y-1 shadow-[2px_2px_0px_0px_rgba(44,42,41,1)]";
              if (pick === null)
                cls += isDarkMode 
                  ? " border-white/10 bg-[#141414] hover:bg-white/5 hover:border-[#DA251D] text-white/90"
                  : " border-[#D1C2A5] bg-white hover:bg-[#FAF3EB] hover:border-[#DA251D] text-[#5C554E]";
              else if (isCorrectOpt)
                cls += " border-[#4A5D23] bg-[#eef5e6] text-[#4A5D23]";
              else if (isPicked)
                cls += " border-[#DA251D] bg-[#fdf0f0] text-[#DA251D]";
              else cls += isDarkMode
                ? " border-white/5 bg-[#141414] text-white/30 opacity-50"
                : " border-[#D1C2A5] bg-white text-[#999] opacity-70";
              return (
                <button
                  key={i}
                  onClick={() => select(i)}
                  className={cls}
                  disabled={pick !== null}
                >
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                      pick === null
                        ? isDarkMode ? "bg-white/5 text-white border-white/10" : "bg-[#FAF3EB] text-[#2C2A29] border-[#D1C2A5]"
                        : isCorrectOpt
                        ? "bg-[#4A5D23] text-white border-[#4A5D23]"
                        : isPicked
                        ? "bg-[#DA251D] text-white border-[#DA251D]"
                        : "bg-[#f5f5f5] text-[#ccc] border-[#ddd]"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {pick !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <div
                  className={`p-5 rounded-sm text-base leading-relaxed border-2 font-serif-body ${
                    right
                      ? "bg-[#eef5e6] border-[#4A5D23] text-[#4A5D23]"
                      : "bg-[#fdf0f0] border-[#DA251D] text-[#DA251D]"
                  }`}
                >
                  <p className="font-bold mb-2 font-serif-heading text-lg">
                    {right ? "Chính xác!" : "Chưa đúng!"}
                  </p>
                </div>
                <button
                  onClick={next}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#DA251D] hover:bg-[#b01e18] text-white border-2 border-[#2C2A29] rounded-sm font-sans text-sm font-bold uppercase tracking-wider transition-colors shadow-[2px_2px_0px_0px_rgba(44,42,41,1)] active:translate-y-1 active:shadow-none"
                >
                  {idx + 1 >= data.length ? "Xem kết quả" : "Tiếp theo"}{" "}
                  <ChevronRight size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
