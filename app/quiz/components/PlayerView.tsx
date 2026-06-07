'use client';

import { useEffect, useRef, useState } from 'react';
import { clientDb } from '@/lib/firebaseClient';
import { doc, onSnapshot } from 'firebase/firestore';
import { 
  ShieldCheck, 
  Award, 
  Timer, 
  User, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestionEvent {
  question: {
    index: number;
    total: number;
    prompt: string;
    options: string[];
    deadline?: number;
    durationMs?: number;
    correctIndex?: number;
  };
}

interface LeaderboardEvent {
  leaderboard: Array<{ id: string; name: string; score: number }>;
  answeredCount: number;
  playerCount: number;
}

export default function PlayerView() {
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [question, setQuestion] = useState<QuestionEvent['question'] | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [showingResult, setShowingResult] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEvent['leaderboard']>([]);
  const [status, setStatus] = useState<'lobby' | 'in-progress' | 'finished'>('lobby');
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const lastQuestionIndexRef = useRef<number>(-1);
  const showResultTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rejoinAttemptedRef = useRef(false);
  const missingRoomSinceRef = useRef<number | null>(null);

  // Khi hết giờ hoặc host kết thúc, hiển thị kết quả trong 3s
  useEffect(() => {
    if (!question) return;

    const shouldShowResult = timeLeft === 0 || showingResult;
    if (!shouldShowResult) return;

    setShowingResult(true);
    if (question.correctIndex !== undefined) {
      setCorrectIndex(question.correctIndex);
    }

    if (!showResultTimerRef.current) {
      showResultTimerRef.current = setTimeout(() => {
        showResultTimerRef.current = null;
      }, 3000);
    }

    return () => {
      if (showResultTimerRef.current) {
        clearTimeout(showResultTimerRef.current);
        showResultTimerRef.current = null;
      }
    };
  }, [question, timeLeft, showingResult]);

  // Polling fallback nếu realtime bị gián đoạn
  useEffect(() => {
    if (!joined || !roomCodeInput) return;

    const code = roomCodeInput.toUpperCase();

    const poll = async () => {
      try {
        const res = await fetch(`/api/rooms/${code}/state`);
        const data = await res.json();
        if (res.ok) {
          setStatus(data.status ?? 'lobby');
          if (Array.isArray(data.leaderboard)) {
            setLeaderboard(data.leaderboard);
          }
          setShowingResult(data.showingResult ?? false);
          if (data.currentQuestion && data.currentQuestion.index !== lastQuestionIndexRef.current) {
            lastQuestionIndexRef.current = data.currentQuestion.index;
            setQuestion(data.currentQuestion);
            setHasAnswered(false);
            setSelectedAnswer(null);
            setCorrectIndex(null);
            setShowingResult(false);
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            if (data.currentQuestion.deadline && data.currentQuestion.durationMs) {
              const tick = () => {
                const msLeft = Math.max(0, data.currentQuestion.deadline - Date.now());
                setTimeLeft(Math.ceil(msLeft / 1000));
              };
              tick();
              timerRef.current = setInterval(tick, 500);
            } else {
              setTimeLeft(null);
            }
          }
          if (data.currentQuestion?.correctIndex !== undefined) {
            setCorrectIndex(data.currentQuestion.correctIndex);
          }
          if (data.status === 'finished') {
            setQuestion(null);
            setTimeLeft(null);
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          }
        } else if (res.status === 404) {
          if (!rejoinAttemptedRef.current && playerId && playerName) {
            rejoinAttemptedRef.current = true;
            const joinRes = await fetch(`/api/rooms/${code}/join`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ playerId, playerName, code }),
            });
            if (joinRes.ok) {
              setError(null);
              missingRoomSinceRef.current = null;
              return;
            }
          }
          if (!missingRoomSinceRef.current) {
            missingRoomSinceRef.current = Date.now();
          }
          const elapsed = Date.now() - (missingRoomSinceRef.current || Date.now());
          if (elapsed > 5000) {
            setError('Đang chờ host khôi phục phòng... Nếu quá lâu, hãy kiểm tra mã phòng.');
          }
        }
      } catch (err) {
        console.warn('Poll room state failed', err);
      }
    };

    poll();
    pollRef.current = setInterval(poll, 1500);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [joined, roomCodeInput, playerId, playerName]);

  useEffect(() => {
    if (!joined || !roomCodeInput) return;

    const code = roomCodeInput.toUpperCase();
    const roomRef = doc(clientDb, 'rooms', code);
    const unsubscribe = onSnapshot(
      roomRef,
      (snap) => {
        if (!snap.exists()) {
          setError('Phòng không tồn tại hoặc đã hết hạn. Vui lòng kiểm tra mã phòng.');
          return;
        }

        const room = snap.data() as any;
        setStatus(room.status ?? 'lobby');
        setLeaderboard(
          Object.entries(room.leaderboard || {})
            .map(([id, entry]: any) => ({ id, ...entry }))
            .sort((a: any, b: any) => b.score - a.score || (a.lastAnswerAt || 0) - (b.lastAnswerAt || 0))
        );
        setShowingResult(false);
        setError(null);

        if (room.status === 'finished') {
          setQuestion(null);
          setTimeLeft(null);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return;
        }

        if (room.status === 'in-progress' && room.currentQuestionIndex >= 0 && room.currentQuestionIndex < room.quiz.length) {
          const q = room.quiz[room.currentQuestionIndex];
          if (room.currentQuestionIndex !== lastQuestionIndexRef.current) {
            lastQuestionIndexRef.current = room.currentQuestionIndex;
            setQuestion({
              index: room.currentQuestionIndex,
              total: room.quiz.length,
              prompt: q.question,
              options: q.options,
              deadline: room.questionDeadline ?? undefined,
              durationMs: room.questionDurationMs ?? undefined,
              correctIndex: undefined,
            });
            setHasAnswered(false);
            setSelectedAnswer(null);
            setCorrectIndex(null);
            setShowingResult(false);
          }

          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          if (room.questionDeadline && room.questionDurationMs) {
            const tick = () => {
              const msLeft = Math.max(0, room.questionDeadline - Date.now());
              setTimeLeft(Math.ceil(msLeft / 1000));
            };
            tick();
            timerRef.current = setInterval(tick, 500);
          } else {
            setTimeLeft(null);
          }

          if (room.questionDeadline && Date.now() > room.questionDeadline) {
            setCorrectIndex(q.correctIndex);
            setShowingResult(true);
          }
        }
      },
      (err) => {
        console.warn('Player snapshot error', err);
        setError('Mất kết nối realtime, đang thử lại...');
      }
    );

    return () => {
      unsubscribe();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [joined, roomCodeInput]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    rejoinAttemptedRef.current = false;
    if (!roomCodeInput.trim() || !playerName.trim()) {
      setError('Nhập mã phòng và tên');
      return;
    }

    const code = roomCodeInput.toUpperCase();
    const id = Math.random().toString(36).slice(2, 9);
    try {
      const res = await fetch(`/api/rooms/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: id, playerName, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Không thể tham gia');
      setPlayerId(id);
      setJoined(true);
      setStatus(data.status || 'lobby');
    } catch (err: any) {
      setError(err?.message || 'Không thể tham gia');
    }
  };

  const handleAnswer = async (index: number) => {
    if (!playerId || !roomCodeInput || hasAnswered || status !== 'in-progress' || showingResult) return;
    setHasAnswered(true);
    setSelectedAnswer(index);
    setError(null);
    const code = roomCodeInput.toUpperCase();
    const res = await fetch(`/api/rooms/${code}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, playerName, answerIndex: index, code }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || 'Không gửi được đáp án');
    }
  };

  // 1. Màn hình tham gia phòng (Chưa Join)
  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-[#FAF8F5] via-[#FDF9F2] to-[#FAF8F5] dark:from-[#0B0D17] dark:via-[#12162A] dark:to-[#0B0D17] relative overflow-hidden pt-28">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/5 via-amber-500/[0.02] to-red-500/[0.02] dark:from-slate-950 dark:via-red-950/10 dark:to-slate-950 pointer-events-none z-0" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 rounded-3xl backdrop-blur-2xl bg-white/40 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 relative z-10 shadow-2xl"
        >
          {/* Ornaments */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-red-600 dark:border-red-500 opacity-60" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-red-600 dark:border-red-500 opacity-60" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-red-600 dark:border-red-500 opacity-60" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-red-600 dark:border-red-500 opacity-60" />

          <div className="text-center mb-6">
            <div className="p-3 bg-red-500/10 text-red-550 rounded-2xl w-fit mx-auto mb-3 shadow-inner">
              <ShieldCheck size={28} className="animate-pulse" />
            </div>
            <h2 className="text-2xl md:text-3xl font-serif-heading font-black text-slate-900 dark:text-white uppercase tracking-wider">Điểm Danh Sĩ Tử</h2>
            <div className="w-16 h-0.5 bg-red-650 dark:bg-red-500 mx-auto mt-2"></div>
            <p className="mt-3 text-xs font-serif-body text-slate-500 dark:text-slate-400 italic">Nhập mã phòng và tên của đồng chí để kết nối thi đấu</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-sans font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mã phòng thi (PIN)</label>
              <input
                type="text"
                placeholder="PIN 5 KÝ TỰ..."
                className="w-full p-3.5 text-2xl font-mono font-black tracking-[0.25em] text-center text-slate-850 dark:text-white bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all uppercase placeholder-slate-300 dark:placeholder-slate-700"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Họ tên của đồng chí</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ví dụ: Hoàng Hoa Thám..."
                  className="w-full pl-10 pr-4 py-3.5 text-sm font-sans font-bold text-slate-850 dark:text-white bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all placeholder-slate-400 dark:placeholder-slate-650"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={12}
                />
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 mt-4 font-sans font-black text-xs text-white bg-gradient-to-r from-red-650 to-amber-600 hover:from-red-600 hover:to-amber-500 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-600/10"
            >
              <Sparkles size={13} fill="white" /> Nối Cáp Vào Phòng
            </button>

            {error && (
              <div className="text-xs font-sans font-bold text-center text-red-650 dark:text-red-400 mt-4 bg-red-500/5 border border-red-500/10 p-3 rounded-xl flex items-center gap-2 justify-center">
                <AlertCircle size={14} /> {error}
              </div>
            )}
          </form>
        </motion.div>
      </div>
    );
  }

  // 2. Màn hình phòng chờ (Lobby)
  if (status === 'lobby') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-[#FAF8F5] via-[#FDF9F2] to-[#FAF8F5] dark:from-[#0B0D17] dark:via-[#12162A] dark:to-[#0B0D17] relative overflow-hidden pt-28">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/5 via-amber-500/[0.02] to-red-500/[0.02] dark:from-slate-950 dark:via-red-950/10 dark:to-slate-950 pointer-events-none z-0" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md p-8 rounded-3xl backdrop-blur-2xl bg-white/40 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 text-center shadow-2xl"
        >
          <div className="flex items-center justify-center w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl mx-auto mb-6 shadow-inner animate-pulse">
            <Users size={36} />
          </div>
          <h2 className="text-2xl font-serif-heading font-black text-slate-900 dark:text-white uppercase tracking-wider">Đã Điểm Danh!</h2>
          <div className="w-12 h-0.5 bg-slate-200 dark:bg-slate-800 mx-auto my-4"></div>
          
          <p className="text-xs font-serif-body text-slate-550 dark:text-slate-400 italic mb-6 leading-relaxed">
            Đồng chí đã được ghi danh vào bảng sĩ tử. Vui lòng chờ lệnh phát đề từ Bàn Chỉ Huy (Giáo viên).
          </p>

          <div className="inline-block px-6 py-4 border border-slate-200/50 dark:border-slate-800/30 bg-slate-500/5 rounded-2xl shadow-inner mb-2 w-full">
            <span className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Đồng chí dự thi</span>
            <div className="text-2xl font-serif-heading font-black text-slate-800 dark:text-slate-200">{playerName}</div>
          </div>

          {error && (
            <div className="mt-4 text-xs font-sans font-bold text-center text-red-650 bg-red-500/5 border border-red-500/10 p-3 rounded-xl flex items-center justify-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // 3. Màn hình bế mạc (Finished / Final Leaderboard)
  if (status === 'finished') {
    return (
      <div className="flex flex-col min-h-screen p-4 pt-28 max-w-3xl mx-auto relative z-10 bg-gradient-to-br from-[#FAF8F5] via-[#FDF9F2] to-[#FAF8F5] dark:from-[#0B0D17] dark:via-[#12162A] dark:to-[#0B0D17]">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/5 via-amber-500/[0.02] to-red-500/[0.02] dark:from-slate-950 dark:via-red-950/10 dark:to-slate-950 pointer-events-none z-0" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 p-8 rounded-3xl backdrop-blur-2xl bg-white/40 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 text-center mb-6 shadow-2xl"
        >
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl w-fit mx-auto mb-4 border border-amber-500/20">
            <Trophy size={32} className="animate-bounce" />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif-heading font-black text-red-650 dark:text-red-400 uppercase tracking-wider">Bế Mạc Khóa Thi</h2>
          <div className="w-12 h-0.5 bg-slate-200 dark:bg-slate-800 mx-auto my-4"></div>
          <p className="text-xs font-serif-body text-slate-550 dark:text-slate-400 italic">
            Tuyên dương đồng chí <strong className="text-slate-800 dark:text-white not-italic">{playerName}</strong> đã tích cực hoàn thành khóa thi lý luận.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative z-10 p-6 rounded-3xl backdrop-blur-2xl bg-white/40 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 shadow-2xl"
        >
          <div className="text-lg font-serif-heading font-black text-slate-900 dark:text-white border-b border-slate-200/20 dark:border-slate-800/20 pb-3 mb-4 uppercase tracking-wider flex items-center gap-2">
            🏆 Bảng Vàng Vinh Danh
          </div>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {leaderboard.map((entry, idx) => {
              const isMe = entry.name === playerName;
              return (
                <div 
                  key={entry.id} 
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isMe 
                      ? 'bg-red-500/5 border-red-550/30 shadow-inner' 
                      : 'bg-white/30 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 flex items-center justify-center text-xs font-sans font-black rounded-lg border ${
                      idx === 0 
                        ? 'bg-amber-500/20 text-amber-600 border-amber-500/30' 
                        : idx === 1 
                        ? 'bg-slate-300/30 text-slate-500 border-slate-300/40' 
                        : idx === 2 
                        ? 'bg-orange-550/10 text-orange-650 border-orange-500/20' 
                        : 'bg-slate-500/10 text-slate-500 border-transparent'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className={`font-serif-heading font-bold text-sm ${isMe ? 'text-red-650 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {entry.name} {isMe && <span className="text-[9px] font-sans font-bold uppercase tracking-wider ml-1.5 bg-red-500/15 px-1.5 py-0.5 rounded-md">Tôi</span>}
                    </span>
                  </div>
                  <span className="font-mono font-black text-red-650 dark:text-red-400 text-base">{entry.score} đ</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  }

  // 4. Màn hình hiển thị câu hỏi (Question / Answering)
  if (question) {
    const isCorrect = selectedAnswer === correctIndex;

    const renderOptions = (disabled: boolean) => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 max-w-4xl mx-auto w-full relative z-10">
        {question.options.map((opt, idx) => {
          const isSelected = idx === selectedAnswer;
          const isCorrectOpt = correctIndex !== null && idx === correctIndex;
          
          let buttonStyle = "border-2 border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:border-red-650/80 hover:bg-slate-50 dark:hover:bg-slate-850/55 shadow-md";
          let badgeStyle = "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800";
          let opacity = "";
          
          if (showingResult) {
            if (isCorrectOpt) {
              buttonStyle = "border-2 border-emerald-500 dark:border-emerald-550 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-bold shadow-md shadow-emerald-500/5";
              badgeStyle = "bg-emerald-500 text-white border-emerald-500";
              opacity = "opacity-100 scale-[1.015]";
            } else if (isSelected && !isCorrectOpt) {
              buttonStyle = "border-2 border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-400 font-bold shadow-md shadow-red-500/5";
              badgeStyle = "bg-red-550 text-white border-red-550";
              opacity = "opacity-100 scale-[1.015]";
            } else {
              buttonStyle = "border border-slate-200 dark:border-slate-900 bg-slate-100/50 dark:bg-slate-950/60 text-slate-400 dark:text-slate-600";
              badgeStyle = "bg-slate-200/20 dark:bg-slate-800/20 text-slate-300 dark:text-slate-700 border-transparent";
              opacity = "opacity-50";
            }
          } else if (disabled && !isSelected) {
            opacity = "opacity-50";
          } else if (isSelected) {
            buttonStyle = "border-2 border-red-550 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-450 font-bold";
            badgeStyle = "bg-red-550 text-white border-red-550";
            opacity = "scale-[1.015]";
          }
          
          return (
            <button
              key={idx}
              onClick={() => !disabled && handleAnswer(idx)}
              disabled={disabled}
              className={`p-5 min-h-[90px] border rounded-2xl flex items-center gap-4 text-left transition-all backdrop-blur-md ${buttonStyle} ${opacity} ${!disabled ? 'hover:-translate-y-0.5 active:translate-y-0 cursor-pointer' : 'cursor-default'}`}
            >
              <span className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl font-bold text-sm border ${badgeStyle}`}>
                {idx === 0 ? 'A' : idx === 1 ? 'B' : idx === 2 ? 'C' : 'D'}
              </span>
              <span className="font-serif-heading font-bold text-xs md:text-sm leading-snug w-full">
                {opt}
              </span>
            </button>
          );
        })}
      </div>
    );

    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#FDF9F2] to-[#FAF8F5] dark:from-[#0B0D17] dark:via-[#12162A] dark:to-[#0B0D17] relative overflow-hidden pt-28 pb-10">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/5 via-amber-500/[0.02] to-red-500/[0.02] dark:from-slate-950 dark:via-red-950/10 dark:to-slate-950 pointer-events-none z-0" />
        
        {/* Top Active Bar */}
        <div className="max-w-4xl mx-auto w-full px-4 mb-4 relative z-10">
          <div className="backdrop-blur-xl bg-white/40 dark:bg-slate-950/40 p-4 rounded-2xl flex justify-between items-center shadow-sm border border-slate-200/50 dark:border-slate-800/40">
            <span className="px-3 py-1 bg-red-650 text-white font-sans font-black text-[10px] uppercase tracking-widest rounded-lg">
              Câu hỏi {question.index + 1} / {question.total}
            </span>
            {timeLeft !== null && (
              <div className="flex items-center gap-2">
                <Timer size={14} className="text-red-650 dark:text-red-400" />
                <span className="font-mono font-black text-red-650 dark:text-red-400 text-xl">
                  {timeLeft}s
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Question Panel */}
        <div className="max-w-4xl mx-auto w-full px-4 mb-6 relative z-10">
          <motion.div 
            key={question.index}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 md:p-8 rounded-3xl backdrop-blur-2xl bg-white/45 dark:bg-slate-950/40 text-center border border-slate-200/50 dark:border-slate-800/40 shadow-md"
          >
            <h2 className="text-lg md:text-xl lg:text-2xl font-serif-heading font-black text-slate-900 dark:text-white leading-snug">
              {question.prompt}
            </h2>
          </motion.div>
        </div>

        {/* Options Grid */}
        {renderOptions(hasAnswered || showingResult)}

        {/* Error Notification */}
        {error && (
          <div className="p-3 mt-4 mx-auto max-w-4xl w-full text-center text-red-650 bg-red-500/5 border border-red-500/10 text-xs relative z-10 font-bold rounded-xl flex items-center justify-center gap-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* Modal: Waiting for other players */}
        <AnimatePresence>
          {hasAnswered && !showingResult && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 flex items-center justify-center p-4 pointer-events-none"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-8 rounded-3xl bg-white/90 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 text-center shadow-2xl max-w-xs w-full pointer-events-auto"
              >
                <Loader2 className="w-8 h-8 text-red-650 dark:text-red-400 animate-spin mx-auto mb-3" />
                <h3 className="text-base font-serif-heading font-black text-slate-900 dark:text-white uppercase tracking-wider">Đã ghi nhận bài thi</h3>
                <div className="w-12 h-0.5 my-2 bg-slate-200 dark:bg-slate-800 mx-auto"></div>
                <p className="text-[11px] font-serif-body text-slate-500 dark:text-slate-400 italic">Vui lòng chờ các sĩ tử khác hoàn thành...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal: Question finished result popup */}
        <AnimatePresence>
          {showingResult && correctIndex !== null && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className={`p-8 rounded-3xl border text-center shadow-2xl max-w-md w-full relative overflow-hidden backdrop-blur-2xl ${
                  isCorrect 
                    ? 'bg-[#EBFDF5]/95 dark:bg-[#062419]/95 border-emerald-500/40 shadow-emerald-500/10' 
                    : 'bg-[#FDF2F2]/95 dark:bg-[#2A0E0E]/95 border-red-500/40 shadow-red-500/10'
                }`}
              >
                {/* Glowing ambient background lights */}
                <div className={`absolute -top-12 -left-12 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-20 ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div className={`absolute -bottom-12 -right-12 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-20 ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`} />

                <div className="mb-4 relative z-10 flex justify-center">
                  {isCorrect ? (
                    <div className="text-emerald-600 dark:text-emerald-400 p-4 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full w-fit shadow-inner animate-bounce">
                      <CheckCircle2 size={40} />
                    </div>
                  ) : (
                    <div className="text-red-650 dark:text-red-400 p-4 bg-red-500/10 dark:bg-red-500/20 rounded-full w-fit shadow-inner animate-bounce">
                      <XCircle size={40} />
                    </div>
                  )}
                </div>

                <h3 className={`text-2xl font-serif-heading font-black uppercase tracking-wider relative z-10 ${
                  isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-650 dark:text-red-400'
                }`}>
                  {isCorrect ? 'Chúc mừng đồng chí!' : 'Chưa chính xác!'}
                </h3>
                <div className="w-16 h-0.5 my-4 bg-slate-200 dark:bg-slate-800 mx-auto relative z-10"></div>
                
                <span className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest mb-2 block relative z-10">Đáp án chính xác</span>
                <div className="text-base md:text-lg font-serif-heading font-black text-slate-800 dark:text-slate-100 px-4 py-3 bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm relative z-10 leading-snug">
                  {question.options[correctIndex]}
                </div>

                <div className="mt-6 font-serif-body text-[11px] text-slate-500 dark:text-slate-400 italic relative z-10 animate-pulse flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Chờ chỉ huy chuyển sang bản tin mới...</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 5. Màn hình chờ mặc định (Default Wait state)
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-[#FAF8F5] via-[#FDF9F2] to-[#FAF8F5] dark:from-[#0B0D17] dark:via-[#12162A] dark:to-[#0B0D17] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/5 via-amber-500/[0.02] to-red-500/[0.02] dark:from-slate-950 dark:via-red-950/10 dark:to-slate-950 pointer-events-none z-0" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 rounded-3xl backdrop-blur-2xl bg-white/40 dark:bg-slate-950/40 max-w-sm w-full relative z-10 mx-4 border border-slate-200/50 dark:border-slate-800/40 shadow-2xl"
      >
        <Loader2 className="w-8 h-8 text-red-650 dark:text-red-400 animate-spin mx-auto mb-4" />
        <div className="text-xl font-serif-heading font-black text-slate-800 dark:text-slate-200 mb-2.5 uppercase tracking-wider">Đang chờ bản tin...</div>
        <p className="text-xs font-serif-body text-slate-500 dark:text-slate-400 italic">Máy chủ đang thiết lập câu hỏi tiếp theo.</p>
        {error && (
          <div className="mt-4 p-3 text-xs font-bold text-red-650 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center justify-center gap-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}
      </motion.div>
    </div>
  );
}