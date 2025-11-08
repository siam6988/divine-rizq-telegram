// Main Application Logic
class DivineRizqApp {
    constructor() {
        this.currentUser = null;
        this.userData = null;
        this.tg = null;
        this.demoMode = false;
        this.init();
    }

    init() {
        console.log('🚀 Divine RizQ App Initializing...');
        
        // Initialize Telegram WebApp
        this.initTelegram();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load user data
        this.loadUserData();
        
        // Update UI
        this.updateUI();
    }

    initTelegram() {
        try {
            this.tg = window.Telegram.WebApp;
            
            if (this.tg && this.tg.initDataUnsafe) {
                this.tg.expand();
                this.tg.enableClosingConfirmation();
                console.log('✅ Telegram WebApp initialized');
            } else {
                console.log('🌐 Running outside Telegram - Demo mode');
                this.demoMode = true;
            }
        } catch (error) {
            console.log('🌐 Browser mode - Demo activated');
            this.demoMode = true;
        }
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
            alert('টাস্ক সিস্টেম শীঘ্রই আসছে!');
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
            case 'withdraw':
                this.setupWithdrawPage();
                break;
        }
    }

    setupReferralPage() {
        const referralLink = this.demoMode ? 
            'https://t.me/your_bot?start=ref_demo' : 
            `https://t.me/your_bot?start=ref_${this.tg.initDataUnsafe.user.id}`;
        
        document.getElementById('referralLink').value = referralLink;
    }

    setupWithdrawPage() {
        // Withdraw page setup
        console.log('Withdraw page setup');
    }

    loadUserData() {
        if (this.demoMode) {
            this.loadDemoData();
            return;
        }

        // In real app, load from Firebase
        console.log('Loading user data from server...');
    }

    loadDemoData() {
        this.userData = {
            balance: 12.50,
            totalEarned: 25.75,
            daysFromJoin: 3,
            dailyRewardClaimed: false,
            username: 'Demo User'
        };
        
        console.log('✅ Demo data loaded');
    }

    updateUI() {
        if (!this.userData) return;

        // Update balance displays
        const balance = this.userData.balance.toFixed(2);
        document.getElementById('balanceAmount').textContent = `${balance} ISLM`;
        document.getElementById('mainBalance').textContent = `${balance} ISLM`;

        // Update stats
        document.getElementById('totalEarned').textContent = this.userData.totalEarned.toFixed(2);
        document.getElementById('activeDays').textContent = this.userData.daysFromJoin;

        // Update daily reward button
        const claimBtn = document.getElementById('claimRewardBtn');
        if (this.userData.dailyRewardClaimed) {
            claimBtn.disabled = true;
            claimBtn.textContent = 'আজ Already Claimed';
            document.getElementById('rewardMessage').textContent = 'আগামীকাল আবার চেষ্টা করুন!';
        } else {
            claimBtn.disabled = false;
            claimBtn.textContent = 'রিওয়ার্ড নিন';
            document.getElementById('rewardMessage').textContent = 'দৈনিক রিওয়ার্ড উপলব্ধ!';
        }
    }

    watchAd() {
        if (this.demoMode) {
            this.addBalance(0.02, 'এড দেখার রিওয়ার্ড');
            return;
        }

        // Real ad implementation would go here
        console.log('Showing ad...');
    }

    showAd(type) {
        if (this.demoMode) {
            this.addBalance(0.02, `${type} এড রিওয়ার্ড`);
            return;
        }

        // Real ad implementation
        console.log(`Showing ${type} ad...`);
    }

    claimDailyReward() {
        if (this.userData.dailyRewardClaimed) {
            alert('আপনি ইতিমধ্যে আজকের রিওয়ার্ড নিয়েছেন!');
            return;
        }

        this.addBalance(0.50, 'দৈনিক রিওয়ার্ড');
        this.userData.dailyRewardClaimed = true;
        this.updateUI();
    }

    addBalance(amount, reason) {
        this.userData.balance += amount;
        this.userData.totalEarned += amount;
        this.updateUI();
        
        alert(`✅ ${reason}\n+${amount} ISLM যোগ হয়েছে!\nনতুন ব্যালেন্স: ${this.userData.balance.toFixed(2)} ISLM`);
    }

    copyReferralLink() {
        const linkInput = document.getElementById('referralLink');
        linkInput.select();
        document.execCommand('copy');
        alert('রেফারেল লিংক কপি হয়েছে! 📋');
    }

    submitWithdrawal() {
        const amount = parseFloat(document.getElementById('withdrawAmount').value);
        const method = document.getElementById('withdrawMethod').value;

        if (!amount || amount < 28) {
            alert('সর্বনিম্ন 28 ISLM উত্তোলন করতে হবে!');
            return;
        }

        if (amount > this.userData.balance) {
            alert('পর্যাপ্ত ব্যালেন্স নেই!');
            return;
        }

        if (!method) {
            alert('উত্তোলনের পদ্ধতি নির্বাচন করুন!');
            return;
        }

        // In real app, submit to server
        alert(`✅ উত্তোলন রিকোয়েস্ট জমা হয়েছে!\nপরিমাণ: ${amount} ISLM\nপদ্ধতি: ${method}`);
        
        // Reset form
        document.getElementById('withdrawForm').reset();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DivineRizqApp();
});
