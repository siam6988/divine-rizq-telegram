// Professional Utility Functions
class UtilityService {
    constructor() {
        this.init();
    }

    init() {
        this.setupGlobalUtilities();
        console.log('🔧 Utility Service Initialized');
    }

    setupGlobalUtilities() {
        // Make utilities globally available
        window.utils = this;
    }

    // Date and Time Utilities
    formatDate(date) {
        return new Date(date).toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatTime(date) {
        return new Date(date).toLocaleTimeString('bn-BD', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatDateTime(date) {
        return `${this.formatDate(date)} ${this.formatTime(date)}`;
    }

    getRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'এখন';
        if (minutes < 60) return `${minutes} মিনিট আগে`;
        if (hours < 24) return `${hours} ঘন্টা আগে`;
        if (days < 7) return `${days} দিন আগে`;
        
        return this.formatDate(date);
    }

    // Number Utilities
    formatNumber(number) {
        return new Intl.NumberFormat('bn-BD').format(number);
    }

    formatCurrency(amount, currency = 'ISLM') {
        return `${this.formatNumber(amount.toFixed(2))} ${currency}`;
    }

    abbreviateNumber(number) {
        if (number >= 1000000) {
            return (number / 1000000).toFixed(1) + 'M';
        }
        if (number >= 1000) {
            return (number / 1000).toFixed(1) + 'K';
        }
        return number.toString();
    }

    // String Utilities
    truncateText(text, maxLength = 50) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    capitalizeFirst(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    sanitizeInput(input) {
        return input.trim().replace(/[<>]/g, '');
    }

    // Validation Utilities
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    isNumeric(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    // Storage Utilities
    setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('LocalStorage set failed:', error);
            return false;
        }
    }

    getLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('LocalStorage get failed:', error);
            return defaultValue;
        }
    }

    removeLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('LocalStorage remove failed:', error);
            return false;
        }
    }

    // DOM Utilities
    showElement(selector) {
        const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (element) element.style.display = 'block';
    }

    hideElement(selector) {
        const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (element) element.style.display = 'none';
    }

    toggleElement(selector) {
        const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (element) {
            element.style.display = element.style.display === 'none' ? 'block' : 'none';
        }
    }

    addClass(selector, className) {
        const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (element) element.classList.add(className);
    }

    removeClass(selector, className) {
        const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (element) element.classList.remove(className);
    }

    // Animation Utilities
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity.toString();
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    fadeOut(element, duration = 300) {
        let start = null;
        const initialOpacity = parseFloat(element.style.opacity) || 1;
        
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = initialOpacity * (1 - Math.min(progress / duration, 1));
            
            element.style.opacity = opacity.toString();
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Network Utilities
    async fetchWithTimeout(url, options = {}, timeout = 5000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    }

    isOnline() {
        return navigator.onLine;
    }

    // Performance Utilities
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Security Utilities
    escapeHTML(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Currency Conversion Utilities
    async convertCurrency(amount, fromCurrency, toCurrency) {
        // This would typically call a currency conversion API
        // For demo purposes, returning fixed rates
        const rates = {
            'ISLM_TO_BDT': 120, // Example rate
            'ISLM_TO_USD': 1.2  // Example rate
        };
        
        const key = `${fromCurrency}_TO_${toCurrency}`;
        return rates[key] ? amount * rates[key] : amount;
    }

    // Notification Utilities
    showSystemNotification(title, message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body: message });
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission();
        }
    }

    // Copy to Clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    }

    // Device Detection
    getDeviceInfo() {
        const ua = navigator.userAgent;
        return {
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
            isTablet: /iPad|Android/i.test(ua) && !/Mobile/i.test(ua),
            isDesktop: !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
            browser: this.getBrowserName(ua),
            os: this.getOSName(ua)
        };
    }

    getBrowserName(ua) {
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Unknown';
    }

    getOSName(ua) {
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac')) return 'MacOS';
        if (ua.includes('Linux')) return 'Linux';
        return 'Unknown';
    }

    // Analytics and Tracking
    trackEvent(category, action, label = '') {
        // Integrate with analytics service
        console.log(`📊 Event: ${category} - ${action} - ${label}`);
        
        // Example: Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label
            });
        }
    }

    // Error Handling
    logError(error, context = {}) {
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            context: context,
            timestamp: new Date().toISOString(),
            user: window.app?.userData?.uid || 'unknown',
            url: window.location.href
        };
        
        console.error('🔴 Application Error:', errorInfo);
        
        // Send to error tracking service (e.g., Sentry)
        // this.sendErrorToService(errorInfo);
    }

    handleGlobalErrors() {
        window.addEventListener('error', (event) => {
            this.logError(event.error, { type: 'global' });
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.logError(event.reason, { type: 'promise' });
        });
    }
}

// Initialize Utility Service
const utilityService = new UtilityService();
window.utilityService = utilityService;

console.log('🔧 Professional Utility Service Ready');
