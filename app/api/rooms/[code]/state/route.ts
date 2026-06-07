import { NextResponse } from 'next/server';
import { adminDb, adminInitError } from '@/lib/firebaseAdmin';
import type { LeaderboardEntry } from '@/lib/quizTypes';

type ParamsPromise = { params: { code: string } } | { params: Promise<{ code: string }> };

export async function GET(_: Request, ctx: ParamsPromise) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: adminInitError ? `Firebase admin init failed: ${adminInitError}` : 'Firebase admin not configured' },
        { status: 500 }
      );
    }
    const resolved = 'params' in ctx ? (typeof (ctx as any).params?.then === 'function' ? await (ctx as any).params : (ctx as any).params) : undefined;
    const code = resolved?.code?.toUpperCase();
    if (!code) return NextResponse.json({ error: 'Room code missing' }, { status: 400 });
    const snap = await adminDb.collection('rooms').doc(code).get();
    if (!snap.exists) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    const room = snap.data() as any;

    // Trả về câu hỏi hiện tại để player có thể polling
    let currentQuestion = null;
    const questionDeadline = typeof room.questionDeadline === 'number' ? room.questionDeadline : room.questionDeadline?.toMillis?.();
    const isTimeUp = questionDeadline ? Date.now() > questionDeadline : false;
    if (room.status === 'in-progress' && room.currentQuestionIndex >= 0 && room.currentQuestionIndex < room.quiz.length) {
      const q = room.quiz[room.currentQuestionIndex];
      currentQuestion = {
        index: room.currentQuestionIndex,
        total: room.quiz.length,
        prompt: q.question,
        options: q.options,
        deadline: questionDeadline ?? undefined,
        durationMs: room.questionDurationMs,
        // Chỉ trả correctIndex khi hết giờ để player thấy đáp án đúng
        correctIndex: isTimeUp ? q.correctIndex : undefined,
      };
    }

    return NextResponse.json({
      roomCode: room.roomCode,
      status: room.status,
      playerCount: Object.keys(room.players || {}).length,
      players: Object.values(room.players || {}).map((p: any) => p.name),
      currentQuestionIndex: room.currentQuestionIndex,
      currentQuestion,
      answeredCount: Array.isArray(room.answeredThisRound) ? room.answeredThisRound.length : 0,
      leaderboard: (Object.entries(room.leaderboard || {}) as [string, LeaderboardEntry][]) 
        .map(([id, entry]) => ({ id, ...entry }))
        .sort((a, b) => b.score - a.score),
      showingResult: isTimeUp,
    });
  } catch (error: any) {
    console.error('Room state error', error);
    if (isFirestoreNotFoundError(error)) {
      return NextResponse.json(
        { error: 'Firestore database not found. Check FIREBASE_PROJECT_ID and enable Firestore.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

function isFirestoreNotFoundError(error: any) {
  const code = typeof error?.code === 'number' ? error.code : undefined;
  const message = typeof error?.message === 'string' ? error.message : '';
  return code === 5 || message.includes('NOT_FOUND');
}
