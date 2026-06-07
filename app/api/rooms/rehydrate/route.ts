import { NextResponse } from 'next/server';
import { adminDb, adminInitError } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: adminInitError ? `Firebase admin init failed: ${adminInitError}` : 'Firebase admin not configured' },
        { status: 500 }
      );
    }
    const { roomCode, hostSecret } = await req.json();
    if (!roomCode || !hostSecret) {
      return NextResponse.json({ error: 'roomCode and hostSecret are required' }, { status: 400 });
    }
    const code = String(roomCode).toUpperCase();
    const snap = await adminDb.collection('rooms').doc(code).get();
    if (!snap.exists) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    const room = snap.data() as any;
    if (room.hostSecret !== hostSecret) {
      return NextResponse.json({ error: 'Unauthorized host' }, { status: 403 });
    }
    return NextResponse.json({ roomCode: room.roomCode, hostSecret: room.hostSecret, quizLength: room.quiz?.length || 0, rehydrated: true });
  } catch (error: any) {
    console.error('Rehydrate room error', error);
    const message = error?.message || 'Internal error';
    const status = message === 'Room not found' ? 404 : message === 'Unauthorized host' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
