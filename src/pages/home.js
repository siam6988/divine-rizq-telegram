// Home Page Component
async function loadHomePage() {
    const user = window.currentUser;
    let userData = {};
    
    if (user) {
        userData = await getUserData(user.uid);
    }
    
    return `
        <div class="page active" id="home-page">
            <div class="text-center mb-2">
                <h1 class="text-green">🕌 Divine RizQ</h1>
                <p class="text-gold">হালাল আয়ের ইসলামিক প্ল্যাটফর্ম</p>
            </div>

            <!-- User Stats -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${userData.balance || 0} ISLM</div>
                    <div class="stat-label">বর্তমান ব্যালেন্স</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${userData.totalEarned || 0} ISLM</div>
                    <div class="stat-label">মোট আয়</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${userData.completedTasks || 0}</div>
                    <div class="stat-label">সম্পন্ন টাস্ক</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${userData.referralCount || 0}</div>
                    <div class="stat-label">রেফারেল</div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="card">
                <h3 class="card-title">দ্রুত একশন</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <button class="btn btn-gold" onclick="window.navigateTo('tasks')">
                        📋 টাস্ক করুন
                    </button>
                    <button class="btn btn-gold" onclick="window.navigateTo('ads')">
                        📺 এড দেখুন
                    </button>
                    <button class="btn" onclick="window.navigateTo('referral')">
                        👥 রেফারেল দিন
                    </button>
                    <button class="btn" onclick="window.navigateTo('withdraw')">
                        💳 উত্তোলন করুন
                    </button>
                </div>
            </div>

            <!-- Daily Reward -->
            <div class="card">
                <h3 class="card-title">📅 দৈনিক রিওয়ার্ড</h3>
                <div id="daily-reward-status">
                    ${await getDailyRewardStatus()}
                </div>
                <button class="btn btn-block mt-1" onclick="claimDailyReward()" id="daily-reward-btn">
                    দৈনিক রিওয়ার্ড নিন
                </button>
            </div>

            <!-- Recent Activities -->
            <div class="card">
                <h3 class="card-title">🔄 সাম্প্রতিক একটিভিটি</h3>
                <div id="recent-activities">
                    ${await getRecentActivities()}
                </div>
            </div>

            <!-- App Info -->
            <div class="card text-center">
                <h3 class="text-green">💫 Divine RizQ সম্পর্কে</h3>
                <p>হালাল উপায়ে আয় করুন, ইসলামিক মূল্যবোধ নিয়ে এগিয়ে যান। টাস্ক সম্পন্ন করুন, এড দেখুন এবং রেফারেল দিয়ে আয় করুন।</p>
                <div class="mt-1">
                    <small class="text-gold">শুরু করেছেন: ${userData.joinedAt ? new Date(userData.joinedAt.toDate()).toLocaleDateString('bn-BD') : 'আজ'}</small>
                </div>
            </div>
        </div>
    `;
}

async function getUserData(uid) {
    try {
        const doc = await db.collection('users').doc(uid).get();
        return doc.exists ? doc.data() : {};
    } catch (error) {
        console.error('Error getting user data:', error);
        return {};
    }
}

async function getDailyRewardStatus() {
    const user = window.currentUser;
    if (!user) return '<p>লগইন প্রয়োজন</p>';
    
    try {
        const today = new Date().toDateString();
        const rewardDoc = await db.collection('dailyRewards').doc(user.uid).get();
        
        if (rewardDoc.exists && rewardDoc.data().lastClaim === today) {
            return '<p class="text-green">✅ আজকের রিওয়ার্ড already collected!</p>';
        }
        
        return '<p>🎁 আজকের দৈনিক রিওয়ার্ড উপলব্ধ: <strong>2 ISLM</strong></p>';
    } catch (error) {
        return '<p>রিওয়ার্ড status check করতে সমস্যা হচ্ছে</p>';
    }
}

async function getRecentActivities() {
    const user = window.currentUser;
    if (!user) return '<p>লগইন প্রয়োজন</p>';
    
    try {
        const activities = await db.collection('activities')
            .where('userId', '==', user.uid)
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();
        
        if (activities.empty) {
            return '<p>এখনও কোন activity নেই</p>';
        }
        
        let html = '';
        activities.forEach(doc => {
            const activity = doc.data();
            html += `
                <div style="padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0;">
                    <strong>${activity.title}</strong>
                    <div style="display: flex; justify-content: space-between;">
                        <small>+${activity.reward} ISLM</small>
                        <small>${activity.timestamp?.toDate().toLocaleDateString('bn-BD')}</small>
                    </div>
                </div>
            `;
        });
        return html;
    } catch (error) {
        return '<p>Activities load করতে সমস্যা</p>';
    }
}

async function claimDailyReward() {
    const user = window.currentUser;
    if (!user) return;
    
    const today = new Date().toDateString();
    const rewardAmount = 2;
    
    try {
        const rewardDoc = await db.collection('dailyRewards').doc(user.uid).get();
        
        if (rewardDoc.exists && rewardDoc.data().lastClaim === today) {
            alert('আপনি ইতিমধ্যে আজকের রিওয়ার্ড collected করেছেন!');
            return;
        }
        
        // Update daily reward
        await db.collection('dailyRewards').doc(user.uid).set({
            lastClaim: today,
            streak: rewardDoc.exists ? rewardDoc.data().streak + 1 : 1
        });
        
        // Update user balance
        await updateUserBalance(user.uid, rewardAmount, 'daily_reward');
        
        // Add activity
        await db.collection('activities').add({
            userId: user.uid,
            title: 'দৈনিক রিওয়ার্ড',
            reward: rewardAmount,
            type: 'daily_reward',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert(`🎉 ${rewardAmount} ISLM দৈনিক রিওয়ার্ড collected!`);
        window.navigateTo('home');
        
    } catch (error) {
        console.error('Error claiming daily reward:', error);
        alert('রিওয়ার্ড claim করতে সমস্যা হচ্ছে।');
    }
}
