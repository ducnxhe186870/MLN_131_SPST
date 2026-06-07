export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface GeneratedQuizPayload {
  topic?: string;
  numQuestions?: number;
}

export type GameStatus = 'lobby' | 'in-progress' | 'finished';

export interface LeaderboardEntry {
  name: string;
  score: number;
  lastAnswerCorrect?: boolean;
  lastAnswerAt?: number;
}

export interface RoomState {
  roomCode: string;
  hostSecret: string;
  quiz: QuizQuestion[];
  currentQuestionIndex: number;
  status: GameStatus;
  leaderboard: Record<string, LeaderboardEntry>;
  players: Record<string, { name: string; joinedAt: number }>;
  answeredThisRound: Set<string>;
  questionDeadline?: number; // epoch ms when current question closes
  questionDurationMs?: number; // duration of current question
}
