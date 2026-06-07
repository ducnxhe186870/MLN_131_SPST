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
    const { playerId, playerName, answerIndex, code: codeInBody } = await req.json();
    if (!playerId || !playerName || answerIndex === undefined) {
      return NextResponse.json({ error: 'Missing player info or answer' }, { status: 400 });
    }

    const resolved = 'params' in ctx ? (typeof (ctx as any).params?.then === 'function' ? await (ctx as any).params : (ctx as any).params) : undefined;
    const code = (codeInBody || resolved?.code)?.toUpperCase();
    if (!code) return NextResponse.json({ error: 'Room code missing' }, { status: 400 });
    const { room, isCorrect, alreadyAnswered, tooLate } = await recordAnswer({
      roomCode: code,
      playerId,
      playerName,
      answerIndex,
    });

    if (alreadyAnswered) {
      return NextResponse.json({ ok: false, error: 'Already answered this question' }, { status: 400 });
    }

    if (tooLate) {
      return NextResponse.json({ ok: false, error: 'Hết thời gian trả lời' }, { status: 400 });
    }

    const sorted = leaderboardList(room.leaderboard);
    const answeredCount = room.answeredThisRound.size;
    const playerCount = Object.keys(room.players).length;

    return NextResponse.json({ ok: true, isCorrect, leaderboard: sorted });
  } catch (error: any) {
    console.error('Answer submit error', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

function leaderboardList(board: Record<string, { name: string; score: number; lastAnswerCorrect?: boolean; lastAnswerAt?: number }>) {
  return Object.entries(board)
    .map(([id, entry]) => ({ id, ...entry }))
    .sort((a, b) => b.score - a.score || (a.lastAnswerAt || 0) - (b.lastAnswerAt || 0));
}

async function recordAnswer(options: {
  roomCode: string;
  playerId: string;
  playerName: string;
  answerIndex: number;
}): Promise<{ room: any; isCorrect: boolean; alreadyAnswered?: boolean; tooLate?: boolean }> {
  const { roomCode, playerId, playerName, answerIndex } = options;
  const roomRef = adminDb!.collection('rooms').doc(roomCode.toUpperCase());

  return adminDb!.runTransaction(async (tx) => {
    const snap = await tx.get(roomRef);
    if (!snap.exists) {
      throw new Error('Room not found');
    }
    const room = snap.data() as any;

    if (room.status !== 'in-progress') {
      throw new Error('Room is not accepting answers');
    }

    const deadline = typeof room.questionDeadline === 'number' ? room.questionDeadline : room.questionDeadline?.toMillis?.();
    if (deadline && Date.now() > deadline) {
      return { room, isCorrect: false, tooLate: true };
    }

    const answered = Array.isArray(room.answeredThisRound) ? room.answeredThisRound : [];
    if (answered.includes(playerId)) {
      return { room, isCorrect: false, alreadyAnswered: true };
    }

    const question = room.quiz[room.currentQuestionIndex];
    const isCorrect = question.correctIndex === answerIndex;
    const entry = room.leaderboard?.[playerId] || { name: playerName, score: 0 };
    const gain = isCorrect ? scoreWithSpeed(deadline, room.questionDurationMs) : 0;
    const updatedLeaderboard = {
      ...(room.leaderboard || {}),
      [playerId]: {
        name: playerName,
        score: entry.score + gain,
        lastAnswerCorrect: isCorrect,
        lastAnswerAt: Date.now(),
      },
    };

    const updated = {
      ...room,
      leaderboard: updatedLeaderboard,
      answeredThisRound: [...answered, playerId],
    };

    tx.update(roomRef, {
      leaderboard: updated.leaderboard,
      answeredThisRound: updated.answeredThisRound,
    });

    return { room: updated, isCorrect };
  });
}

function scoreWithSpeed(deadline?: number, durationMs = 15000) {
  if (!deadline) return 500;
  const remaining = Math.max(0, deadline - Date.now());
  const ratio = Math.min(1, remaining / durationMs);
  const base = 500;
  const bonus = Math.round(500 * ratio);
  return base + bonus;
}
