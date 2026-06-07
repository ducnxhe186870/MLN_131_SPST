import { NextResponse } from 'next/server';
import { adminDb, adminInitError } from '@/lib/firebaseAdmin';

type ParamsPromise = { params: { code: string } } | { params: Promise<{ code: string }> };

export async function POST(req: Request, ctx: ParamsPromise) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: adminInitError ? `Firebase admin init failed: ${adminInitError}` : 'Firebase admin not configured' },
        { status: 500 }
      );
    }
    const { hostSecret, code: codeInBody } = await req.json();
    if (!hostSecret) return NextResponse.json({ error: 'hostSecret required' }, { status: 400 });

    const resolved = 'params' in ctx ? (typeof (ctx as any).params?.then === 'function' ? await (ctx as any).params : (ctx as any).params) : undefined;
    const code = (codeInBody || resolved?.code)?.toUpperCase();
    if (!code) return NextResponse.json({ error: 'Room code missing' }, { status: 400 });
    const { room, question, error, status } = await advanceQuestionWithAuth(code, hostSecret);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    if (!question) {
      return NextResponse.json({ status: room.status, done: true, leaderboard: leaderboardList(room.leaderboard) });
    }

    const payload = {
      index: room.currentQuestionIndex,
      total: room.quiz.length,
      prompt: question.question,
      options: question.options,
      correctIndex: question.correctIndex,
      deadline: room.questionDeadline,
      durationMs: room.questionDurationMs,
    };

    // Trả về payload để host có thể fallback hiển thị ngay cả khi realtime gặp lỗi
    return NextResponse.json({ ok: true, status: room.status, question: payload, deadline: room.questionDeadline, durationMs: room.questionDurationMs });
  } catch (error: any) {
    console.error('Next question error', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

function leaderboardList(board: Record<string, { name: string; score: number; lastAnswerCorrect?: boolean; lastAnswerAt?: number }>) {
  return Object.entries(board)
    .map(([id, entry]) => ({ id, ...entry }))
    .sort((a, b) => b.score - a.score || (a.lastAnswerAt || 0) - (b.lastAnswerAt || 0));
}

async function advanceQuestionWithAuth(code: string, hostSecret: string) {
  const roomRef = adminDb!.collection('rooms').doc(code.toUpperCase());
  return adminDb!.runTransaction(async (tx) => {
    const snap = await tx.get(roomRef);
    if (!snap.exists) return { error: 'Room not found', status: 404 } as const;
    const room = snap.data() as any;
    if (room.hostSecret !== hostSecret) return { error: 'Unauthorized host', status: 403 } as const;

    if (room.status === 'finished') {
      return { room } as const;
    }

    const nextIndex = (room.currentQuestionIndex ?? -1) + 1;
    if (nextIndex >= room.quiz.length) {
      const updated = {
        ...room,
        currentQuestionIndex: nextIndex,
        status: 'finished',
        answeredThisRound: [],
        questionDeadline: null,
        questionDurationMs: null,
      };
      tx.update(roomRef, updated);
      return { room: updated } as const;
    }

    const QUESTION_DURATION_MS = 15000;
    const deadline = Date.now() + QUESTION_DURATION_MS;
    const updated = {
      ...room,
      currentQuestionIndex: nextIndex,
      status: 'in-progress',
      answeredThisRound: [],
      questionDeadline: deadline,
      questionDurationMs: QUESTION_DURATION_MS,
    };
    tx.update(roomRef, {
      currentQuestionIndex: updated.currentQuestionIndex,
      status: updated.status,
      answeredThisRound: updated.answeredThisRound,
      questionDeadline: updated.questionDeadline,
      questionDurationMs: updated.questionDurationMs,
    });

    const question = room.quiz[nextIndex];
    return { room: updated, question } as const;
  });
}
