// Ads Page Component
async function loadAdsPage() {
    const availableAds = await getAvailableAds();
    
    return `
        <div class="page active" id="ads-page">
            <div class="card">
                <h2 class="card-title">📺 বিজ্ঞাপন দেখে আয় করুন</h2>
                <p>বিজ্ঞাপন দেখে সহজেই আয় করুন। প্রতিটি বিজ্ঞাপনের জন্য পাবেন 0.5 - 2 ISLM</p>
            </div>

            <!-- Ads Stats -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${await getTodayAdCount()}</div>
                    <div class="stat-label">আজকের এড</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${await getTotalAdEarnings()} ISLM</div>
                    <div class="stat-label">এড থেকে আয়</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${await getAvailableAdCount()}</div>
                    <div class="stat-label">উপলব্ধ এড</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">∞</div>
                    <div class="stat-label">দৈনিক লিমিট</div>
                </div>
            </div>

            <!-- Available Ads -->
            <div class="card">
                <h3 class="card-title">🎬 উপলব্ধ বিজ্ঞাপন</h3>
                <div id="ads-list">
                    ${await renderAdsList(availableAds)}
                </div>
            </div>

            <!-- Ad Rules -->
            <div class="card">
                <h3 class="card-title">📝 বিজ্ঞাপন নিয়ম</h3>
                <ul style="padding-left: 1.5rem;">
                    <li>বিজ্ঞাপন সম্পূর্ণ দেখতে হবে</li>
                    <li>Skip করা যাবে না</li>
                    <li>প্রতিদিন unlimited বিজ্ঞাপন দেখতে পারবেন</li>
                    <li>প্রতিটি বিজ্ঞাপন 15-30 সেকেন্ডের</li>
                    <li>Reward automatically যোগ হবে</li>
                </ul>
            </div>

            <!-- Monetag Ad Script Integration -->
            <div class="card text-center">
                <h3 class="text-green">💫 Premium Ads</h3>
                <p>নিচের বিজ্ঞাপনগুলো দেখে বেশি আয় করুন</p>
                <div id="monetag-ads-container" style="min-height: 300px; display: flex; justify-content: center; align-items: center; background: #f8f9fa; border-radius: 10px; margin: 1rem 0;">
                    <p>Premium ads loading...</p>
                </div>
                <button class="btn btn-gold" onclick="loadPremiumAds()">
                    🔄 Premium Ads লোড করুন
                </button>
            </div>
        </div>
    `;
}

async function getAvailableAds() {
    // Mock data - In production, fetch from Firebase
    return [
        {
            id: 'ad_1',
            title: 'Mobile App Promotion',
            description: '15 second video ad about new mobile app',
            duration: 15,
            reward: 0.5,
            type: 'video'
        },
        {
            id: 'ad_2',
            title: 'E-commerce Website',
            description: 'Website promotion ad - 20 seconds',
            duration: 20,
            reward: 0.8,
            type: 'video'
        },
        {
            id: 'ad_3',
            title: 'Product Review',
            description: 'Watch product review and get reward',
            duration: 30,
            reward: 1.2,
            type: 'video'
        },
        {
            id: 'ad_4',
            title: 'Brand Awareness',
            description: '25 second brand promotion video',
            duration: 25,
            reward: 1.0,
            type: 'video'
        }
    ];
}

async function renderAdsList(ads) {
    if (ads.length === 0) {
        return '<p>🚫 এখন কোন বিজ্ঞাপন উপলব্ধ নেই</p>';
    }

    let html = '';
    ads.forEach(ad => {
        html += `
            <div class="task-card">
                <div class="task-header">
                    <div class="task-title">${ad.title}</div>
                    <div class="task-reward">+${ad.reward} ISLM</div>
                </div>
                
                <div class="task-description">
                    ${ad.description}
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <small><strong>সময়:</strong> ${ad.duration} সেকেন্ড</small>
                    <small><strong>ধরণ:</strong> ${ad.type === 'video' ? 'ভিডিও' : 'ব্যানার'}</small>
                </div>
                
                <div class="text-center mt-1">
                    <button class="btn btn-gold" onclick="watchAd('${ad.id}')">
                        📺 বিজ্ঞাপন দেখুন
                    </button>
                </div>
            </div>
        `;
    });
    return html;
}

async function getTodayAdCount() {
    const user = window.currentUser;
    if (!user) return 0;
    
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const snapshot = await db.collection('activities')
            .where('userId', '==', user.uid)
            .where('type', '==', 'ad_reward')
            .where('timestamp', '>=', today)
            .get();
        
        return snapshot.size;
    } catch (error) {
        return 0;
    }
}

async function getTotalAdEarnings() {
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

async function getAvailableAdCount() {
    const ads = await getAvailableAds();
    return ads.length;
}

async function watchAd(adId) {
    const user = window.currentUser;
    if (!user) {
        alert('লগইন প্রয়োজন');
        return;
    }
    
    // Mock ad watching process
    const ad = (await getAvailableAds()).find(a => a.id === adId);
    if (!ad) return;
    
    // Show ad watching screen
    document.getElementById('ads-page').innerHTML = `
        <div class="card text-center">
            <h2 class="text-green">📺 বিজ্ঞাপন দেখছেন</h2>
            <div style="background: #000; color: white; padding: 2rem; border-radius: 10px; margin: 1rem 0;">
                <h3>${ad.title}</h3>
                <p>বিজ্ঞাপন চলছে... ${ad.duration} সেকেন্ড</p>
                <div class="loader" style="margin: 1rem auto;"></div>
            </div>
            <p>দয়া করে বিজ্ঞাপনটি সম্পূর্ণ দেখুন</p>
            <button class="btn" onclick="cancelAdWatch()" style="background: #dc3545;">
                ❌ বাতিল করুন
            </button>
        </div>
    `;
    
    // Simulate ad completion after duration
    setTimeout(async () => {
        await completeAdWatch(ad);
    }, ad.duration * 1000);
}

async function completeAdWatch(ad) {
    const user = window.currentUser;
    
    try {
        // Update user balance
        await updateUserBalance(user.uid, ad.reward, 'ad_reward');
        
        // Add activity
        await db.collection('activities').add({
            userId: user.uid,
            title: `বিজ্ঞাপন: ${ad.title}`,
            reward: ad.reward,
            type: 'ad_reward',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Show success message
        alert(`🎉 ${ad.reward} ISLM পেয়েছেন! বিজ্ঞাপন দেখার জন্য ধন্যবাদ।`);
        window.navigateTo('ads');
        
    } catch (error) {
        console.error('Error completing ad watch:', error);
        alert('বিজ্ঞাপন reward দিতে সমস্যা হচ্ছে।');
    }
}

function cancelAdWatch() {
    if (confirm('বিজ্ঞাপন দেখানো বাতিল করবেন? আপনি reward পাবেন না।')) {
        window.navigateTo('ads');
    }
}

function loadPremiumAds() {
    // Monetag ad integration
    const container = document.getElementById('monetag-ads-container');
    container.innerHTML = `
        <div style="text-align: center;">
            <h4>Premium Ads</h4>
            <p>এই বিভাগে Monetag এর premium ads show হবে</p>
            <small>Ad integration code এখানে যোগ করতে হবে</small>
        </div>
    `;
    
    // In production, add Monetag script here
    console.log('Loading premium ads...');
}
