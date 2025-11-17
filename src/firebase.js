// Firebase configuration - তোমার actual config দিয়ে
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// ✅ তোমার সঠিক Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB_-PefTn0NVzSJpkAS0o71zfPCb5Yhkr4",
  authDomain: "divine-rizq.firebaseapp.com",
  projectId: "divine-rizq",
  storageBucket: "divine-rizq.firebasestorage.app",
  messagingSenderId: "864023029515",
  appId: "1:864023029515:web:9f1dc6e02d259910c6a40e",
  measurementId: "G-33XFBDN1L6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

console.log('🎉 Firebase successfully connected!');
console.log('Project: divine-rizq');

export default app;
