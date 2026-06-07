import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getClientApp(): FirebaseApp {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

// Only initialize on the client side to avoid SSR/build-time errors
let _clientDb: Firestore | null = null;

export function getClientDb(): Firestore {
  if (typeof window === 'undefined') {
    throw new Error('getClientDb() must only be called on the client side');
  }
  if (!_clientDb) {
    const app = getClientApp();
    _clientDb = getFirestore(app);
    // Đăng nhập ẩn danh để thỏa các rule yêu cầu authenticated user
    const auth = getAuth(app);
    signInAnonymously(auth).catch(() => {
      // ignore; snapshot listener sẽ báo lỗi nếu rule vẫn chặn
    });
  }
  return _clientDb;
}

// Backwards-compatible export — only safe to use inside useEffect / event handlers
export const clientDb = typeof window !== 'undefined' ? getClientDb() : null as unknown as Firestore;
