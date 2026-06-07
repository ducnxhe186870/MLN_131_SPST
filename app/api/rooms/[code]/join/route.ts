import { NextResponse } from 'next/server';
import { adminDb, adminInitError } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

type ParamsPromise = { params: { code: string } } | { params: Promise<{ code: string }> };

export async function POST(req: Request, ctx: ParamsPromise) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: adminInitError ? `Firebase admin init failed: ${adminInitError}` : 'Firebase admin not configured' },
        { status: 500 }
      );
    }
    const { playerId, playerName, code: codeInBody } = await req.json();
    if (!playerId || !playerName) {
      return NextResponse.json({ error: 'Missing playerId or playerName' }, { status: 400 });
    }

    const resolved = 'params' in ctx ? (typeof (ctx as any).params?.then === 'function' ? await (ctx as any).params : (ctx as any).params) : undefined;
    const code = (codeInBody || resolved?.code)?.toUpperCase();
    if (!code) return NextResponse.json({ error: 'Room code missing' }, { status: 400 });
    const roomRef = adminDb.collection('rooms').doc(code);
    const snap = await roomRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    const roomData = snap.data() as any;
    if (roomData.status && roomData.status !== 'lobby') {
      return NextResponse.json({ error: 'Phòng đã bắt đầu, không thể tham gia thêm.' }, { status: 403 });
    }

    await roomRef.update({
      [`players.${playerId}`]: { name: playerName, joinedAt: Date.now() },
      updatedAt: FieldValue.serverTimestamp(),
    });

    const room = (await roomRef.get()).data() as any;

    return NextResponse.json({ 
      ok: true, 
      status: room.status,
      playerCount: Object.keys(room.players || {}).length,
      currentQuestionIndex: room.currentQuestionIndex,
    });
  } catch (error: any) {
    console.error('Join room error', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
