import { create } from 'zustand';
import { GamePhase, GameState, Player, Question } from '../types';
import { QUESTIONS } from './questionBank';

interface GameStore extends GameState {
  createGame: () => void;
  joinGame: (playerName: string) => string;
  startGame: () => void;
  nextQuestion: () => void;
  endQuestion: () => void;
  submitAnswer: (playerId: string, answerIndex: number, timeRemaining: number) => void;
  tickTimer: () => void;
  setAiExplanation: (text: string) => void;
  setAiLoading: (loading: boolean) => void;
  resetGame: () => void;
}

const calculateScore = (timeRemaining: number, totalTime: number) => {
  const percentage = timeRemaining / totalTime;
  return Math.round(1000 * percentage);
};

export const useGameStore = create<GameStore>((set, get) => ({
  pin: '123456',
  phase: GamePhase.LOBBY,
  players: [],
  currentQuestionIndex: 0,
  timeLeft: 0,
  aiExplanation: null,
  isAiLoading: false,

  createGame: () => {
    set({
      phase: GamePhase.LOBBY,
      players: [],
      currentQuestionIndex: 0,
      timeLeft: 0,
      aiExplanation: null
    });
  },

  joinGame: (playerName: string) => {
    const newPlayer: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: playerName,
      score: 0,
      streak: 0,
      lastAnswerIndex: null,
      lastAnswerTime: 0
    };
    set((state) => ({ players: [...state.players, newPlayer] }));
    return newPlayer.id;
  },

  startGame: () => {
    set({
      phase: GamePhase.COUNTDOWN,
      timeLeft: 3,
      currentQuestionIndex: 0
    });
  },

  nextQuestion: () => {
    const { phase, currentQuestionIndex } = get();

    if (phase === GamePhase.LOBBY) {
      set({
        phase: GamePhase.COUNTDOWN,
        timeLeft: 3,
        currentQuestionIndex: 0
      });
      return;
    }

    if (phase === GamePhase.COUNTDOWN) {
      const q = QUESTIONS[currentQuestionIndex];
      set({
        phase: GamePhase.QUESTION,
        timeLeft: q.timeLimit,
        aiExplanation: null,
        players: get().players.map(p => ({ ...p, lastAnswerIndex: null }))
      });
    } else if (phase === GamePhase.QUESTION) {
      set({ phase: GamePhase.RESULT });
    } else if (phase === GamePhase.RESULT) {
      set({ phase: GamePhase.LEADERBOARD });
    } else if (phase === GamePhase.LEADERBOARD) {
      if (currentQuestionIndex < QUESTIONS.length - 1) {
        set({
          phase: GamePhase.COUNTDOWN,
          timeLeft: 3,
          currentQuestionIndex: currentQuestionIndex + 1
        });
      } else {
        set({ phase: GamePhase.GAME_OVER });
      }
    }
  },

  endQuestion: () => {
    const { phase } = get();
    if (phase === GamePhase.QUESTION) {
      set({ phase: GamePhase.RESULT, timeLeft: 0 });
    }
  },

  submitAnswer: (playerId: string, answerIndex: number, timeRemaining: number) => {
    const { phase, currentQuestionIndex } = get();
    if (phase !== GamePhase.QUESTION) return;

    const currentQ = QUESTIONS[currentQuestionIndex];
    const isCorrect = currentQ.correctAnswerIndex === answerIndex;

    set((state) => ({
      players: state.players.map((p) => {
        if (p.id !== playerId) return p;
        
        let newScore = p.score;
        let newStreak = p.streak;

        if (isCorrect) {
          newScore += calculateScore(timeRemaining, currentQ.timeLimit);
          newStreak += 1;
        } else {
          newStreak = 0;
        }

        return {
          ...p,
          lastAnswerIndex: answerIndex,
          score: newScore,
          streak: newStreak
        };
      })
    }));
  },

  tickTimer: () => {
    set((state) => {
      if (state.timeLeft > 0) {
        return { timeLeft: state.timeLeft - 1 };
      }
      if (state.phase === GamePhase.QUESTION) {
         return { timeLeft: 0, phase: GamePhase.RESULT };
      }
      if (state.phase === GamePhase.COUNTDOWN) {
          return { timeLeft: 0 };
      }
      return { timeLeft: 0 };
    });
  },

  setAiExplanation: (text: string) => set({ aiExplanation: text }),
  setAiLoading: (loading: boolean) => set({ isAiLoading: loading }),
  
  resetGame: () => {
    set({
      phase: GamePhase.LOBBY,
      players: [],
      currentQuestionIndex: 0,
      timeLeft: 0
    });
  }
}));