// Main application initialization and mode detection
// এই ফাইলে অ্যাপ্লিকেশন শুরু এবং মোড ডিটেকশন করা হয়েছে

import { router } from './router.js';
import { initTelegramAuth, isTelegramWebApp } from './utils/telegramAuth.js';
import { initEmailAuth } from './utils/emailAuth.js';

class DivineRizQApp {
    constructor() {
        this.currentUser = null;
        this.appMode = null;
        this.init();
    }

    async init() {
        try {
            // অ্যাপ মোড ডিটেক্ট করা
            this.detectAppMode();
            
            // Authentication সিস্টেম শুরু করা
            await this.initAuth();
            
            // Router শুরু করা
            router.init();
            
            // Loader hide করা
            this.hideLoader();
            
            console.log('Divine RizQ App started successfully in', this.appMode, 'mode');
        } catch (error) {
            console.error('App initialization failed:', error);
            this.showError('অ্যাপ শুরু করতে সমস্যা হচ্ছে। পৃষ্ঠাটি রিফ্রেশ করুন।');
        }
    }

    detectAppMode() {
        // Telegram WebApp ডিটেক্ট করা
        if (isTelegramWebApp()) {
            this.appMode = 'telegram';
        } else {
            this.appMode = 'website';
        }
        
        // Body-তে মোড ক্লাস যোগ করা
        document.body.classList.add(`${this.appMode}-mode`);
    }

    async initAuth() {
        if (this.appMode === 'telegram') {
            // Telegram authentication শুরু করা
            this.currentUser = await initTelegramAuth();
        } else {
            // Email authentication listener সেট করা
            await initEmailAuth();
        }
    }

    hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    showError(message) {
        // Error message show করার লজিক
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #f56565;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 10000;
        `;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Global user data access
    getUser() {
        return this.currentUser;
    }

    getAppMode() {
        return this.appMode;
    }
}

// Global app instance তৈরি করা
window.divineRizQApp = new DivineRizQApp();
