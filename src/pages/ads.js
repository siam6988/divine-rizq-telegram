// Ads Page - যেখানে শুধু টাকা কামাই! 🤑
export function render() {
    return `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">বিজ্ঞাপন দেখে ইনকাম</h1>
                <p class="page-subtitle">বসে বসে টাকা কামান! 💰</p>
            </div>

            <!-- Daily Ads Limit -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📊 আজকের স্ট্যাটাস</h3>
                    <span class="task-reward" id="adsToday">0/10</span>
                </div>
                <div class="task-progress">
                    <div class="progress-bar" id="adsProgress" style="width: 0%"></div>
                </div>
                <p>আজ আপনি <strong id="adsLeft">10</strong>টি ads দেখতে পারেন</p>
            </div>

            <!-- Quick Earn Section - Fast Money! ⚡ -->
            <div class="card">
                <h3 class="card-title">⚡ কুইক আর্ন</h3>
                <p>একটি ads দেখেই পেয়ে যান <strong>0.5 ISLM</strong>!</p>
                <button class="btn" id="quickEarnBtn" style="margin-top: 1rem; width: 100%;">
                    🎯 এখনই 0.5 ISLM আর্ন করুন
                </button>
            </div>

            <!-- Bonus Earn Section - Extra Money! 🎁 -->
            <div class="card">
                <h3 class="card-title">🎁 বোনাস আর্ন</h3>
                <p>বিশেষ ads দেখে পেয়ে যান <strong>1.0 ISLM</strong> বোনাস!</p>
                <button class="btn btn-secondary" id="bonusEarnBtn" style="margin-top: 1rem; width: 100%;">
                    🎁 1.0 ISLM বোনাস নিন
                </button>
            </div>

            <!-- Auto Ads Section - Passive Income! 🤖 -->
            <div class="card">
                <h3 class="card-title">🤖 অটো আর্ন</h3>
                <p>অটোমেটিক ads দেখে আর্ন করুন (প্রতি ৩০ মিনিটে)</p>
                <button class="btn btn-outline" id="autoAdsBtn" style="margin-top: 1rem; width: 100%;">
                    🔄 অটো আর্ন চালু করুন
                </button>
            </div>

            <!-- Earnings History -->
            <div class="card">
                <h3 class="card-title">💵 আজকের আর্নিং</h3>
                <div id="todayEarnings">
                    <p style="text-align: center; color: #666; padding: 1rem;">
                        আজまだ কোনো আর্নিং নেই
                    </p>
                </div>
            </div>

            <!-- Pro Tip -->
            <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <h3>💡 প্রো টিপ</h3>
                <p>দিনে ১০টি ads দেখে আর্ন করুন <strong>৫ ISLM</strong> পর্যন্ত!</p>
                <small>⚡ প্রতিটি ads মাত্র ৩০ সেকেন্ড!</small>
            </div>
        </div>
    `;
}

export async function afterRender() {
    await setupAdsEventListeners();
    await loadAdsStatus();
}

async function setupAdsEventListeners() {
    // Quick Earn Button - Fast Cash! 💰
    document.getElementById('quickEarnBtn').addEventListener('click', async () => {
        const btn = document.getElementById('quickEarnBtn');
        btn.innerHTML = '⏳ Ads লোড হচ্ছে...';
        btn.disabled = true;

        try {
            await monetagAds.quickEarn();
            await awardEarnings(0.5, 'quick_earn');
            btn.innerHTML = '✅ 0.5 ISLM আর্ন করা হয়েছে!';
            
            // 2 second পরে reset
            setTimeout(() => {
                btn.innerHTML = '🎯 এখনই 0.5 ISLM আর্ন করুন';
                btn.disabled = false;
            }, 2000);
            
        } catch (error) {
            btn.innerHTML = '❌ Ads দেখা হয়নি। আবার চেষ্টা করুন!';
            btn.disabled = false;
        }
    });

    // Bonus Earn Button - Extra Cash! 🎁
    document.getElementById('bonusEarnBtn').addEventListener('click', async () => {
        const btn = document.getElementById('bonusEarnBtn');
        btn.innerHTML = '⏳ বোনাস Ads লোড হচ্ছে...';
        btn.disabled = true;

        try {
            await monetagAds.bonusEarn();
            await awardEarnings(1.0, 'bonus_earn');
            btn.innerHTML = '✅ 1.0 ISLM বোনাস আর্ন করা হয়েছে!';
            
            setTimeout(() => {
                btn.innerHTML = '🎁 1.0 ISLM বোনাস নিন';
                btn.disabled = false;
            }, 2000);
            
        } catch (error) {
            btn.innerHTML = '❌ বোনাস Ads দেখা হয়নি';
            btn.disabled = false;
        }
    });

    // Auto Ads Button - Passive Income! 🤖
    document.getElementById('autoAdsBtn').addEventListener('click', () => {
        startAutoAds();
    });
}

