import { PDF_QUESTION_BANK, type SharedQuizQuestion } from '@/lib/pdfQuestionBank';

export type QuizItem = SharedQuizQuestion;

export const quizData: QuizItem[] = PDF_QUESTION_BANK.map((item) => ({
  id: item.id,
  question: item.question,
  options: [...item.options],
  correctIndex: item.correctIndex,
}));
