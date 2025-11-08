// Main Application Logic with Firebase
class DivineRizqApp {
    constructor() {
        this.currentUser = null;
        this.userData = null;
        this.tg = null;
        this.init();
    }

    init() {
        console.log('🚀 Divine RizQ App Initializing...');
        
        // Initialize Telegram WebApp
        this.initTelegram();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load user data from Firebase
        this.loadUserData();
    }

    initTelegram() {
        try {
            this.tg = window.Telegram.WebApp;
            
            if (this.tg && this.tg.initDataUnsafe.user) {
                this.tg.expand();
                this.tg.enableClosingConfirmation();
                console.log('✅ Telegram WebApp initialized');
                return true;
            } else {
                throw new Error('No Telegram user data');
            }
        } catch (error) {
            console.log('🌐 Running in Browser - Demo mode');
            this.demoMode = true;
            return false;
        }
    }

    async loadUserData() {
        if (this.demoMode) {
            this.loadDemoData();
            return;
        }

        try {
            const telegramUser = this.tg.initDataUnsafe.user;
            const userId = `user_${telegramUser.id}`;
            const username = telegramUser.username || 
                           `${telegramUser.first_name}${telegramUser.last_name ? ' ' + telegramUser.last_name : ''}`;

            // Check for referral
            const urlParams = new URLSearchParams(window.location.search);
            const refCode = urlParams.get('ref');

            const userDoc = await db.collection('users').doc(userId).get();

            if (userDoc.exists) {
                // Existing user
                this.userData = userDoc.data();
                console.log('✅ User data loaded:', this.userData);
            } else {
                // New user - create document
                this.userData = {
                    uid: userId,
                    username: username,
                    balance: 0.0,
                    joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    dailyRewardClaimed: false,
                    daysFromJoin: 0,
                    referral: refCode || "none",
                    totalEarned: 0.0,
                    completedTasks: [],
                    lastActivity: firebase.firestore.FieldValue.serverTimestamp()
                };

                await db.collection('users').doc(userId).set(this.userData);
                console.log('✅ New user created:', this.userData);
            }

            this.updateUI();
        } catch (error) {
            console.error('❌ Error loading user data:', error);
            this.loadDemoData();
        }
    }

