// Pusher removed: return 410 Gone to indicate endpoint is deprecated
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Realtime now uses Firestore; Pusher auth is disabled.' }, { status: 410 });
}
