// Home Page Component
// এই ফাইলে হোম পেজের UI এবং functionality ইমপ্লিমেন্ট করা হয়েছে

import { apiService } from '../utils/api.js';
import { monetagAds } from '../utils/api.js';

export function render() {
    return `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">Divine RizQ</h1>
                <p class="page-subtitle">আপনার রিজিক বৃদ্ধির মাধ্যম</p>
            </div>

            <!-- User Stats -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" id="balance">0.00 ISLM</div>
                    <div class="stat-label">ব্যালেন্স</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="completedTasks">0</div>
                    <div class="stat-label">সম্পন্ন টাস্ক</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="referralCount">0</div>
                    <div class="stat-label">রেফারেল</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="dailyReward">0</div>
                    <div class="stat-label">দৈনিক রিওয়ার্ড</div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="card">
                <h3 class="card-title">দ্রুত একশন</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem;">
                    <button class="btn" onclick="router.navigate('#tasks')">
                        টাস্ক করুন
                    </button>
                    <button class="btn btn-secondary" onclick="router.navigate('#ads')">
                        বিজ্ঞাপন দেখুন
                    </button>
                    <button class="btn btn-outline" onclick="router.navigate('#referral')">
                        রেফারেল দিন
                    </button>
                    <button class="btn btn-outline" onclick="router.navigate('#withdraw')">
                        উত্তোলন করুন
                    </button>
                </div>
            </div>

            <!-- Daily Reward Section -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">দৈনিক রিওয়ার্ড</h3>
                    <span id="rewardStatus" class="task-reward">প্রাপ্তি</span>
                </div>
                <div class="task-progress">
                    <div class="progress-bar" id="rewardProgress" style="width: 0%"></div>
                </div>
                <p>লগইন করুন ৭ দিন ধরে এবং আনলক করুন বিশেষ রিওয়ার্ড!</p>
                <button class="btn" id="claimRewardBtn" style="margin-top: 1rem;">
                    রিওয়ার্ড নিন
                </button>
            </div>

            <!-- Recent Activity -->
            <div class="card">
                <h3 class="card-title">সাম্প্রতিক এক্টিভিটি</h3>
                <div id="recentActivity">
                    <p style="text-align: center; color: #666; padding: 2rem;">
                        কোনো এক্টিভিটি নেই
                    </p>
                </div>
            </div>
        </div>
    `;
}

export async function afterRender() {
    await loadUserStats();
    await setupEventListeners();
    await loadRecentActivity();
}

async function loadUserStats() {
    try {
        const app = window.divineRizQApp;
        const userId = app?.getUser()?.uid;
        
        if (!userId) {
            // Redirect to login if not authenticated
            router.navigate('#login');
            return;
        }

        // Load wallet balance
        const walletData = await apiService.getWalletBalance(userId);
        document.getElementById('balance').textContent = `${walletData.balance || '0.00'} ISLM`;

        // Load task statistics
        const taskProgress = await apiService.getTaskProgress(userId);
        const completedTasks = taskProgress.filter(task => task.status === 'completed').length;
        document.getElementById('completedTasks').textContent = completedTasks;

        // Load referral data
        const referralData = await apiService.getReferralData(userId);
        document.getElementById('referralCount').textContent = referralData.count || 0;

        // Load daily reward status
        updateDailyRewardStatus();

    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}

async function setupEventListeners() {
    // Daily reward claim button
    document.getElementById('claimRewardBtn').addEventListener('click', claimDailyReward);
}

async function claimDailyReward() {
    try {
        const app = window.divineRizQApp;
        const userId = app?.getUser()?.uid;
        
        if (!userId) return;

        // Show ad before reward
        await monetagAds.showRewardedAd();
        
        // Claim reward
        const result = await apiService.recordAdView(userId, 'daily_reward');
        
        if (result.success) {
            // Update UI
            updateDailyRewardStatus();
            
            // Show success message
            alert('দৈনিক রিওয়ার্ড সফলভাবে নেওয়া হয়েছে!');
            
            // Reload stats
            await loadUserStats();
        }
        
    } catch (error) {
        console.error('Error claiming daily reward:', error);
        alert('রিওয়ার্ড নিতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।');
    }
}

function updateDailyRewardStatus() {
    // This would typically come from backend
    const rewardStatus = document.getElementById('rewardStatus');
    const progressBar = document.getElementById('rewardProgress');
    const claimBtn = document.getElementById('claimRewardBtn');
    
    // Mock data - replace with actual data from backend
    const currentDay = 3; // Example: user is on day 3
    const totalDays = 7;
    const progress = (currentDay / totalDays) * 100;
    
    progressBar.style.width = `${progress}%`;
    
    if (currentDay >= totalDays) {
        rewardStatus.textContent = 'প্রাপ্তি';
        claimBtn.disabled = false;
        claimBtn.textContent = 'রিওয়ার্ড নিন';
    } else {
        rewardStatus.textContent = `${currentDay}/${totalDays} দিন`;
        claimBtn.disabled = true;
        claimBtn.textContent = 'চলমান...';
    }
}

async function loadRecentActivity() {
    try {
        const app = window.divineRizQApp;
        const userId = app?.getUser()?.uid;
        
        if (!userId) return;

        // Load recent activities from backend
        const activities = await apiService.getRecentActivity(userId);
        const activityContainer = document.getElementById('recentActivity');
        
        if (activities.length === 0) {
            activityContainer.innerHTML = `
                <p style="text-align: center; color: #666; padding: 2rem;">
                    কোনো এক্টিভিটি নেই
                </p>
            `;
            return;
        }
        
        activityContainer.innerHTML = activities.map(activity => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0;">
                <div>
                    <strong>${activity.description}</strong>
                    <br>
                    <small style="color: #666;">${new Date(activity.timestamp).toLocaleDateString('bn-BD')}</small>
                </div>
                <span style="color: var(--secondary-gold); font-weight: bold;">
                    +${activity.amount} ISLM
                </span>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading recent activity:', error);
    }
}
