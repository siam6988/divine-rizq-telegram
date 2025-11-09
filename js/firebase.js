// Professional Firebase Configuration and Services

class FirebaseService {
    constructor() {
        this.db = null;
        this.auth = null;
        this.initialized = false;
        this.init();
    }

    init() {
        try {
            // Firebase configuration
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
            firebase.initializeApp(firebaseConfig);
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            // Enable offline persistence
            this.db.enablePersistence()
                .catch((err) => {
                    console.warn('Firebase persistence failed:', err);
                });

            this.initialized = true;
            console.log('🔥 Firebase Professional Service Initialized');
            
        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            this.initialized = false;
        }
    }

    // User Management
    async getUser(userId) {
        try {
            const doc = await this.db.collection('users').doc(userId).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error('Error getting user:', error);
            throw error;
        }
    }

    async createUser(userData) {
        try {
            await this.db.collection('users').doc(userData.uid).set({
                ...userData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'active'
            });
            return userData;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async updateUser(userId, updates) {
        try {
            await this.db.collection('users').doc(userId).update({
                ...updates,
                lastActivity: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    // Balance Management
    async updateBalance(userId, amount, reason) {
        try {
            const userRef = this.db.collection('users').doc(userId);
            
            await this.db.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists) {
                    throw new Error('User does not exist');
                }

                const newBalance = (userDoc.data().balance || 0) + amount;
                
                if (newBalance < 0) {
                    throw new Error('Insufficient balance');
                }

                transaction.update(userRef, {
                    balance: newBalance,
                    totalEarned: firebase.firestore.FieldValue.increment(Math.max(amount, 0)),
                    lastActivity: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Log transaction
                await this.logTransaction(userId, amount, reason);
            });

            return true;
        } catch (error) {
            console.error('Error updating balance:', error);
            throw error;
        }
    }

    // Transaction Logging
    async logTransaction(userId, amount, type, metadata = {}) {
        try {
            await this.db.collection('transactions').add({
                userId,
                amount,
                type,
                metadata,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'completed'
            });
        } catch (error) {
            console.error('Error logging transaction:', error);
        }
    }

    // Task Management
    async getActiveTasks() {
        try {
            const snapshot = await this.db.collection('tasks')
                .where('active', '==', true)
                .where('expiry', '>', new Date())
                .orderBy('expiry')
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting tasks:', error);
            throw error;
        }
    }

    async completeTask(userId, taskId, reward) {
        try {
            const userRef = this.db.collection('users').doc(userId);
            
            await this.db.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                const completedTasks = userDoc.data().completedTasks || [];
                
                if (completedTasks.includes(taskId)) {
                    throw new Error('Task already completed');
                }

                completedTasks.push(taskId);
                
                transaction.update(userRef, {
                    completedTasks,
                    balance: firebase.firestore.FieldValue.increment(reward),
                    totalEarned: firebase.firestore.FieldValue.increment(reward),
                    lastActivity: firebase.firestore.FieldValue.serverTimestamp()
                });
            });

            await this.logTransaction(userId, reward, 'task_completion', { taskId });
            return true;
        } catch (error) {
            console.error('Error completing task:', error);
            throw error;
        }
    }

    // Withdrawal Management
    async createWithdrawal(userId, withdrawalData) {
        try {
            const withdrawalRef = await this.db.collection('withdrawals').add({
                userId,
                ...withdrawalData,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                processedAt: null
            });

            return withdrawalRef.id;
        } catch (error) {
            console.error('Error creating withdrawal:', error);
            throw error;
        }
    }

    async getUserWithdrawals(userId) {
        try {
            const snapshot = await this.db.collection('withdrawals')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting withdrawals:', error);
            throw error;
        }
    }

    // Referral System
    async processReferral(referrerId, referredUserId) {
        try {
            const referrerRef = this.db.collection('users').doc(referrerId);
            
            await this.db.runTransaction(async (transaction) => {
                const referrerDoc = await transaction.get(referrerRef);
                
                if (!referrerDoc.exists) {
                    throw new Error('Referrer not found');
                }

                transaction.update(referrerRef, {
                    totalReferrals: firebase.firestore.FieldValue.increment(1),
                    lastActivity: firebase.firestore.FieldValue.serverTimestamp()
                });
            });

            await this.logTransaction(referrerId, 0, 'referral_bonus', { referredUserId });
            return true;
        } catch (error) {
            console.error('Error processing referral:', error);
            throw error;
        }
    }

    // Anti-Cheat System
    async logUserActivity(userId, activityType, metadata = {}) {
        try {
            const ip = await this.getUserIP();
            
            await this.db.collection('user_activities').add({
                userId,
                activityType,
                metadata,
                ipAddress: ip,
                userAgent: navigator.userAgent,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }

    async getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    // Real-time Listeners
    setupUserListener(userId, callback) {
        return this.db.collection('users').doc(userId)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    callback(doc.data());
                }
            }, (error) => {
                console.error('User listener error:', error);
            });
    }

    // Utility Methods
    getServerTimestamp() {
        return firebase.firestore.FieldValue.serverTimestamp();
    }

    increment(value) {
        return firebase.firestore.FieldValue.increment(value);
    }

    arrayUnion(elements) {
        return firebase.firestore.FieldValue.arrayUnion(...elements);
    }
}

// Initialize and export Firebase service
const firebaseService = new FirebaseService();
window.firebaseService = firebaseService;

console.log('🚀 Firebase Professional Service Ready');
