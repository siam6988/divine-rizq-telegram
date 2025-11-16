// Single Page Application Router System
// এই ফাইলে পেজ নেভিগেশন এবং রাউটিং ম্যানেজমেন্ট করা হয়েছে

class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.appContainer = document.getElementById('app');
        this.initEventListeners();
    }

    init() {
        // রাউট রেজিস্ট্রেশন
        this.registerRoutes();
        
        // Initial route লোড করা
        this.navigate(window.location.hash || '#home');
    }

    registerRoutes() {
        // সবগুলো রাউট রেজিস্টার করা
        this.routes = {
            '#home': () => this.loadPage('home'),
            '#tasks': () => this.loadPage('tasks'),
            '#ads': () => this.loadPage('ads'),
            '#wallet': () => this.loadPage('wallet'),
            '#withdraw': () => this.loadPage('withdraw'),
            '#referral': () => this.loadPage('referral'),
            '#profile': () => this.loadPage('profile'),
            '#login': () => this.loadPage('login'),
            '#verify': () => this.loadPage('verify')
        };
    }

    async loadPage(pageName) {
        try {
            // Page component import করা
            const module = await import(`./pages/${pageName}.js`);
            
            // Page content রেন্ডার করা
            this.appContainer.innerHTML = module.render();
            
            // Page-specific JavaScript এক্সিকিউট করা
            if (module.afterRender) {
                await module.afterRender();
            }
            
            // Active nav item আপডেট করা
            this.updateActiveNav(pageName);
            
            this.currentRoute = pageName;
            
        } catch (error) {
            console.error(`Error loading page ${pageName}:`, error);
            this.show404();
        }
    }

    navigate(hash) {
        const route = this.routes[hash];
        if (route) {
            window.location.hash = hash;
            route();
        } else {
            this.show404();
        }
    }

    updateActiveNav(currentPage) {
        // সব nav items থেকে active ক্লাস সরানো
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Current page-এর nav item-এ active ক্লাস যোগ করা
        const activeNav = document.querySelector(`[data-page="${currentPage}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }
    }

    initEventListeners() {
        // Hash change event handling
        window.addEventListener('hashchange', () => {
            this.navigate(window.location.hash);
        });

        // Navbar click event handling
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-item')) {
                e.preventDefault();
                const page = e.target.closest('.nav-item').dataset.page;
                this.navigate(`#${page}`);
            }
        });

        // Telegram Back Button handling
        if (window.Telegram?.WebApp?.BackButton) {
            window.Telegram.WebApp.BackButton.onClick(() => {
                this.handleBackButton();
            });
        }
    }

    handleBackButton() {
        // Back button navigation logic
        const routes = Object.keys(this.routes);
        const currentIndex = routes.indexOf(`#${this.currentRoute}`);
        
        if (currentIndex > 0) {
            this.navigate(routes[currentIndex - 1]);
        } else {
            window.Telegram.WebApp.close();
        }
    }

    show404() {
        this.appContainer.innerHTML = `
            <div class="page">
                <div class="page-header">
                    <h1 class="page-title">পৃষ্ঠা পাওয়া যায়নি</h1>
                    <p class="page-subtitle">আপনি যে পৃষ্ঠাটি খুঁজছেন তা存在 করে না।</p>
                </div>
                <div class="card">
                    <button onclick="router.navigate('#home')" class="btn">
                        হোম পেজে ফিরে যান
                    </button>
                </div>
            </div>
        `;
    }
}

// Global router instance তৈরি করা
export const router = new Router();
