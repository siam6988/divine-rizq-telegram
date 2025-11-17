// Monetag Ads Integration - Chill Version 😎
class MonetagAds {
    constructor() {
        this.initialized = false;
        this.adUnitId = '10076761'; // তোমার Ad Unit ID
    }

    init() {
        if (this.initialized || !window.show_10076761) return;
        
        this.initialized = true;
        console.log('🎯 Monetag ads ready to make money!');
    }

    // Rewarded Interstitial - টাকা কামাইয়ের মূল হাতিয়ার! 💰
    showRewardedInterstitial() {
        return new Promise((resolve, reject) => {
            if (!this.initialized) {
                reject(new Error('Ads system not ready!'));
                return;
            }

            show_10076761()
                .then(() => {
                    console.log('🎉 User watched rewarded ad! Pay him!');
                    resolve('reward_earned');
                })
                .catch(error => {
                    console.log('😒 User skipped or ad failed');
                    reject(error);
                });
        });
    }

    // Rewarded Popup - আরেকটি টাকা কামাইয়ের উপায়! 🤑
    showRewardedPopup() {
        return new Promise((resolve, reject) => {
            show_10076761('pop')
                .then(() => {
                    console.log('💰 Popup ad completed! Give reward!');
                    resolve('reward_earned');
                })
                .catch(error => {
                    console.log('👎 Popup ad failed');
                    reject(error);
                });
        });
    }

    // In-App Interstitial - Background এ টাকা কামাই! 🏃‍♂️
    showInAppInterstitial() {
        return new Promise((resolve) => {
            show_10076761({
                type: 'inApp',
                inAppSettings: {
                    frequency: 2,
                    capping: 0.1,
                    interval: 30,
                    timeout: 5,
                    everyPage: false
                }
            });
            
            // In-App ads automatically show, so resolve immediately
            resolve('ad_scheduled');
        });
    }

    // Quick Earn Method - Fast Cash! ⚡
    quickEarn() {
        return this.showRewardedInterstitial();
    }

    // Bonus Earn Method - Extra Cash! 🎁
    bonusEarn() {
        return this.showRewardedPopup();
    }
}

export const monetagAds = new MonetagAds();
