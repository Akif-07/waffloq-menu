import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Resmi Firebase Web App Konfigürasyonu (waffloqmenu)
const firebaseConfig = {
  apiKey: "AIzaSyD45JL-rlllctxCO_jW8uzHkk5BF7p0i0g",
  authDomain: "waffloqmenu.firebaseapp.com",
  projectId: "waffloqmenu",
  storageBucket: "waffloqmenu.appspot.com",
  messagingSenderId: "258128994674",
  appId: "1:258128994674:web:420808d70786df7ab97deb"
};

let app = null;
let db = null;
let isFirebaseConfigured = false;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
  isFirebaseConfigured = true;
  console.log("🔥 WAFFLOQ Firebase Cloud Firestore Canlı Bulut Bağlantısı Başarıyla Kuruldu!");
} catch (error) {
  console.error("Firebase bağlantı hatası:", error);
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

export { app, db, isFirebaseConfigured, firebaseConfig };
