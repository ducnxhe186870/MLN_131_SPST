'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { clientDb } from '@/lib/firebaseClient';
import { doc, onSnapshot } from 'firebase/firestore';
import type { QuizQuestion } from '@/lib/quizTypes';
import {
  PDF_QUESTION_BANK,
  createQuestionSessionSeed,
  sampleQuestionsDeterministic,
} from '@/lib/pdfQuestionBank';
import {
  ShieldCheck,
  Award,
  Timer,
  Users,
  Play,
  RotateCw,
  Clock,
  Sparkles,
  Trophy,
  AlertCircle,
  TrendingUp,
  UserCheck,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestionEvent {
  question: {
    index: number;
    total: number;
    prompt: string;
    options: string[];
    correctIndex?: number;
    deadline?: number;
    durationMs?: number;
  };
}

interface LeaderboardEvent {
  leaderboard: Array<{ id: string; name: string; score: number }>;
  answeredCount: number;
  playerCount: number;
}

function createRoomQuizPayload() {
  const seed = createQuestionSessionSeed('quiz-room');
  return sampleQuestionsDeterministic(PDF_QUESTION_BANK, 10, seed).map<QuizQuestion>((item) => ({
    question: item.question,
    options: [...item.options],
    correctIndex: item.correctIndex,
  }));
}

export default function HostView() {
  const [loading, setLoading] = useState(true);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [hostSecret, setHostSecret] = useState<string | null>(null);
  const [playerCount, setPlayerCount] = useState(0);
  const [players, setPlayers] = useState<string[]>([]);
  const [question, setQuestion] = useState<QuestionEvent['question'] | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEvent['leaderboard']>([]);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [status, setStatus] = useState<'lobby' | 'in-progress' | 'finished'>('lobby');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showingResult, setShowingResult] = useState(false);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const resultTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resultTriggeredRef = useRef(false);
  const rehydrateAttemptedRef = useRef(0);
  const lastQuestionIndexRef = useRef<number>(-1);

  const readJsonSafe = useCallback(async (res: Response) => {
    const text = await res.text();
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { __raw: text } as any;
    }
    try {
      return JSON.parse(text);
    } catch {
      return { __raw: text } as any;
    }
  }, []);

  const getErrorMessage = useCallback((data: any, fallback: string) => {
    if (typeof data?.error === 'string' && data.error.trim()) return data.error;
    if (typeof data?.message === 'string' && data.message.trim()) return data.message;
    if (typeof data?.__raw === 'string' && data.__raw.trim()) {
      const snippet = data.__raw.replace(/<[^>]*>/g, '').trim();
      return snippet ? snippet.slice(0, 200) : fallback;
    }
    return fallback;
  }, []);

  const createRoom = useCallback(async () => {
    setError(null);
    setLoading(true);
    setPlayers([]);
    setPlayerCount(0);
    setQuestion(null);
    setLeaderboard([]);
    setAnsweredCount(0);
    setStatus('lobby');
    setTimeLeft(null);
    setShowingResult(false);
    setCorrectIndex(null);
    resultTriggeredRef.current = false;
    rehydrateAttemptedRef.current = 0;
    if (resultTimerRef.current) {
      clearTimeout(resultTimerRef.current);
      resultTimerRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    try {
      const quiz = createRoomQuizPayload();
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz }),
      });
      const data = await readJsonSafe(res);
      if (!res.ok) throw new Error(getErrorMessage(data, 'Không tạo được phòng'));
      setRoomCode(data.roomCode);
      setHostSecret(data.hostSecret);
      localStorage.setItem('quiz-host-room', JSON.stringify({ roomCode: data.roomCode, hostSecret: data.hostSecret }));
      setLoading(false);
    } catch (err: any) {
      setError(err?.message || 'Không tạo được phòng');
      setLoading(false);
    }
  }, [readJsonSafe, getErrorMessage]);

  const rehydrateRoom = useCallback(
    async (code: string, secret: string) => {
      try {
        const res = await fetch('/api/rooms/rehydrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomCode: code, hostSecret: secret }),
        });
        if (!res.ok) return false;
        localStorage.setItem('quiz-host-room', JSON.stringify({ roomCode: code, hostSecret: secret }));
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const fetchRoomState = useCallback(async (code: string) => {
    const res = await fetch(`/api/rooms/${code}/state`);
    const data = await readJsonSafe(res);
    if (res.ok) {
      setStatus(data.status ?? 'lobby');
      setPlayerCount(data.playerCount ?? 0);
      setPlayers(Array.isArray(data.players) ? data.players : []);
      if (Array.isArray(data.leaderboard)) {
        setLeaderboard(data.leaderboard);
      }
      if (typeof data.answeredCount === 'number') {
        setAnsweredCount(data.answeredCount);
      }
    }
    return { ok: res.ok, status: res.status };
  }, [readJsonSafe]);

  useEffect(() => {
    const restoreRoom = async () => {
      try {
        const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('quiz-host-room') : null;
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.roomCode && parsed?.hostSecret) {
            const state = await fetchRoomState(parsed.roomCode);
            if (state.ok) {
              setRoomCode(parsed.roomCode);
              setHostSecret(parsed.hostSecret);
              setLoading(false);
              return;
            }
            if (state.status === 404) {
              const rehydrated = await rehydrateRoom(parsed.roomCode, parsed.hostSecret);
              if (rehydrated) {
                setRoomCode(parsed.roomCode);
                setHostSecret(parsed.hostSecret);
                setError(null);
                const refreshed = await fetchRoomState(parsed.roomCode);
                if (refreshed.ok) {
                  setLoading(false);
                  return;
                }
              }
              localStorage.removeItem('quiz-host-room');
            }
          }
        }
      } catch (err) {
        console.warn('Restore room failed', err);
      }

      createRoom();
    };

    restoreRoom();
  }, [createRoom, fetchRoomState, rehydrateRoom]);

  useEffect(() => {
    if (!roomCode) return;

    const roomRef = doc(clientDb, 'rooms', roomCode);
    const unsubscribe = onSnapshot(roomRef, (snap) => {
      if (!snap.exists()) {
        setError('Phòng đã mất. Vui lòng bấm "Làm mới mã" để tạo phòng mới.');
        return;
      }

      const room = snap.data() as any;
      setStatus(room.status ?? 'lobby');
      const playersMap = room.players || {};
      setPlayerCount(Object.keys(playersMap).length);
      setPlayers(Object.values(playersMap).map((p: any) => p.name));
      setLeaderboard(
        Object.entries(room.leaderboard || {})
          .map(([id, entry]: any) => ({ id, ...entry }))
          .sort((a: any, b: any) => b.score - a.score || (a.lastAnswerAt || 0) - (b.lastAnswerAt || 0))
      );
      setAnsweredCount(Array.isArray(room.answeredThisRound) ? room.answeredThisRound.length : 0);

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
            correctIndex: q.correctIndex,
            deadline: room.questionDeadline ?? undefined,
            durationMs: room.questionDurationMs ?? undefined,
          });
          setShowingResult(false);
          setCorrectIndex(null);
          resultTriggeredRef.current = false;
          if (resultTimerRef.current) {
            clearTimeout(resultTimerRef.current);
            resultTimerRef.current = null;
          }
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
      }
    });

    return () => {
      unsubscribe();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [roomCode]);

  const startNextQuestion = async () => {
    if (!roomCode || !hostSecret) return;
    setError(null);
    setShowingResult(false);
    setCorrectIndex(null);
    const sendRequest = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomCode}/next-question`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hostSecret, code: roomCode }),
        });
        const payload = await readJsonSafe(response);
        return { response, payload };
      } catch (err: any) {
        return { response: null, payload: { error: err?.message || 'Network error' } } as any;
      }
    };

    let { response: res, payload: data } = await sendRequest();

    if (!res) {
      setError(getErrorMessage(data, 'Không gửi được câu hỏi (mạng)'));
      return;
    }
    if (!res.ok && res.status === 404) {
      const rehydrated = await rehydrateRoom(roomCode, hostSecret);
      if (rehydrated) {
        const retry = await sendRequest();
        res = retry.response;
        data = retry.payload;
      }
    }

    if (!res.ok) {
      setError(getErrorMessage(data, 'Không gửi được câu hỏi'));
      return;
    }

    if (data.done) {
      setStatus('finished');
      setQuestion(null);
      setLeaderboard(data.leaderboard || []);
      setTimeLeft(null);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (data?.question) {
      setStatus('in-progress');
      setQuestion(data.question);
      setAnsweredCount(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (data.question.deadline && data.question.durationMs) {
        const tick = () => {
          const msLeft = Math.max(0, data.question.deadline - Date.now());
          setTimeLeft(Math.ceil(msLeft / 1000));
        };
        tick();
        timerRef.current = setInterval(tick, 500);
      } else {
        setTimeLeft(null);
      }
    }
  };

  useEffect(() => {
    if (status !== 'in-progress' || timeLeft === null) return;
    if (timeLeft <= 0 && question) {
      const correct = typeof question.correctIndex === 'number' ? question.correctIndex : null;
      setCorrectIndex(correct);
      setShowingResult(true);
      if (!resultTriggeredRef.current) {
        resultTriggeredRef.current = true;
        resultTimerRef.current = setTimeout(() => {
          resultTimerRef.current = null;
          startNextQuestion();
        }, 3500); // 3.5s review
      }
      return () => {
        if (resultTimerRef.current) {
          clearTimeout(resultTimerRef.current);
          resultTimerRef.current = null;
        }
      };
    }
  }, [timeLeft, status, question]);

  const endQuestionEarly = async () => {
    if (!roomCode || !hostSecret) return;
    setError(null);
    let success = false;
    try {
      const res = await fetch(`/api/rooms/${roomCode}/end-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostSecret, code: roomCode }),
      });
      const data = await readJsonSafe(res);
      if (!res.ok) {
        setError(getErrorMessage(data, 'Không kết thúc được câu hỏi'));
        return;
      }
      success = true;
    } catch (err: any) {
      setError(err?.message || 'Không kết thúc được câu hỏi (mạng)');
      return;
    }
    if (success) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimeLeft(0);
      if (question) {
        const correct = typeof question.correctIndex === 'number' ? question.correctIndex : null;
        setCorrectIndex(correct);
      }
      setShowingResult(true);
      if (!resultTriggeredRef.current) {
        resultTriggeredRef.current = true;
        resultTimerRef.current = setTimeout(() => {
          resultTimerRef.current = null;
          startNextQuestion();
        }, 3500);
      }
    }
  };

  // 1. Chờ khởi tạo
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-lg font-serif-heading gap-3 bg-gradient-to-br from-[#FAF8F5] via-[#FDF9F2] to-[#FAF8F5] dark:from-[#0B0D17] dark:via-[#12162A] dark:to-[#0B0D17]">
        <Loader2 className="w-8 h-8 text-red-650 animate-spin" />
        <span className="text-sm font-sans font-bold text-slate-500 dark:text-slate-400">Đang chuẩn bị phiên hỏi đáp trực tuyến...</span>
      </div>
    );
  }

  // 2. Báo lỗi
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6 bg-gradient-to-br from-[#FAF8F5] via-[#FDF9F2] to-[#FAF8F5] dark:from-[#0B0D17] dark:via-[#12162A] dark:to-[#0B0D17]">
        <div className="max-w-md p-6 border border-red-500/20 bg-red-500/5 text-red-650 dark:text-red-400 rounded-3xl shadow-sm text-center flex flex-col items-center gap-3">
          <AlertCircle size={32} />
          <p className="font-serif-heading font-black text-base leading-relaxed">{error}</p>
        </div>
        <button
          onClick={createRoom}
          className="px-6 py-3.5 font-sans font-bold text-xs text-white bg-gradient-to-r from-red-650 to-red-500 rounded-xl hover:-translate-y-0.5 shadow-md transition-all uppercase tracking-wider flex items-center gap-2 cursor-pointer"
        >
          <RotateCw size={13} /> Làm mới tín hiệu
        </button>
      </div>
    );
  }

  if (!roomCode) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg font-serif-heading bg-gradient-to-br from-[#FAF8F5] via-[#FDF9F2] to-[#FAF8F5] dark:from-[#0B0D17] dark:via-[#12162A] dark:to-[#0B0D17]">
        Không tìm thấy phòng hoạt động.
      </div>
    );
  }

  // 3. Màn hình bế mạc (Finished / Podium)
  if (status === 'finished') {
    const top3 = leaderboard.slice(0, 3);
    
    // Fill placeholders if less than 3 players join
    const podiumList = [
      top3[1] || { id: 'placeholder-2', name: 'Á Khoa', score: 0, isPlaceholder: true },
      top3[0] || { id: 'placeholder-1', name: 'Trạng Nguyên', score: 0, isPlaceholder: true },
      top3[2] || { id: 'placeholder-3', name: 'Bảng Nhãn', score: 0, isPlaceholder: true }
    ];

    return (
      <div className="flex flex-col items-center justify-start min-h-screen p-6 relative overflow-hidden pt-28 pb-16 bg-gradient-to-br from-[#FAF8F5] via-[#FDF9F2] to-[#FAF8F5] dark:from-[#0B0D17] dark:via-[#12162A] dark:to-[#0B0D17]">
        {/* Glow Spheres & Grid Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[35vw] h-[35vw] bg-red-650/5 dark:bg-red-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[20%] right-[10%] w-[35vw] h-[35vw] bg-amber-500/5 dark:bg-amber-550/5 rounded-full blur-[120px]" />
          <div 
            className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" 
            style={{ 
              backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
              backgroundSize: '30px 30px' 
            }}
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center relative z-10"
        >
          <div className="p-3.5 bg-red-500/10 text-red-650 dark:text-red-400 rounded-2xl w-fit mx-auto mb-4 border border-red-500/20">
            <Trophy size={36} className="animate-bounce" />
          </div>
          <h2 className="text-4xl md:text-5xl font-serif-heading font-black text-red-650 dark:text-red-400 uppercase tracking-wider">Bảng Vàng Danh Dự</h2>
          <div className="w-24 h-0.5 bg-slate-200 dark:bg-slate-800 mx-auto my-3"></div>
          <p className="text-xs font-serif-body text-slate-500 dark:text-slate-400 italic">Tuyên dương các sĩ tử đạt thành tích xuất sắc nhất trong khoa thi</p>
        </motion.div>

        {/* 3D Glassmorphic Podium Display */}
        <div className="flex items-end justify-center gap-4 md:gap-8 mb-12 relative z-10 w-full max-w-3xl px-4 mt-6">
          {podiumList.map((player, idx) => {
            // idx = 0: Hạng 2, idx = 1: Hạng 1, idx = 2: Hạng 3
            const isFirst = idx === 1;
            const isSecond = idx === 0;
            const isThird = idx === 2;
            const isPlaceHolder = 'isPlaceholder' in player;

            let podiumHeight = "h-32 md:h-36";
            let colColor = "bg-slate-200/40 dark:bg-slate-900/30 border-slate-300/40 dark:border-slate-800/30";
            let textColor = "text-slate-850 dark:text-slate-200";
            let glowStyle = "";
            let medalTitle = "Bảng Nhãn";
            let badgeStyle = "bg-orange-550/10 text-orange-650 border-orange-500/20";
            let avatarRing = "border-orange-500/30";
            let delayTime = 0.2;

            if (isFirst) {
              podiumHeight = "h-48 md:h-56";
              colColor = "bg-amber-500/5 dark:bg-amber-950/10 border-amber-500/40 dark:border-amber-500/20";
              textColor = "text-amber-600 dark:text-amber-400 font-bold";
              glowStyle = "shadow-[0_0_50px_rgba(245,158,11,0.2)] dark:shadow-[0_0_50px_rgba(245,158,11,0.15)]";
              medalTitle = "Trạng Nguyên";
              badgeStyle = "bg-amber-550/20 text-amber-600 border-amber-500/30";
              avatarRing = "border-amber-500 ring-4 ring-amber-500/20";
              delayTime = 0.1;
            } else if (isSecond) {
              podiumHeight = "h-36 md:h-44";
              colColor = "bg-slate-200/50 dark:bg-slate-900/40 border-slate-300/50 dark:border-slate-800/40";
              textColor = "text-slate-700 dark:text-slate-350";
              glowStyle = "shadow-[0_0_30px_rgba(148,163,184,0.15)] dark:shadow-[0_0_30px_rgba(148,163,184,0.1)]";
              medalTitle = "Á Khoa";
              badgeStyle = "bg-slate-300/20 text-slate-500 border-slate-300/30";
              avatarRing = "border-slate-400/40 ring-4 ring-slate-400/10";
              delayTime = 0.3;
            }

            return (
              <motion.div 
                key={player.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: delayTime, type: 'spring', stiffness: 100 }}
                className="flex flex-col items-center flex-1"
              >
                {/* Crown / Avatar representing spot */}
                <div className="relative mb-3 flex flex-col items-center">
                  {isFirst && !isPlaceHolder && (
                    <motion.span 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                      className="absolute -top-9 text-4xl z-10"
                    >
                      👑
                    </motion.span>
                  )}
                  <div className={`flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full text-base font-serif-heading font-black bg-white dark:bg-slate-950 border-2 shadow-md ${avatarRing}`}>
                    {isPlaceHolder ? (
                      <span className="text-slate-300 dark:text-slate-700 text-xs">...</span>
                    ) : (
                      player.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                </div>

                {/* Podium Column Box */}
                <div className={`w-full flex flex-col items-center justify-between py-5 border border-b-0 rounded-t-2xl backdrop-blur-md ${podiumHeight} ${colColor} ${glowStyle}`}>
                  <div className="text-center w-full px-2">
                    <span className={`inline-block text-[9px] font-sans font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${badgeStyle} mb-2`}>
                      {medalTitle}
                    </span>
                    <h4 className={`text-xs md:text-sm font-serif-heading font-black truncate w-full px-1 ${textColor}`}>
                      {isPlaceHolder ? 'Đang chờ' : player.name}
                    </h4>
                  </div>
                  <div className="text-center">
                    <span className="font-mono font-black text-red-650 dark:text-red-400 text-base md:text-xl">
                      {isPlaceHolder ? '0' : player.score} đ
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Full Leaderboard Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-lg p-6 rounded-3xl backdrop-blur-2xl bg-white/40 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 shadow-2xl relative z-10"
        >
          <div className="mb-4 text-sm font-serif-heading font-black text-slate-800 dark:text-white border-b border-slate-205/20 dark:border-slate-800/20 pb-2.5 uppercase tracking-wider">
            Danh Sách Sĩ Tử Dự Thi ({leaderboard.length})
          </div>
          <div className="space-y-2 overflow-y-auto max-h-56 pr-2 custom-scrollbar">
            {leaderboard.length === 0 ? (
              <div className="text-slate-400 dark:text-slate-600 font-serif-body italic text-center text-xs mt-6">Chưa có sĩ tử nào kết nối...</div>
            ) : (
              leaderboard.map((entry, idx) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-white/30 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center text-[10px] font-sans font-bold text-slate-500 dark:text-slate-400 rounded-md bg-slate-500/10 border border-slate-200/10 dark:border-slate-850/10">{idx + 1}</span>
                    <span className="font-serif-heading font-bold text-slate-850 dark:text-slate-200 text-sm">{entry.name}</span>
                  </div>
                  <span className="font-mono font-black text-red-650 dark:text-red-400 text-sm">{entry.score} đ</span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <button
          onClick={createRoom}
          className="px-8 py-3.5 mt-8 font-sans font-black text-xs text-white bg-gradient-to-r from-red-650 to-amber-600 hover:from-red-600 hover:to-amber-500 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-md shadow-red-600/10 relative z-10"
        >
          <RotateCw size={12} fill="white" /> Mở khóa thi mới
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col min-h-screen relative pt-20 bg-gradient-to-br from-[#F8F6F0] via-[#FAF6ED] to-[#F5F2E9] dark:from-[#090B14] dark:via-[#101426] dark:to-[#080A11] transition-colors duration-500">
      {/* Dynamic Background Mesh & Grid Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] bg-red-650/8 dark:bg-red-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '9s' }} />
        <div className="absolute bottom-[10%] right-[25%] w-[45vw] h-[45vw] bg-amber-500/6 dark:bg-amber-500/5 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '14s' }} />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[35vw] h-[35vw] bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04] rounded-full blur-[100px]" />
        
        {/* Indochine grid coordinate template */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]" 
          style={{ 
            backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '50px 50px' 
          }}
        />
      </div>
      
      {/* Header Điều khiển (Trạm Chỉ Huy) */}
      <header 
        className="flex flex-col md:flex-row items-center justify-between px-6 py-4 relative z-10 gap-4 border-b border-slate-200/60 dark:border-slate-800/50 backdrop-blur-xl bg-white/75 dark:bg-slate-950/75 shadow-md transition-colors"
      >
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto text-center md:text-left">
          <div className="bg-slate-500/5 border border-slate-200/50 dark:border-slate-800/40 px-5 py-2.5 rounded-2xl shadow-inner flex flex-col items-center justify-center min-w-[150px] relative overflow-hidden group">
            {/* Soft decorative glow */}
            <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-555 font-bold mb-0.5 relative z-10">Mã PIN phòng thi</span>
            <span className="text-3.5xl font-mono font-black tracking-[0.25em] text-red-650 dark:text-red-500 pl-2 leading-none relative z-10 shadow-glow">{roomCode}</span>
          </div>
          <div className="text-xs font-serif-body italic text-slate-500 dark:text-slate-400 max-w-[200px] leading-relaxed">
            Sĩ tử kết nối bằng cách nhập mã PIN này trên thiết bị di động cá nhân.
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-3 w-full md:w-auto">
          <div className="px-4 py-2 text-xs font-sans font-bold text-slate-700 dark:text-slate-300 bg-slate-500/5 border border-slate-200/10 dark:border-slate-800/10 rounded-xl flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Kết nối: {playerCount} sĩ tử
          </div>
          
          <button
            onClick={createRoom}
            disabled={loading}
            className="px-4 py-2.5 text-xs font-sans font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850/50 cursor-pointer disabled:opacity-50 shadow-md"
          >
            Làm mới mã
          </button>
          
          {status === 'in-progress' && timeLeft !== null && timeLeft > 0 && (
            <button
              onClick={endQuestionEarly}
              className="px-4 py-2.5 text-xs font-sans font-bold text-white bg-red-650 hover:bg-red-600 border-2 border-red-750 hover:border-red-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              Cắt thời gian
            </button>
          )}
          
          <button
            onClick={startNextQuestion}
            disabled={!playerCount || (status === 'in-progress' && timeLeft !== null && timeLeft > 0)}
            className="px-5 py-2.5 text-xs font-sans font-black text-white bg-gradient-to-r from-emerald-650 to-emerald-500 hover:from-emerald-600 hover:to-emerald-500 rounded-xl border border-transparent shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:border-slate-450 dark:disabled:border-slate-750 disabled:text-slate-550 dark:disabled:text-slate-500 disabled:shadow-none cursor-pointer uppercase tracking-wider"
          >
            {status === 'in-progress' && timeLeft !== null && timeLeft > 0 ? 'Đang phát...' : 'Bắt Đầu / Tiếp tục'}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative z-10 items-stretch min-h-[calc(100vh-160px)]">
        {question ? (
          <main className="flex-1 p-4 md:p-8 flex flex-col overflow-y-auto w-full">
            {/* Question Card */}
            <div className="p-6 md:p-8 mb-6 rounded-3xl backdrop-blur-2xl bg-white/40 dark:bg-slate-950/45 border border-slate-200/50 dark:border-slate-800/40 relative shadow-md">
              <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-red-500 opacity-40" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-red-500 opacity-40" />

              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/20 dark:border-slate-800/20">
                <span className="px-2.5 py-1 bg-red-500/10 text-red-650 dark:text-red-400 text-[10px] font-sans font-bold uppercase tracking-widest rounded-lg">
                  Câu hỏi {question.index + 1} / {question.total}
                </span>
                {timeLeft !== null && !showingResult && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-serif-heading italic">Thời gian còn lại:</span>
                    <span className="text-2xl font-mono font-black text-red-650 dark:text-red-400 px-3 py-0.5 border border-red-500/20 bg-red-500/5 rounded-lg shrink-0">
                      {timeLeft}s
                    </span>
                  </div>
                )}
              </div>
              
              <h1 className="text-xl md:text-3xl font-serif-heading font-black text-slate-900 dark:text-white leading-snug">
                {question.prompt}
              </h1>
              
              {showingResult && correctIndex !== null && (
                <div className="mt-5 p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl inline-block text-emerald-600 dark:text-emerald-400 text-xs md:text-sm font-serif-heading font-bold shadow-sm">
                  ✓ Đáp án chính xác: <strong className="underline decoration-2 underline-offset-4">{question.options[correctIndex]}</strong>
                </div>
              )}
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mt-auto">
              {question.options.map((opt, idx) => {
                const colors = ['bg-[#DA251D]', 'bg-[#1a5276]', 'bg-[#e67e22]', 'bg-[#4A5D23]'];
                let bgColor = colors[idx % colors.length];
                let opacity = "";
                let borderColor = "border-slate-200/20 dark:border-slate-850/20";
                
                if (showingResult) {
                  if (idx === correctIndex) {
                    bgColor = "bg-emerald-600";
                    borderColor = "border-emerald-700";
                  } else {
                    bgColor = "bg-slate-100 dark:bg-slate-900";
                    opacity = "opacity-50";
                    borderColor = "border-slate-300 dark:border-slate-800";
                  }
                }
                
                return (
                  <div
                    key={idx}
                    className={`${bgColor} ${opacity} ${borderColor} border-2 rounded-2xl p-4 md:p-5 text-white shadow-md transition-all flex items-center min-h-[90px] ${showingResult && idx !== correctIndex ? 'text-slate-550 dark:text-slate-450' : ''}`}
                  >
                     <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-white/20 rounded-xl mr-4 text-lg font-black">
                       {idx === 0 ? 'A' : idx === 1 ? 'B' : idx === 2 ? 'C' : 'D'}
                     </div>
                     <span className="text-base md:text-lg font-serif-heading font-bold">
                       {opt}
                     </span>
                  </div>
                );
              })}
            </div>

            {/* Answer Submissions Stats */}
            <div className="mt-8 flex items-center justify-between p-4 rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 shadow-sm animate-fade-in">
              <div className="text-sm font-serif-heading font-bold text-slate-700 dark:text-slate-350">
                Đã thu bài: <span className="text-red-650 dark:text-red-400 font-black">{answeredCount} / {playerCount} Sĩ tử</span>
              </div>
              <div className="flex -space-x-1.5">
                {players.slice(0, 8).map((name, idx) => (
                  <div 
                    key={`${name}-${idx}`} 
                    className="flex items-center justify-center w-8 h-8 text-[10px] font-sans font-bold text-white bg-slate-500 border-2 border-white dark:border-slate-950 rounded-full shadow-sm"
                    style={{ zIndex: 10 - idx }} 
                    title={name}
                  >
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                ))}
                {players.length > 8 && (
                   <div className="flex items-center justify-center w-8 h-8 text-[9px] font-sans font-bold text-slate-800 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-950 rounded-full shadow-sm z-0">
                     +{players.length - 8}
                   </div>
                )}
              </div>
            </div>
          </main>
        ) : (
          /* Lobby Wait state (Redesigned Wide Double-Column Panel) */
          <main className="flex flex-col items-center justify-center flex-1 p-6 md:p-12 w-full max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full rounded-3xl backdrop-blur-2xl bg-white/60 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/50 shadow-2xl overflow-hidden p-6 md:p-8 flex flex-col md:flex-row gap-8 items-stretch relative"
            >
              {/* Indochine decorative corners */}
              <div className="absolute top-4 left-4 w-5 h-5 border-t border-l border-red-500/40 pointer-events-none" />
              <div className="absolute top-4 right-4 w-5 h-5 border-t border-r border-red-500/40 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-5 h-5 border-b border-l border-red-500/40 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-5 h-5 border-b border-r border-red-500/40 pointer-events-none" />

              {/* Left Column: Radar Console */}
              <div className="flex-1 md:max-w-[380px] flex flex-col justify-center items-center text-center p-4 border-b md:border-b-0 md:border-r border-slate-200/20 dark:border-slate-800/20">
                <div className="relative w-44 h-44 mb-6 flex items-center justify-center border border-red-500/20 rounded-full bg-slate-500/5 dark:bg-black/20 overflow-hidden shadow-inner">
                  {/* Radar lines background */}
                  <div className="absolute inset-2 border border-slate-500/5 rounded-full" />
                  <div className="absolute inset-8 border border-slate-500/5 rounded-full" />
                  <div className="absolute inset-16 border border-slate-500/5 rounded-full" />
                  <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-500/5" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-500/5" />

                  {/* Pulsing rings */}
                  <div className="radar-ring w-40 h-40" />
                  <div className="radar-ring w-40 h-40" />
                  <div className="radar-ring w-40 h-40" />

                  {/* Scan line */}
                  <div className="scan-line" />

                  {/* Center core */}
                  <div className="relative z-10 w-4 h-4 rounded-full bg-red-650 dark:bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-ping" />
                  <div className="absolute z-10 w-3.5 h-3.5 rounded-full bg-red-650 dark:bg-red-500" />
                </div>

                <span className="text-[10px] font-sans font-black text-red-650 dark:text-red-400 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/10 mb-2.5 animate-pulse">
                  📶 ĐANG PHÁT TÍN HIỆU PIN
                </span>
                
                <h3 className="text-xl font-serif-heading font-black text-slate-850 dark:text-white uppercase tracking-wider mb-2">PHÒNG CHỜ SĨ TỬ</h3>
                <p className="text-xs font-serif-body text-slate-500 dark:text-slate-400 italic leading-relaxed max-w-[280px]">
                  Khi các sĩ tử đã điểm danh đông đủ, bấm nút <strong className="text-emerald-600 dark:text-emerald-400">"Bắt Đầu"</strong> trên trạm điều khiển để phát câu hỏi đầu tiên.
                </p>
              </div>

              {/* Right Column: Joined Players registry */}
              <div className="flex-[1.4] flex flex-col justify-between p-4 min-h-[300px]">
                <div>
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200/10 dark:border-slate-800/10">
                    <h4 className="text-xs font-sans font-black uppercase tracking-widest text-slate-450 dark:text-slate-500 flex items-center gap-2">
                      <Users size={14} className="text-red-650 dark:text-red-400" /> Danh sách sĩ tử điểm danh
                    </h4>
                    <span className="text-xs font-mono font-black text-red-650 dark:text-red-400 bg-red-500/5 px-2.5 py-0.5 rounded-md border border-red-500/10">
                      {players.length} Đồng chí
                    </span>
                  </div>

                  {players.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-405 dark:text-slate-600">
                      <div className="p-4 bg-slate-500/5 rounded-full mb-3 text-slate-300 dark:text-slate-700 animate-pulse">
                        <Users size={32} />
                      </div>
                      <p className="text-xs font-serif-body italic max-w-xs leading-relaxed">
                        Chưa nhận được tín hiệu kết nối từ sĩ tử nào... Hãy hướng dẫn sĩ tử nhập mã PIN trên điện thoại của họ để điểm danh vào phòng thi.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[260px] overflow-y-auto pr-1.5 custom-scrollbar">
                      {players.map((name, idx) => (
                        <motion.div 
                          key={`${name}-${idx}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="px-3 py-2 text-xs font-serif-heading font-black text-slate-800 dark:text-slate-350 bg-white/40 hover:bg-white/60 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-xl flex items-center gap-2 shadow-sm truncate group cursor-default"
                        >
                          <UserCheck size={12} className="text-emerald-500 group-hover:scale-110 transition-transform shrink-0" />
                          <span className="truncate w-full">{name}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footnote warning */}
                <div className="mt-6 pt-3 border-t border-slate-200/10 dark:border-slate-800/10 flex items-center gap-2 text-[10px] font-serif-body text-slate-500 dark:text-slate-400 italic">
                  <span>💡</span>
                  <span>Nhấn nút <strong>"Bắt Đầu / Tiếp Tục"</strong> trên trạm điều khiển để bắt đầu khóa thi ngay khi sĩ tử đã vào đủ.</span>
                </div>
              </div>

            </motion.div>
          </main>
        )}

        {/* Sidebar Leaderboard */}
        <aside 
          className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-slate-200/50 dark:border-slate-800/40 flex flex-col h-60 lg:h-auto shrink-0 backdrop-blur-xl bg-white/60 dark:bg-slate-950/60 transition-colors shadow-inner"
        >
          <div className="p-4 bg-slate-500/5 border-b border-slate-200/40 dark:border-slate-800/40">
            <h3 className="text-xs font-serif-heading font-black uppercase tracking-wider text-center flex items-center justify-center gap-2 text-slate-800 dark:text-slate-200 font-sans">
              <TrendingUp size={14} className="text-red-650 dark:text-red-400" /> Bảng Phong Thần
            </h3>
          </div>
          
          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar space-y-2">
            {leaderboard.length === 0 ? (
              <div className="text-slate-400 dark:text-slate-600 font-serif-body italic text-center text-xs mt-4">Phiên thi chưa bắt đầu.</div>
            ) : (
              leaderboard.map((entry, idx) => (
                <div 
                  key={entry.id} 
                  className="flex items-center justify-between p-3 bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/35 rounded-xl transition-all shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center justify-center w-6 h-6 font-sans font-bold text-[9px] text-center border rounded-md ${
                      idx === 0 
                        ? 'bg-amber-500/20 text-amber-600 border-amber-500/30' 
                        : idx === 1 
                        ? 'bg-slate-300/30 text-slate-500 border-slate-350/40' 
                        : idx === 2 
                        ? 'bg-orange-550/10 text-orange-655 border-orange-500/20' 
                        : 'bg-slate-500/10 text-slate-500 border-transparent'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="font-serif-heading font-bold text-slate-800 dark:text-slate-200 truncate max-w-[100px] text-xs">{entry.name}</span>
                  </div>
                  <span className="text-xs font-mono font-black text-red-650 dark:text-red-400">{entry.score} đ</span>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
