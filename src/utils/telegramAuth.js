// Telegram WebApp Authentication System
function initTelegramAuth() {
    if (!window.isTelegramWebApp) return;

    try {
        const tg = window.Telegram.WebApp;
        const initData = tg.initData;
        
        if (initData) {
            processTelegramAuth(initData);
        } else {
            console.log('No Telegram init data found');
            showLoginPage();
        }
    } catch (error) {
        console.error('Telegram auth error:', error);
        showLoginPage();
    }
}

async function processTelegramAuth(initData) {
    try {
        // Parse init data
        const params = new URLSearchParams(initData);
        const userStr = params.get('user');
        
        if (userStr) {
            const telegramUser = JSON.parse(userStr);
            window.telegramUser = telegramUser;
            
            // Sign in with Firebase using Telegram data
            await signInWithTelegram(telegramUser);
        }
    } catch (error) {
        console.error('Error processing Telegram auth:', error);
        showLoginPage();
    }
}

async function signInWithTelegram(telegramUser) {
    try {
        // Create custom token or use anonymous auth
        // For demo, using anonymous auth. In production, use cloud functions for proper auth
        
        const credential = await auth.signInAnonymously();
        console.log('Telegram user signed in anonymously');
        
    } catch (error) {
        console.error('Telegram sign in error:', error);
        showLoginPage();
    }
}
