// Modern Navigation Bar Component
function createNavbar() {
    return `
        <nav class="navbar-modern">
            <a class="nav-item-modern active" onclick="window.navigateTo('home')">
                <div class="nav-icon-modern">🏠</div>
                <div class="nav-text-modern">হোম</div>
            </a>
            <a class="nav-item-modern" onclick="window.navigateTo('tasks')">
                <div class="nav-icon-modern">📋</div>
                <div class="nav-text-modern">টাস্ক</div>
            </a>
            <a class="nav-item-modern" onclick="window.navigateTo('ads')">
                <div class="nav-icon-modern">📺</div>
                <div class="nav-text-modern">এডস</div>
            </a>
            <a class="nav-item-modern" onclick="window.navigateTo('wallet')">
                <div class="nav-icon-modern">💰</div>
                <div class="nav-text-modern">ওয়ালেট</div>
            </a>
            <a class="nav-item-modern" onclick="window.navigateTo('profile')">
                <div class="nav-icon-modern">👤</div>
                <div class="nav-text-modern">প্রোফাইল</div>
            </a>
        </nav>
    `;
}
