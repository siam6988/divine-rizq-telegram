// Telegram WebApp Authentication System
// এই ফাইলে Telegram WebApp-এর authentication এবং user management করা হয়েছে

import { auth, db } from '../firebase.js';
import { signInWithCustomToken } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export function isTelegramWebApp() {
    return window.Telegram && window.Telegram.WebApp;
}

export async function initTelegramAuth() {
    if (!isTelegramWebApp()) {
        throw new Error('Telegram WebApp environment not found');
    }

    try {
        const tg = window.Telegram.WebApp;
        
        // Telegram WebApp শুরু করা
        tg.ready();
        tg.expand();
        
        // User data পাওয়া
        const userData = tg.initDataUnsafe?.user;
        
        if (!userData) {
            throw new Error('Telegram user data not available');
        }

        // Firebase-এ user create/update করা
        const user = await createOrUpdateTelegramUser(userData);
        
        // Custom token দিয়ে sign in করা
        const customToken = await generateCustomToken(userData.id);
        await signInWithCustomToken(auth, customToken);
        
        return user;
        
    } catch (error) {
        console.error('Telegram auth failed:', error);
        throw error;
    }
}

async function createOrUpdateTelegramUser(tgUser) {
    const userRef = doc(db, 'users', tgUser.id.toString());
    const userSnap = await getDoc(userRef);
    
    const userData = {
        telegramId: tgUser.id,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name || '',
        username: tgUser.username || '',
        photoUrl: tgUser.photo_url || '',
        isBot: tgUser.is_bot || false,
        languageCode: tgUser.language_code || 'en',
        platform: 'telegram',
        lastLogin: new Date(),
        createdAt: userSnap.exists() ? userSnap.data().createdAt : new Date()
    };
    
    // User document create/update করা
    await setDoc(userRef, userData, { merge: true });
    
    return userData;
}

async function generateCustomToken(telegramId) {
    // আপনার backend থেকে custom token generate করার লজিক
    // এই উদাহরণে আমরা একটি mock token ব্যবহার করছি
    const response = await fetch('/api/generate-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramId })
    });
    
    if (!response.ok) {
        throw new Error('Token generation failed');
    }
    
    const data = await response.json();
    return data.token;
}

// Telegram theme support
export function applyTelegramTheme() {
    if (!isTelegramWebApp()) return;
    
    const tg = window.Telegram.WebApp;
    
    // Theme colors apply করা
    document.documentElement.style.setProperty('--primary-green', tg.themeParams.button_color || '#0a5c36');
    document.documentElement.style.setProperty('--secondary-gold', tg.themeParams.accent_text_color || '#d4af37');
    
    // Background color set করা
    document.body.style.background = tg.themeParams.bg_color || '#ffffff';
}

// Back button visibility management
export function setBackButtonVisible(visible) {
    if (!isTelegramWebApp()) return;
    
    const tg = window.Telegram.WebApp;
    if (visible) {
        tg.BackButton.show();
    } else {
        tg.BackButton.hide();
    }
}
