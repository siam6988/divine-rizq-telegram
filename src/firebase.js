// Firebase configuration and initialization
// এই ফাইলে Firebase configuration এবং initialization করা হয়েছে

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - আপনার প্রকৃত configuration দিয়ে replace করুন
const firebaseConfig = {
    apiKey: "AIzaSyB_-PefTn0NVzSJpkAS0o71zfPCb5Yhkr4",
    authDomain: "divine-rizq.firebaseapp.com",
    projectId: "divine-rizq",
    storageBucket: "divine-rizq.firebasestorage.app",
    messagingSenderId: "864023029515",
    appId: "1:864023029515:web:9f1dc6e02d259910c6a40e"
};
// Firebase app initialization
const app = initializeApp(firebaseConfig);

// Firebase services export
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
