// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_-PefTn0NVzSJpkAS0o71zfPCb5Yhkr4",
  authDomain: "divine-rizq.firebaseapp.com",
  projectId: "divine-rizq",
  storageBucket: "divine-rizq.firebasestorage.app",
  messagingSenderId: "864023029515",
  appId: "1:864023029515:web:9f1dc6e02d259910c6a40e",
  measurementId: "G-33XFBDN1L6"
};

// Firebase Initialize
firebase.initializeApp(firebaseConfig);

// Firebase Services
const auth = firebase.auth();
const db = firebase.firestore();

// Firebase Auth State Listener
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User logged in:', user.email || user.uid);
        window.currentUser = user;
        checkUserInDatabase(user);
    } else {
        console.log('User logged out');
        window.currentUser = null;
        showLoginPage();
    }
});

// Check if user exists in Firestore, if not create
async function checkUserInDatabase(user) {
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            // Create new user in Firestore
            await db.collection('users').doc(user.uid).set({
                uid: user.uid,
                email: user.email || null,
                telegramData: window.telegramUser || null,
                balance: 0,
                totalEarned: 0,
                referralCode: generateReferralCode(),
                referredBy: getReferredByFromURL(),
                joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('New user created in Firestore');
        } else {
            // Update last login
            await db.collection('users').doc(user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        showHomePage();
    } catch (error) {
        console.error('Error checking user:', error);
    }
}

// Generate random referral code
function generateReferralCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Get referral code from URL
function getReferredByFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref') || null;
}
