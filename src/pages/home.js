// Modern Home Page Component
async function loadHomePage() {
    const user = window.currentUser;
    let userData = {};
    
    if (user) {
        userData = await getUserData(user.uid);
    }
    
    return `
        <div class="page active fade-in" id="home-page">
            <!-- Modern Header -->
            <div class="app-header">
                <div class="header-content">
                    <h1 class="app-title">🕌 Divine RizQ</h1>
                    <p class="app-subtitle">হালাল আয়ের ইসলামিক প্ল্যাটফর্ম</p>
                </div>
            </div>

            <div class="main-content">
                <!-- Balance Display -->
                <div class="balance-display">
                    <div class="balance-label">বর্তমান ব্যালেন্স</div>
                    <div class="balance-amount">${userData.balance || 0} ISLM</div>
                    <div class="balance-label">হালাল উপার্জন</div>
                </div>

                <!-- Quick Stats -->
                <div class="stats-grid-modern">
                    <div class="stat-card-modern">
                        <div class="stat-value-modern">${userData.totalEarned || 0}</div>
                        <div class="stat-label-modern">মোট আয়</div>
                    </div>
                    <div class="stat-card-modern">
                        <div class="stat-value-modern">${userData.completedTasks || 0}</div>
                        <div class="stat-label-modern">টাস্ক</div>
                    </div>
                    <div class="stat-card-modern">
                        <div class="stat-value-modern">${userData.referralCount || 0}</div>
                        <div class="stat-label-modern">রেফারেল</div>
                    </div>
                    <div class="stat-card-modern">
                        <div class="stat-value-modern">${await getTodayEarnings()} ISLM</div>
                        <div class="stat-label-modern">আজকের আয়</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="modern-card">
                    <div class="card-header">
                        <h3 class="card-title">দ্রুত একশন</h3>
                        <div class="card-icon">⚡</div>
                    </div>
                    <div class="quick-actions">
                        <a class="action-btn" onclick="window.navigateTo('tasks')">
                            <span class="action-icon">📋</span>
                            <span class="action-text">টাস্ক করুন</span>
                        </a>
                        <a class="action-btn" onclick="window.navigateTo('ads')">
                            <span class="action-icon">📺</span>
                            <span class="action-text">এড দেখুন</span>
                        </a>
                        <a class="action-btn" onclick="window.navigateTo('referral')">
                            <span class="action-icon">👥</span>
                            <span class="action-text">রেফারেল দিন</span>
                        </a>
                        <a class="action-btn" onclick="window.navigateTo('withdraw')">
                            <span class="action-icon">💳</span>
                            <span class="action-text">উত্তোলন করুন</span>
                        </a>
                    </div>
                </div>

                <!-- Daily Reward -->
                <div class="modern-card">
                    <div class="card-header">
                        <h3 class="card-title">📅 দৈনিক রিওয়ার্ড</h3>
                        <div class="card-icon">🎁</div>
                    </div>
                    <div id="daily-reward-status">
                        ${await getDailyRewardStatus()}
                    </div>
                    <button class="btn-modern btn-block mt-1" onclick="claimDailyReward()" id="daily-reward-btn">
                        🎁 দৈনিক রিওয়ার্ড নিন
                    </button>
                </div>

                <!-- Active Tasks -->
                <div class="modern-card">
                    <div class="card-header">
                        <h3 class="card-title">🔥 একটিভ টাস্ক</h3>
                        <div class="card-icon">🔥</div>
                    </div>
                    <div id="active-tasks">
                        ${await getActiveTasks()}
                    </div>
                </div>

                <!-- Recent Earnings -->
                <div class="modern-card">
                    <div class="card-header">
                        <h3 class="card-title">💰 সাম্প্রতিক আয়</h3>
                        <div class="card-icon">💸</div>
                    </div>
                    <div id="recent-earnings">
                        ${await getRecentEarnings()}
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function getTodayEarnings() {
    const user = window.currentUser;
    if (!user) return 0;
    
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const snapshot = await db.collection('activities')
            .where('userId', '==', user.uid)
            .where('timestamp', '>=', today)
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

async function getActiveTasks() {
    const user = window.currentUser;
    if (!user) return '<p>লগইন প্রয়োজন</p>';
    
    try {
        const snapshot = await db.collection('taskProgress')
            .where('userId', '==', user.uid)
            .where('status', '==', 'in_progress')
            .limit(3)
            .get();
        
        if (snapshot.empty) {
            return `
                <div style="text-align: center; padding: 2rem 1rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📋</div>
                    <p>কোন একটিভ টাস্ক নেই</p>
                    <button class="btn-modern mt-1" onclick="window.navigateTo('tasks')">
                        টাস্ক শুরু করুন
                    </button>
                </div>
            `;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const progress = doc.data();
            html += `
                <div class="task-card-modern">
                    <div class="task-header-modern">
                        <div class="task-title-modern">${progress.taskTitle}</div>
                        <div class="task-reward-modern">+${progress.taskReward} ISLM</div>
                    </div>
                    <div class="progress-modern">
                        <div class="progress-bar-modern" style="width: ${progress.percentage || 0}%"></div>
                    </div>
                    <div style="text-align: center;">
                        <button class="btn-modern" onclick="continueTask('${progress.taskId}')">
                            🔄 চালিয়ে যান (${progress.percentage || 0}%)
                        </button>
                    </div>
                </div>
            `;
        });
        return html;
    } catch (error) {
        return '<p>টাস্ক লোড করতে সমস্যা</p>';
    }
}

async function getRecentEarnings() {
    const user = window.currentUser;
    if (!user) return '<p>লগইন প্রয়োজন</p>';
    
    try {
        const snapshot = await db.collection('activities')
            .where('userId', '==', user.uid)
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();
        
        if (snapshot.empty) {
            return '<p>এখনও কোন আয় নেই</p>';
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const activity = doc.data();
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid #f0f0f0;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 40px; height: 40px; background: var(--gradient-primary); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white;">
                            ${getActivityIcon(activity.type)}
                        </div>
                        <div>
                            <div style="font-weight: 600;">${activity.title}</div>
                            <small style="color: #666;">${activity.timestamp?.toDate().toLocaleDateString('bn-BD')}</small>
                        </div>
                    </div>
                    <div style="color: var(--primary-green); font-weight: 700; font-size: 1.1rem;">
                        +${activity.reward} ISLM
                    </div>
                </div>
            `;
        });
        return html;
    } catch (error) {
        return '<p>আয়ের তথ্য লোড করতে সমস্যা</p>';
    }
}

function getActivityIcon(type) {
    const icons = {
        'task_reward': '📋',
        'ad_reward': '📺',
        'referral_commission': '👥',
        'daily_reward': '🎁',
        'withdrawal': '💳'
    };
    return icons[type] || '💰';
}
