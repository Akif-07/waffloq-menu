// Firebase SDK Konfigürasyonu
// Firebase Console -> Proje Ayarları -> 'waffloqmenu' Web Uygulamanızdan alacağınız bilgileri buraya yapıştırabilirsiniz.

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKey_ForLocalDevPreview",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "waffloqmenu.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "waffloqmenu",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "waffloqmenu.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

let app;
let db = null;
let isFirebaseConfigured = false;

try {
  // Eğer gerçek bir apiKey girilmişse Firestore'u başlat
  if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("DummyKey")) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
    isFirebaseConfigured = true;
    console.log("🔥 Firebase Firestore bağlantısı başarıyla kuruldu!");
  } else {
    console.info("ℹ️ Firebase henüz yapılandırılmadı. Uygulama yerel/demo veri modunda çalışıyor.");
  }
} catch (error) {
  console.warn("Firebase başlatılamadı, yerel veri deposu kullanılacak:", error);
}

export { db, isFirebaseConfigured, firebaseConfig };