async function awardEarnings(amount, type) {
    try {
        const app = window.divineRizQApp;
        const userId = app?.getUser()?.uid;
        
        if (!userId) {
            alert('⚠️ লগইন করুন প্রথমে!');
            return;
        }

        // Update wallet in Firebase
        const walletRef = doc(db, 'wallet', userId);
        const walletSnap = await getDoc(walletRef);
        
        const currentBalance = walletSnap.exists() ? walletSnap.data().balance : 0;
        const newBalance = currentBalance + amount;
        
        await setDoc(walletRef, {
            balance: newBalance,
            lastUpdated: new Date()
        }, { merge: true });

        // Record earnings history
        const historyRef = doc(db, 'earningsHistory', `${userId}_${Date.now()}`);
        await setDoc(historyRef, {
            userId,
            amount,
            type: type,
            timestamp: new Date()
        });

        // Update ads count for today
        await updateAdsCount(userId);

        // Show success message
        showEarningMessage(amount);
        
        // Reload status
        await loadAdsStatus();

    } catch (error) {
        console.error('Error awarding earnings:', error);
        alert('💰 টাকা add করতে সমস্যা! আবার চেষ্টা করুন।');
    }
}

function showEarningMessage(amount) {
    // Create a floating earning message 🎉
    const message = document.createElement('div');
    message.innerHTML = `🎉 +${amount} ISLM আর্ন করা হয়েছে!`;
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #0a5c36, #d4af37);
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        font-weight: bold;
        font-size: 1.2rem;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        animation: bounceIn 0.5s ease-out;
    `;
    
    document.body.appendChild(message);
    
    // Remove after 2 seconds
    setTimeout(() => {
        message.remove();
    }, 2000);
}

async function loadAdsStatus() {
    try {
        const app = window.divineRizQApp;
        const userId = app?.getUser()?.uid;
        
        if (!userId) return;

        // Get today's ads count from Firebase
        const today = new Date().toDateString();
        const adsRef = doc(db, 'adsHistory', `${userId}_${today}`);
        const adsSnap = await getDoc(adsRef);
        
        const adsCount = adsSnap.exists() ? adsSnap.data().count : 0;
        const maxAds = 10;
        const adsLeft = maxAds - adsCount;
        
        // Update UI
        document.getElementById('adsToday').textContent = `${adsCount}/${maxAds}`;
        document.getElementById('adsLeft').textContent = adsLeft;
        document.getElementById('adsProgress').style.width = `${(adsCount / maxAds) * 100}%`;
        
        // Disable buttons if limit reached
        if (adsCount >= maxAds) {
            document.getElementById('quickEarnBtn').disabled = true;
            document.getElementById('bonusEarnBtn').disabled = true;
            document.getElementById('quickEarnBtn').innerHTML = '❌ আজকের লিমিট শেষ!';
            document.getElementById('bonusEarnBtn').innerHTML = '❌ আগামীকাল আবার চেষ্টা করুন!';
        }
        
        // Load today's earnings
        await loadTodayEarnings(userId);

    } catch (error) {
        console.error('Error loading ads status:', error);
    }
}

async function updateAdsCount(userId) {
    const today = new Date().toDateString();
    const adsRef = doc(db, 'adsHistory', `${userId}_${today}`);
    const adsSnap = await getDoc(adsRef);
    
    const currentCount = adsSnap.exists() ? adsSnap.data().count : 0;
    const newCount = currentCount + 1;
    
    await setDoc(adsRef, {
        count: newCount,
        date: today,
        lastUpdated: new Date()
    }, { merge: true });
}

async function loadTodayEarnings(userId) {
    try {
        const today = new Date().toDateString();
        const earningsRef = collection(db, 'earningsHistory');
        const q = query(
            earningsRef, 
            where('userId', '==', userId),
            where('timestamp', '>=', new Date(today))
        );
        
        const snapshot = await getDocs(q);
        const todayEarnings = snapshot.docs.map(doc => doc.data());
        
        const totalEarnings = todayEarnings.reduce((sum, earning) => sum + earning.amount, 0);
        
        document.getElementById('todayEarnings').innerHTML = `
            <div style="text-align: center; padding: 1rem;">
                <div style="font-size: 2rem; font-weight: bold; color: var(--secondary-gold);">
                    ${totalEarnings.toFixed(2)} ISLM
                </div>
                <p>আজকের মোট আর্নিং</p>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading today earnings:', error);
    }
}

function startAutoAds() {
    const btn = document.getElementById('autoAdsBtn');
    btn.innerHTML = '🤖 অটো আর্ন চালু... (৩০ মিনিট পর ads)';
    btn.disabled = true;
    
    // Schedule auto ads every 30 minutes
    setInterval(async () => {
        try {
            await monetagAds.showInAppInterstitial();
            await awardEarnings(0.25, 'auto_earn');
        } catch (error) {
            console.log('Auto ad skipped or failed');
        }
    }, 30 * 60 * 1000); // 30 minutes
    
    // Show first ad after 1 minute
    setTimeout(async () => {
        try {
            await monetagAds.showInAppInterstitial();
            await awardEarnings(0.25, 'auto_earn');
        } catch (error) {
            console.log('First auto ad failed');
        }
    }, 60000);
}
