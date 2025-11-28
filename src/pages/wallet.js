// Wallet Page Component
async function loadWalletPage() {
    const userData = await getUserData(window.currentUser.uid);
    const transactions = await getRecentTransactions();
    
    return `
        <div class="page active" id="wallet-page">
            <div class="card text-center">
                <h2 class="text-gold">💰 আপনার ওয়ালেট</h2>
                <div style="font-size: 2.5rem; font-weight: bold; color: var(--primary-green); margin: 1rem 0;">
                    ${userData.balance || 0} ISLM
                </div>
                <p>বর্তমান ব্যালেন্স</p>
            </div>

            <!-- Quick Actions -->
            <div class="card">
                <h3 class="card-title">দ্রুত একশন</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <button class="btn btn-gold" onclick="window.navigateTo('withdraw')">
                        💳 উত্তোলন
                    </button>
                    <button class="btn" onclick="window.navigateTo('tasks')">
                        📋 আরো টাস্ক করুন
                    </button>
                    <button class="btn" onclick="window.navigateTo('ads')">
                        📺 এড দেখুন
                    </button>
                    <button class="btn" onclick="window.navigateTo('referral')">
                        👥 রেফারেল দিন
                    </button>
                </div>
            </div>

            <!-- Earnings Breakdown -->
            <div class="card">
                <h3 class="card-title">📊 আয়ের বিবরণ</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; text-align: center;">
                    <div>
                        <div style="font-size: 1.2rem; font-weight: bold; color: var(--primary-green);">
                            ${await getTaskEarnings()} ISLM
                        </div>
                        <div style="font-size: 0.8rem;">টাস্ক থেকে</div>
                    </div>
                    <div>
                        <div style="font-size: 1.2rem; font-weight: bold; color: var(--gold);">
                            ${await getAdEarnings()} ISLM
                        </div>
                        <div style="font-size: 0.8rem;">এড থেকে</div>
                    </div>
                    <div>
                        <div style="font-size: 1.2rem; font-weight: bold; color: var(--light-green);">
                            ${await getReferralEarnings()} ISLM
                        </div>
                        <div style="font-size: 0.8rem;">রেফারেল থেকে</div>
                    </div>
                    <div>
                        <div style="font-size: 1.2rem; font-weight: bold; color: var(--light-gold);">
                            ${await getDailyRewardEarnings()} ISLM
                        </div>
                        <div style="font-size: 0.8rem;">দৈনিক রিওয়ার্ড</div>
                    </div>
                </div>
            </div>

            <!-- Recent Transactions -->
            <div class="card">
                <h3 class="card-title">🔄 সাম্প্রতিক লেনদেন</h3>
                <div id="transactions-list">
                    ${transactions}
                </div>
            </div>

            <!-- Withdrawal Info -->
            <div class="card">
                <h3 class="card-title">💡 উত্তোলন তথ্য</h3>
                <ul style="padding-left: 1.5rem;">
                    <li>ন্যূনতম উত্তোলন: <strong>28 ISLM</strong></li>
                    <li>উত্তোলন ফি: <strong>0%</strong> (প্রথম উত্তোলনে)</li>
                    <li>প্রক্রিয়াকরণ সময়: <strong>24-48 ঘন্টা</strong></li>
                    <li>রেফারেল কমিশন: <strong>10%</strong> প্রথম উত্তোলনে</li>
                </ul>
                <button class="btn btn-block mt-1" onclick="window.navigateTo('withdraw')">
                    💳 এখনই উত্তোলন করুন
                </button>
            </div>
        </div>
    `;
}

async function getRecentTransactions() {
    const user = window.currentUser;
    if (!user) return '<p>লগইন প্রয়োজন</p>';
    
    try {
        const snapshot = await db.collection('activities')
            .where('userId', '==', user.uid)
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();
        
        if (snapshot.empty) {
            return '<p>এখনও কোন লেনদেন নেই</p>';
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const transaction = doc.data();
            const isPositive = transaction.reward > 0;
            const sign = isPositive ? '+' : '';
            const color = isPositive ? 'var(--primary-green)' : 'var(--gold)';
            
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #f0f0f0;">
                    <div>
                        <div style="font-weight: 500;">${transaction.title}</div>
                        <small style="color: #666;">${transaction.timestamp?.toDate().toLocaleDateString('bn-BD')}</small>
                    </div>
                    <div style="color: ${color}; font-weight: bold;">
                        ${sign}${transaction.reward} ISLM
                    </div>
                </div>
            `;
        });
        return html;
    } catch (error) {
        return '<p>লেনদেন লোড করতে সমস্যা</p>';
    }
}

async function getTaskEarnings() {
    const user = window.currentUser;
    if (!user) return 0;
    
    try {
        const snapshot = await db.collection('activities')
            .where('userId', '==', user.uid)
            .where('type', '==', 'task_reward')
            .get();
        
        let total = 0;
        snapshot.forEach(doc => {
            total += doc.data().reward || 0;
        });
        return total;
    } catch (error) {
        return 0;
    }
}

async function getAdEarnings() {
    const user = window.currentUser;
    if (!user) return 0;
    
    try {
        const snapshot = await db.collection('activities')
            .where('userId', '==', user.uid)
            .where('type', '==', 'ad_reward')
            .get();
        
        let total = 0;
        snapshot.forEach(doc => {
            total += doc.data().reward || 0;
        });
        return total;
    } catch (error) {
        return 0;
    }
}

async function getReferralEarnings() {
    const user = window.currentUser;
    if (!user) return 0;
    
    try {
        const snapshot = await db.collection('activities')
            .where('userId', '==', user.uid)
            .where('type', '==', 'referral_commission')
            .get();
        
        let total = 0;
        snapshot.forEach(doc => {
            total += doc.data().reward || 0;
        });
        return total;
    } catch (error) {
        return 0;
    }
}

async function getDailyRewardEarnings() {
    const user = window.currentUser;
    if (!user) return 0;
    
    try {
        const snapshot = await db.collection('activities')
            .where('userId', '==', user.uid)
            .where('type', '==', 'daily_reward')
            .get();
        
        let total = 0;
        snapshot.forEach(doc => {
            total += doc.data().reward || 0;
        });
        return total;
    } catch (error) {
        return 0;
    }
}
