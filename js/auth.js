// Professional Authentication System
class AuthService {
    constructor() {
        this.tg = null;
        this.currentUser = null;
        this.isDemoMode = false;
        this.init();
    }

    init() {
        this.initTelegram();
    }

    initTelegram() {
        try {
            this.tg = window.Telegram.WebApp;
            
            if (this.tg && this.tg.initDataUnsafe && this.tg.initDataUnsafe.user) {
                this.tg.ready();
                this.tg.expand();
                this.tg.enableClosingConfirmation();
                
                // Set theme params
                this.tg.setHeaderColor('#0A0216');
                this.tg.setBackgroundColor('#0A0216');
                
                console.log('✅ Telegram WebApp Professional Initialized');
                return true;
            } else {
                throw new Error('Telegram user data not available');
            }
        } catch (error) {
            console.log('🌐 Running in Professional Demo Mode');
            this.isDemoMode = true;
            this.setupDemoMode();
            return false;
        }
    }

    setupDemoMode() {
        // Create demo user data
        this.currentUser = {
            id: 'demo_user_123',
            username: 'demo_user',
            first_name: 'Demo',
            last_name: 'User',
            language_code: 'en'
        };
        
        // Add demo class to body for styling
        document.body.classList.add('demo-mode');
        
        console.log('🔧 Professional Demo Mode Activated');
    }

    async authenticate() {
        if (this.isDemoMode) {
            return await this.handleDemoAuth();
        }
        
        return await this.handleTelegramAuth();
    }

    async handleTelegramAuth() {
        try {
            const telegramUser = this.tg.initDataUnsafe.user;
            const userId = `user_${telegramUser.id}`;
            
            // Check for referral code
            const urlParams = new URLSearchParams(window.location.search);
            const refCode = urlParams.get('ref');
            
            // Get or create user in Firebase
            let userData = await firebaseService.getUser(userId);
            
            if (!userData) {
                // New user - create account
                userData = {
                    uid: userId,
                    telegramId: telegramUser.id,
                    username: telegramUser.username || `${telegramUser.first_name}${telegramUser.last_name ? ' ' + telegramUser.last_name : ''}`,
                    firstName: telegramUser.first_name,
                    lastName: telegramUser.last_name || '',
                    languageCode: telegramUser.language_code,
                    balance: 0.0,
                    totalEarned: 0.0,
                    joinedAt: firebaseService.getServerTimestamp(),
                    dailyRewardClaimed: false,
                    daysFromJoin: 0,
                    referral: refCode || "none",
                    totalReferrals: 0,
                    referralEarnings: 0.0,
                    completedTasks: [],
                    status: 'active',
                    lastLogin: firebaseService.getServerTimestamp(),
                    ipAddress: await this.getIPAddress()
                };
                
                await firebaseService.createUser(userData);
                
                // Process referral if exists
                if (refCode && refCode !== "none") {
                    await this.processReferral(refCode, userId);
                }
                
                // Log user registration
                await firebaseService.logUserActivity(userId, 'user_registered', {
                    referral: refCode,
                    source: 'telegram'
                });
                
                console.log('✅ New user created professionally:', userData);
            } else {
                // Existing user - update last login
                await firebaseService.updateUser(userId, {
                    lastLogin: firebaseService.getServerTimestamp(),
                    ipAddress: await this.getIPAddress()
                });
                
                console.log('✅ Existing user authenticated:', userData);
            }
            
            this.currentUser = { ...telegramUser, ...userData };
            
            // Log login activity
            await firebaseService.logUserActivity(userId, 'user_login');
            
            return this.currentUser;
            
        } catch (error) {
            console.error('❌ Telegram authentication failed:', error);
            throw new Error('Authentication failed. Please try again.');
        }
    }

    async handleDemoAuth() {
        try {
            const demoUserData = {
                uid: 'demo_user_123',
                username: 'demo_user',
                firstName: 'Demo',
                lastName: 'User',
                balance: 15.75,
                totalEarned: 32.50,
                joinedAt: new Date(),
                dailyRewardClaimed: false,
                daysFromJoin: 3,
                referral: "none",
                totalReferrals: 2,
                referralEarnings: 1.80,
                completedTasks: ['task_001', 'task_002'],
                status: 'active',
                isDemo: true
            };
            
            this.currentUser = demoUserData;
            
            console.log('✅ Demo user authenticated professionally');
            return this.currentUser;
            
        } catch (error) {
            console.error('❌ Demo authentication failed:', error);
            throw error;
        }
    }

    async processReferral(referrerId, newUserId) {
        try {
            await firebaseService.processReferral(referrerId, newUserId);
            
            // Log referral activity
            await firebaseService.logUserActivity(referrerId, 'referral_earned', {
                referredUser: newUserId
            });
            
            console.log(`✅ Referral processed: ${newUserId} referred by ${referrerId}`);
            
        } catch (error) {
            console.error('❌ Referral processing failed:', error);
        }
    }

    async getIPAddress() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    getUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    isDemo() {
        return this.isDemoMode;
    }

    getTelegramInstance() {
        return this.tg;
    }

    // Security methods
    async validateUserAction(userId, actionType) {
        if (this.isDemoMode) return true;
        
        try {
            // Check if user is trying to perform action on their own data
            if (userId !== this.currentUser.uid) {
                throw new Error('Unauthorized action');
            }
            
            // Log security check
            await firebaseService.logUserActivity(userId, 'security_validation', {
                action: actionType,
                timestamp: Date.now()
            });
            
            return true;
        } catch (error) {
            console.error('❌ Security validation failed:', error);
            return false;
        }
    }

    // Logout method (for future use)
    async logout() {
        // Log logout activity
        if (!this.isDemoMode && this.currentUser) {
            await firebaseService.logUserActivity(this.currentUser.uid, 'user_logout');
        }
        
        this.currentUser = null;
        console.log('✅ User logged out professionally');
    }
}

// Initialize and export Auth service
const authService = new AuthService();
window.authService = authService;

console.log('🔐 Professional Authentication Service Ready');
