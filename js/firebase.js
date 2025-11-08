// Firebase Configuration - REAL CONFIG
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
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

console.log("🔥 Firebase Connected Successfully!");

// Export for use in other files
window.db = db;
window.firebase = firebase;
