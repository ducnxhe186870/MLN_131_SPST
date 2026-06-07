import { NextResponse } from 'next/server';
import { adminDb, adminInitError } from '@/lib/firebaseAdmin';
import { QuizQuestion } from '@/lib/quizTypes';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: adminInitError ? `Firebase admin init failed: ${adminInitError}` : 'Firebase admin not configured' },
        { status: 500 }
      );
    }
    const { quiz } = await req.json();
    if (!Array.isArray(quiz) || quiz.length === 0) {
      return NextResponse.json({ error: 'quiz is required' }, { status: 400 });
    }

    const normalized: QuizQuestion[] = quiz.map((q: any) => ({
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
    }));

    const roomCode = await generateRoomCode(adminDb);
    const hostSecret = randomUUID();
    const room = {
      roomCode,
      hostSecret,
      quiz: normalized,
      currentQuestionIndex: -1,
      status: 'lobby',
      leaderboard: {},
      players: {},
      answeredThisRound: [],
      questionDeadline: null,
      questionDurationMs: null,
    };

    await adminDb.collection('rooms').doc(roomCode).set(room);

    return NextResponse.json({
      roomCode: room.roomCode,
      hostSecret: room.hostSecret,
      quizLength: normalized.length,
    });
  } catch (error: any) {
    console.error('Create room error', error);
    if (isFirestoreNotFoundError(error)) {
      return NextResponse.json(
        { error: 'Firestore database not found. Check FIREBASE_PROJECT_ID and enable Firestore.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

async function generateRoomCode(db: NonNullable<typeof adminDb>) {
  let code = Math.random().toString(36).slice(2, 7).toUpperCase();
  // Try a few times to avoid collisions
  for (let i = 0; i < 5; i += 1) {
    const exists = await db.collection('rooms').doc(code).get();
    if (!exists.exists) return code;
    code = Math.random().toString(36).slice(2, 7).toUpperCase();
  }
  // Fallback
  return code;
}

function isFirestoreNotFoundError(error: any) {
  const code = typeof error?.code === 'number' ? error.code : undefined;
  const message = typeof error?.message === 'string' ? error.message : '';
  return code === 5 || message.includes('NOT_FOUND');
}
