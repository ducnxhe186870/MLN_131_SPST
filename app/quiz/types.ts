export enum GamePhase {
  LOBBY = 'LOBBY',
  COUNTDOWN = 'COUNTDOWN',
  QUESTION = 'QUESTION',
  RESULT = 'RESULT',
  LEADERBOARD = 'LEADERBOARD',
  GAME_OVER = 'GAME_OVER'
}

export interface Question {
  id: string;
  text: string;
  image?: string; // URL to image (e.g., /public/1930-1931.jpg)
  options: string[];
  correctAnswerIndex: number;
  timeLimit: number; // seconds
}

export interface Player {
  id: string;
  name: string;
  score: number;
  streak: number;
  lastAnswerIndex: number | null; // null if not answered
  lastAnswerTime: number; // Time taken to answer
}

export interface GameState {
  pin: string;
  phase: GamePhase;
  players: Player[];
  currentQuestionIndex: number;
  timeLeft: number;
  aiExplanation: string | null;
  isAiLoading: boolean;
}