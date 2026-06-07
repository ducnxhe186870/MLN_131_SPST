import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

export let adminInitError: string | null = null;

if (!projectId || !clientEmail || !privateKey) {
  adminInitError = 'Missing Firebase Admin env vars';
}

let app = getApps()[0];

if (!app && !adminInitError) {
  try {
    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (error: any) {
    console.error('Firebase Admin init error', error);
    adminInitError = error?.message || 'Firebase Admin init error';
  }
}

export const adminDb = app ? getFirestore(app) : null;

if (adminDb) {
  adminDb.settings({ ignoreUndefinedProperties: true });
}
