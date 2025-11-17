// Email-based Authentication System
// এই ফাইলে email/password-based authentication এবং user management করা হয়েছে

import { auth, db } from '../firebase.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function initEmailAuth() {
    // Auth state observer সেট করা
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User logged in
                await handleUserLogin(user);
                resolve(user);
            } else {
                // User logged out
                handleUserLogout();
                resolve(null);
            }
        });
    });
}

async function handleUserLogin(firebaseUser) {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
        // New user - create document
        await createEmailUser(firebaseUser);
    } else {
        // Existing user - update last login
        await updateUserLastLogin(firebaseUser.uid);
    }
    
    // Update global app state
    if (window.divineRizQApp) {
        window.divineRizQApp.currentUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            platform: 'website'
        };
    }
}

async function createEmailUser(firebaseUser) {
    const userData = {
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        photoURL: firebaseUser.photoURL || '',
        platform: 'website',
        createdAt: new Date(),
        lastLogin: new Date(),
        emailVerified: firebaseUser.emailVerified
    };
    
    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
}

async function updateUserLastLogin(uid) {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
        lastLogin: new Date()
    }, { merge: true });
}

function handleUserLogout() {
    if (window.divineRizQApp) {
        window.divineRizQApp.currentUser = null;
    }
    
    // Redirect to login page if not already there
    if (window.location.hash !== '#login') {
        window.location.hash = '#login';
    }
}

// Authentication functions export
export async function signUpWithEmail(email, password, displayName) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update display name
        await updateProfile(user, { displayName });
        
        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function loginWithEmail(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function logout() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