    loadDemoData() {
        this.userData = {
            balance: 12.50,
            totalEarned: 25.75,
            daysFromJoin: 3,
            dailyRewardClaimed: false,
            username: 'Demo User',
            completedTasks: []
        };
        this.updateUI();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.switchPage(page);
            });
        });

        // Quick action buttons
        document.getElementById('watchAdBtn').addEventListener('click', () => {
            this.watchAd();
        });

        document.getElementById('dailyRewardBtn').addEventListener('click', () => {
            this.switchPage('daily');
        });

        document.getElementById('tasksBtn').addEventListener('click', () => {
            this.loadTasks();
        });

        document.getElementById('referralBtn').addEventListener('click', () => {
            this.switchPage('referral');
        });

        // Ad buttons
        document.querySelectorAll('.ad-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.showAd(type);
            });
        });

        // Daily reward
        document.getElementById('claimRewardBtn').addEventListener('click', () => {
            this.claimDailyReward();
        });

        // Referral
        document.getElementById('copyLinkBtn').addEventListener('click', () => {
            this.copyReferralLink();
        });

        // Withdraw form
        document.getElementById('withdrawForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitWithdrawal();
        });
    }

    switchPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        document.getElementById(`${pageId}-page`).classList.add('active');

        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageId}"]`).classList.add('active');

        // Page specific setup
        this.setupPage(pageId);
    }

    setupPage(pageId) {
        switch(pageId) {
            case 'referral':
                this.setupReferralPage();
                break;
            case 'tasks':
                this.loadTasks();
                break;
        }
    }

    setupReferralPage() {
        if (this.demoMode) {
            document.getElementById('referralLink').value = 'https://t.me/your_bot?start=ref_demo';
            return;
        }

        const referralLink = `${window.location.origin}${window.location.pathname}?ref=${this.tg.initDataUnsafe.user.id}`;
        document.getElementById('referralLink').value = referralLink;
    }

    async loadTasks() {
        try {
            const tasksSnapshot = await db.collection('tasks').where('active', '==', true).get();
            const tasksContainer = document.getElementById('tasksContainer');
            
            if (tasksSnapshot.empty) {
                tasksContainer.innerHTML = '<p>No tasks available</p>';
                return;
            }

            let tasksHTML = '';
            tasksSnapshot.forEach(doc => {
                const task = doc.data();
                const isCompleted = this.userData.completedTasks && 
                                  this.userData.completedTasks.includes(doc.id);

                tasksHTML += `
                    <div class="task-item">
                        <div class="task-info">
                            <div class="task-title">${task.title}</div>
                            <div class="task-description">${task.description}</div>
                            <div class="task-reward">Reward: ${task.reward} ISLM</div>
                        </div>
                        <button class="btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}" 
                                data-task-id="${doc.id}"
                                ${isCompleted ? 'disabled' : ''}>
                            ${isCompleted ? 'Completed' : 'Start Task'}
                        </button>
                    </div>
                `;
            });

            tasksContainer.innerHTML = tasksHTML;

            // Add event listeners to task buttons
            tasksContainer.querySelectorAll('.btn:not(:disabled)').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const taskId = e.target.dataset.taskId;
                    this.startTask(taskId);
                });
            });

        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    async startTask(taskId) {
        // In real implementation, open task link and start timer
        alert('Task started! Complete the task to earn rewards.');
        
        // Simulate task completion after 5 seconds
        setTimeout(() => {
            this.completeTask(taskId, 0.30); // Default reward
        }, 5000);
    }

    async completeTask(taskId, reward) {
        try {
            if (this.demoMode) {
                this.addBalance(reward, 'Task Reward');
                return;
            }

            const userId = `user_${this.tg.initDataUnsafe.user.id}`;
            const updatedCompletedTasks = [...(this.userData.completedTasks || []), taskId];

            await db.collection('users').doc(userId).update({
                balance: firebase.firestore.FieldValue.increment(reward),
                totalEarned: firebase.firestore.FieldValue.increment(reward),
                completedTasks: updatedCompletedTasks,
                lastActivity: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update local data
            this.userData.balance += reward;
            this.userData.totalEarned += reward;
            this.userData.completedTasks = updatedCompletedTasks;

            this.updateUI();
            this.showNotification(`Task completed! +${reward} ISLM`, 'success');

        } catch (error) {
            console.error('Error completing task:', error);
            this.showNotification('Error completing task', 'error');
        }
    }

    async watchAd() {
        if (this.demoMode) {
            this.addBalance(0.02, 'Ad Reward');
            return;
        }

        try {
            // Show ad using Monetag
            monetag.show_10076761().then(() => {
                this.giveAdReward();
            }).catch(error => {
                console.error('Ad error:', error);
                this.showNotification('Ad failed to load', 'error');
            });
        } catch (error) {
            console.error('Ad error:', error);
            // Fallback - give reward anyway for testing
            this.giveAdReward();
        }
    }

    async giveAdReward() {
        const reward = 0.02;
        
        if (this.demoMode) {
            this.addBalance(reward, 'Ad Reward');
            return;
        }

        try {
            const userId = `user_${this.tg.initDataUnsafe.user.id}`;
            
            await db.collection('users').doc(userId).update({
                balance: firebase.firestore.FieldValue.increment(reward),
                totalEarned: firebase.firestore.FieldValue.increment(reward),
                lastActivity: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update local data
            this.userData.balance += reward;
            this.userData.totalEarned += reward;

            this.updateUI();
            this.showNotification(`Ad completed! +${reward} ISLM`, 'success');

        } catch (error) {
            console.error('Error updating balance:', error);
            this.showNotification('Error updating balance', 'error');
        }
    }

    async claimDailyReward() {
        if (this.userData.dailyRewardClaimed) {
            this.showNotification('You have already claimed your daily reward today!', 'warning');
            return;
        }

        if (this.userData.daysFromJoin >= 7) {
            this.showNotification('Daily rewards are only available for the first 7 days', 'warning');
            return;
        }

        const reward = 0.50;

        if (this.demoMode) {
            this.addBalance(reward, 'Daily Reward');
            this.userData.dailyRewardClaimed = true;
            return;
        }

        try {
            const userId = `user_${this.tg.initDataUnsafe.user.id}`;
            
            await db.collection('users').doc(userId).update({
                balance: firebase.firestore.FieldValue.increment(reward),
                totalEarned: firebase.firestore.FieldValue.increment(reward),
                dailyRewardClaimed: true,
                daysFromJoin: firebase.firestore.FieldValue.increment(1),
                lastActivity: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update local data
            this.userData.balance += reward;
            this.userData.totalEarned += reward;
            this.userData.dailyRewardClaimed = true;
            this.userData.daysFromJoin = (this.userData.daysFromJoin || 0) + 1;

            this.updateUI();
            this.showNotification(`Daily reward claimed! +${reward} ISLM`, 'success');

        } catch (error) {
            console.error('Error claiming daily reward:', error);
            this.showNotification('Error claiming daily reward', 'error');
        }
    }

    updateUI() {
        if (!this.userData) return;

        // Update balance displays
        const balance = this.userData.balance.toFixed(2);
        document.getElementById('balanceAmount').textContent = `${balance} ISLM`;
        document.getElementById('mainBalance').textContent = `${balance} ISLM`;

        // Update stats
        document.getElementById('totalEarned').textContent = this.userData.totalEarned.toFixed(2);
        document.getElementById('activeDays').textContent = this.userData.daysFromJoin || 0;

        // Update daily reward button
        const claimBtn = document.getElementById('claimRewardBtn');
        if (this.userData.dailyRewardClaimed) {
            claimBtn.disabled = true;
            claimBtn.textContent = 'Already Claimed Today';
            document.getElementById('rewardMessage').textContent = 'Come back tomorrow!';
        } else {
            claimBtn.disabled = false;
            claimBtn.textContent = 'Claim Reward';
            document.getElementById('rewardMessage').textContent = 'Daily Reward Available!';
        }

        // Show demo notice if in demo mode
        if (this.demoMode) {
            this.showDemoNotice();
        }
    }

    showDemoNotice() {
        if (!document.getElementById('demoNotice')) {
            const notice = document.createElement('div');
            notice.id = 'demoNotice';
            notice.className = 'demo-notice';
            notice.innerHTML = '🔧 <strong>Demo Mode</strong> - Real functionality in Telegram';
            document.querySelector('.main-content').prepend(notice);
        }
    }

    addBalance(amount, reason) {
        this.userData.balance += amount;
        this.userData.totalEarned += amount;
        this.updateUI();
        this.showNotification(`${reason}! +${amount} ISLM`, 'success');
    }

    copyReferralLink() {
        const linkInput = document.getElementById('referralLink');
        linkInput.select();
        document.execCommand('copy');
        this.showNotification('Referral link copied!', 'success');
    }

    async submitWithdrawal() {
        const amount = parseFloat(document.getElementById('withdrawAmount').value);
        const method = document.getElementById('withdrawMethod').value;

        if (!amount || amount < 28) {
            this.showNotification('Minimum withdrawal: 28 ISLM', 'error');
            return;
        }

        if (amount > this.userData.balance) {
            this.showNotification('Insufficient balance', 'error');
            return;
        }

        if (!method) {
            this.showNotification('Please select withdrawal method', 'error');
            return;
        }

        if (this.demoMode) {
            this.showNotification(`Withdrawal request submitted! Amount: ${amount} ISLM`, 'success');
            document.getElementById('withdrawForm').reset();
            return;
        }

        try {
            const withdrawalData = {
                uid: this.userData.uid,
                amount: amount,
                method: method,
                wallet: document.getElementById('walletAddress').value,
                status: 'pending',
                requestedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('withdrawals').add(withdrawalData);

            // Update user balance
            await db.collection('users').doc(this.userData.uid).update({
                balance: firebase.firestore.FieldValue.increment(-amount),
                lastActivity: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update local data
            this.userData.balance -= amount;

            this.updateUI();
            this.showNotification('Withdrawal request submitted successfully!', 'success');
            document.getElementById('withdrawForm').reset();

        } catch (error) {
            console.error('Error submitting withdrawal:', error);
            this.showNotification('Error submitting withdrawal request', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.notification');
        existing.forEach(note => note.remove());

        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '❌';
        if (type === 'warning') icon = '⚠️';

        notification.innerHTML = `
            <span class="notification-icon">${icon}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DivineRizqApp();
});
