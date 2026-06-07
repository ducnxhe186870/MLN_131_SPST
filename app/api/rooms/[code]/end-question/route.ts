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

    const roomRef = adminDb.collection('rooms').doc(code);
    const snap = await roomRef.get();
    if (!snap.exists) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    const room = snap.data() as any;
    if (room.hostSecret !== hostSecret) return NextResponse.json({ error: 'Unauthorized host' }, { status: 403 });

    // Kết thúc thời gian trả lời bằng cách đặt deadline về quá khứ
    const deadline = typeof room.questionDeadline === 'number' ? room.questionDeadline : room.questionDeadline?.toMillis?.();
    if (deadline && deadline > Date.now()) {
      await roomRef.update({ questionDeadline: Date.now() - 1 });
    }

    return NextResponse.json({ ok: true, message: 'Question ended' });
  } catch (error: any) {
    console.error('End question error', error);
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
