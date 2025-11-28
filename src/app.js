// Divine RizQ - Main Application
class DivineRizQApp {
    constructor() {
        this.currentPage = 'home';
        this.init();
    }

    init() {
        console.log('Divine RizQ App Initializing...');
        
        // Check if Telegram WebApp
        this.detectTelegramWebApp();
        
        // Initialize router
        this.initRouter();
        
        // Load initial page
        this.loadPage(this.currentPage);
    }

    detectTelegramWebApp() {
        if (window.Telegram && window.Telegram.WebApp) {
            console.log('Telegram WebApp detected');
            window.isTelegramWebApp = true;
            
            // Expand Telegram WebApp
            Telegram.WebApp.expand();
            
            // Set theme
            Telegram.WebApp.setHeaderColor('#1a5632');
            Telegram.WebApp.setBackgroundColor('#f8f9fa');
            
            // Initialize Telegram Auth
            initTelegramAuth();
        } else {
            console.log('Regular browser detected');
            window.isTelegramWebApp = false;
        }
    }

    initRouter() {
        // Handle navigation
        window.navigateTo = (page) => {
            this.loadPage(page);
        };

        // Handle browser back/forward
        window.addEventListener('popstate', (event) => {
            const page = event.state?.page || 'home';
            this.loadPage(page);
        });
    }

    async loadPage(page) {
        console.log('Loading page:', page);
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        // Show loading
        document.getElementById('app').innerHTML = `
            <div class="loader-container">
                <div class="loader"></div>
                <p>পৃষ্ঠা লোড হচ্ছে...</p>
            </div>
        `;

        try {
            // Load page content based on page name
            let pageContent = '';
            
            switch(page) {
                case 'home':
                    pageContent = await loadHomePage();
                    break;
                case 'tasks':
                    pageContent = await loadTasksPage();
                    break;
                case 'ads':
                    pageContent = await loadAdsPage();
                    break;
                case 'wallet':
                    pageContent = await loadWalletPage();
                    break;
                case 'withdraw':
                    pageContent = await loadWithdrawPage();
                    break;
                case 'referral':
                    pageContent = await loadReferralPage();
                    break;
                case 'profile':
                    pageContent = await loadProfilePage();
                    break;
                case 'login':
                    pageContent = await loadLoginPage();
                    break;
                case 'verify':
                    pageContent = await loadVerifyPage();
                    break;
                default:
                    pageContent = await loadHomePage();
            }

            // Update app content
            document.getElementById('app').innerHTML = `
                <div class="page active">${pageContent}</div>
                ${window.currentUser ? createNavbar() : ''}
            `;

            // Update current page
            this.currentPage = page;
            
            // Update URL without reload
            window.history.pushState({ page }, '', `#${page}`);

        } catch (error) {
            console.error('Error loading page:', error);
            document.getElementById('app').innerHTML = `
                <div class="page active">
                    <div class="card text-center">
                        <h2>ত্রুটি ঘটেছে</h2>
                        <p>পৃষ্ঠা লোড করতে সমস্যা হচ্ছে। পুনরায় চেষ্টা করুন।</p>
                        <button class="btn mt-1" onclick="window.navigateTo('home')">হোম এ যান</button>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DivineRizQApp();
});

// Global functions for navigation
function showHomePage() {
    window.navigateTo('home');
}

function showLoginPage() {
    window.navigateTo('login');
}
