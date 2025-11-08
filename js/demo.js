// Demo-specific functionality
console.log('🔧 Demo mode activated');

// Add some demo enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Add loading animation
    const style = document.createElement('style');
    style.textContent = `
        .demo-notice {
            background: rgba(0, 255, 127, 0.1);
            border: 1px solid #00FF7F;
            border-radius: 10px;
            padding: 10px;
            margin: 10px 0;
            text-align: center;
            font-size: 0.9rem;
        }
    `;
    document.head.appendChild(style);

    // Add demo notice
    const notice = document.createElement('div');
    notice.className = 'demo-notice';
    notice.innerHTML = '🔧 <strong>Demo Mode</strong> - Real functionality in Telegram';
    document.querySelector('.main-content').prepend(notice);
});
