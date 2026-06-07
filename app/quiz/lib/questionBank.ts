import { QuizQuestion } from '@/lib/quizTypes';
import { PDF_QUESTION_BANK } from '@/lib/pdfQuestionBank';
import { Question } from '../types';

const DEFAULT_TIME_LIMIT_SECONDS = 15;

export const questionBank: QuizQuestion[] = PDF_QUESTION_BANK.map((item) => ({
  question: item.question,
  options: [...item.options],
  correctIndex: item.correctIndex,
}));

export const QUESTIONS: Question[] = PDF_QUESTION_BANK.map((item, idx) => ({
  id: item.id || `q${idx + 1}`,
  text: item.question,
  options: [...item.options],
  correctAnswerIndex: item.correctIndex,
  timeLimit: DEFAULT_TIME_LIMIT_SECONDS,
}));

export const SHAPES = ['triangle', 'diamond', 'circle', 'square'];
export const COLORS = ['bg-brand-red', 'bg-brand-blue', 'bg-brand-yellow', 'bg-brand-green'];
