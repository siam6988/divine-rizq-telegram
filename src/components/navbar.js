// Navigation Bar Component
function createNavbar() {
    return `
        <nav class="navbar">
            <div class="nav-item active" onclick="window.navigateTo('home')">
                <div class="nav-icon">🏠</div>
                <div class="nav-text">হোম</div>
            </div>
            <div class="nav-item" onclick="window.navigateTo('tasks')">
                <div class="nav-icon">📋</div>
                <div class="nav-text">টাস্ক</div>
            </div>
            <div class="nav-item" onclick="window.navigateTo('ads')">
                <div class="nav-icon">📺</div>
                <div class="nav-text">এডস</div>
            </div>
            <div class="nav-item" onclick="window.navigateTo('wallet')">
                <div class="nav-icon">💰</div>
                <div class="nav-text">ওয়ালেট</div>
            </div>
            <div class="nav-item" onclick="window.navigateTo('profile')">
                <div class="nav-icon">👤</div>
                <div class="nav-text">প্রোফাইল</div>
            </div>
        </nav>
    `;
}

// Update active nav item
function updateActiveNav(page) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const navItems = document.querySelectorAll('.nav-item');
    const pageIndex = ['home', 'tasks', 'ads', 'wallet', 'profile'].indexOf(page);
    if (navItems[pageIndex]) {
        navItems[pageIndex].classList.add('active');
    }
}
