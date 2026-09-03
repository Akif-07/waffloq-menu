import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// 1. Önce localStorage'da kayıtlı Firebase ayarı var mı kontrol et
let customConfig = null;
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('waffloq_firebase_config');
    if (saved) {
      customConfig = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Firebase config parse error:", e);
  }
}

const firebaseConfig = customConfig || {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "waffloqmenu.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "waffloqmenu",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "waffloqmenu.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let app = null;
let db = null;
let isFirebaseConfigured = false;

if (firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10 && !firebaseConfig.apiKey.includes("DummyKey")) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
    isFirebaseConfigured = true;
    console.log("🔥 Firebase Firestore bulut veritabanı aktif ve bağlı!");
  } catch (error) {
    console.warn("Firebase bağlantı hatası:", error);
  }
}

export function saveFirebaseConfig(newConfig) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('waffloq_firebase_config', JSON.stringify(newConfig));
    window.location.reload();
  }
}

export function removeFirebaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('waffloq_firebase_config');
    window.location.reload();
  }
}

export { db, isFirebaseConfigured, firebaseConfig };
