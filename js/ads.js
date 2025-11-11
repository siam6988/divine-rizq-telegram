// Professional Task Management System
class TaskService {
    constructor() {
        this.tasks = [];
        this.activeTasks = [];
        this.completedTasks = [];
        this.init();
    }

    async init() {
        await this.loadTasks();
        this.setupTaskEventListeners();
    }

    async loadTasks() {
        try {
            if (authService.isDemo()) {
                await this.loadDemoTasks();
            } else {
                await this.loadTasksFromFirebase();
            }
            
            console.log('✅ Tasks loaded successfully');
        } catch (error) {
            console.error('❌ Task loading failed:', error);
            await this.loadDemoTasks(); // Fallback to demo tasks
        }
    }

    async loadTasksFromFirebase() {
        try {
            this.tasks = await firebaseService.getActiveTasks();
            this.filterTasks();
            console.log(`✅ Loaded ${this.tasks.length} tasks from Firebase`);
        } catch (error) {
            throw new Error('Failed to load tasks from database');
        }
    }

    async loadDemoTasks() {
        // Demo tasks data
        this.tasks = [
            {
                id: 'task_website_visit',
                title: '🌐 ওয়েবসাইট ভিজিট করুন',
                description: 'আমাদের অফিসিয়াল ওয়েবসাইট 30 সেকেন্ডের জন্য ভিজিট করুন',
                reward: 0.30,
                type: 'website_visit',
                link: 'https://example.com',
                timeLimit: 30,
                active: true,
                expiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                maxUsers: 1000,
                currentUsers: 245
            },
            {
                id: 'task_telegram_join', 
                title: '📢 টেলিগ্রাম চ্যানেল জয়েন করুন',
                description: 'আমাদের টেলিগ্রাম চ্যানেলে জয়েন করুন এবং সাবস্ক্রাইব করুন',
                reward: 0.50,
                type: 'telegram_join',
                link: 'https://t.me/example_channel',
                active: true,
                expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                maxUsers: 5000,
                currentUsers: 3120
            },
            {
                id: 'task_youtube_subscribe',
                title: '📺 ইউটিউব সাবস্ক্রাইব করুন',
                description: 'আমাদের ইউটিউব চ্যানেলে সাবস্ক্রাইব করুন',
                reward: 0.40,
                type: 'youtube_subscribe', 
                link: 'https://youtube.com/example',
                active: true,
                expiry: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
                maxUsers: 2000,
                currentUsers: 1567
            },
            {
                id: 'task_app_download',
                title: '📱 অ্যাপ ডাউনলোড করুন',
                description: 'আমাদের মোবাইল অ্যাপ ডাউনলোড এবং ইন্সটল করুন',
                reward: 0.80,
                type: 'app_download',
                link: 'https://play.google.com/store/apps/details?id=com.example',
                active: true,
                expiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
                maxUsers: 3000,
                currentUsers: 1890
            }
        ];
        
        this.filterTasks();
        console.log(`✅ Loaded ${this.tasks.length} demo tasks`);
    }

    filterTasks() {
        const userCompletedTasks = window.app?.userData?.completedTasks || [];
        
        this.activeTasks = this.tasks.filter(task => 
            task.active && 
            !userCompletedTasks.includes(task.id) &&
            new Date(task.expiry) > new Date()
        );
        
        this.completedTasks = this.tasks.filter(task => 
            userCompletedTasks.includes(task.id)
        );
    }

    setupTaskEventListeners() {
        // Task event listeners will be setup when tasks are rendered
        document.addEventListener('click', (e) => {
            if (e.target.closest('.task-start-btn')) {
                const taskId = e.target.closest('.task-start-btn').dataset.taskId;
                this.startTask(taskId);
            }
        });
    }

    renderTasks() {
        const tasksContainer = document.getElementById('tasksList');
        if (!tasksContainer) return;

        if (this.activeTasks.length === 0) {
            tasksContainer.innerHTML = `
                <div class="card text-center">
                    <div class="text-muted mb-2">📭</div>
                    <h4>কোনো সক্রিয় টাস্ক নেই</h4>
                    <p class="text-muted">পরবর্তী টাস্কের জন্য অপেক্ষা করুন</p>
                </div>
            `;
            return;
        }

        let tasksHTML = '';
        
        this.activeTasks.forEach(task => {
            const progress = Math.min((task.currentUsers / task.maxUsers) * 100, 100);
            const timeLeft = this.getTimeLeft(task.expiry);
            
            tasksHTML += `
                <div class="task-item" data-task-id="${task.id}">
                    <div class="task-info">
                        <div class="task-title">${task.title}</div>
                        <div class="task-description">${task.description}</div>
                        
                        <div class="task-meta">
                            <div class="task-reward">🏆 ${task.reward} ISLM</div>
                            <div class="task-time">⏱️ ${timeLeft}</div>
                        </div>
                        
                        <div class="progress-container">
                            <div class="progress-header">
                                <span class="progress-label">টাস্ক প্রোগ্রেস</span>
                                <span class="progress-value">${task.currentUsers}/${task.maxUsers}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary task-start-btn" data-task-id="${task.id}">
                        টাস্ক শুরু করুন
                    </button>
                </div>
            `;
        });

        tasksContainer.innerHTML = tasksHTML;
    }

    async startTask(taskId) {
        try {
            const task = this.tasks.find(t => t.id === taskId);
            if (!task) {
                throw new Error('Task not found');
            }

            // Validate user
            if (!authService.isAuthenticated()) {
                throw new Error('User not authenticated');
            }

            // Check if already completed
            const userCompletedTasks = window.app?.userData?.completedTasks || [];
            if (userCompletedTasks.includes(taskId)) {
                throw new Error('Task already completed');
            }

            // Show task starting notification
            this.showNotification(`"${task.title}" টাস্ক শুরু হচ্ছে...`, 'info');

            // Open task link in new tab
            if (task.link) {
                window.open(task.link, '_blank');
            }

            // Start task verification process
            await this.verifyTaskCompletion(task);

        } catch (error) {
            console.error('❌ Task start failed:', error);
            this.showNotification(error.message, 'error');
        }
    }

    async verifyTaskCompletion(task) {
        // Show verification in progress
        this.showNotification(`"${task.title}" ভেরিফাই হচ্ছে...`, 'info');

        // Simulate verification process based on task type
        switch (task.type) {
            case 'website_visit':
                await this.verifyWebsiteVisit(task);
                break;
            case 'telegram_join':
                await this.verifyTelegramJoin(task);
                break;
            case 'youtube_subscribe':
                await this.verifyYouTubeSubscribe(task);
                break;
            case 'app_download':
                await this.verifyAppDownload(task);
                break;
            default:
                await this.verifyGenericTask(task);
        }
    }

    async verifyWebsiteVisit(task) {
        // Simulate website visit verification
        this.showNotification('ওয়েবসাইট ভিজিট চেক করা হচ্ছে...', 'info');
        
        setTimeout(async () => {
            try {
                // In real implementation, this would verify actual visit
                const verified = Math.random() > 0.2; // 80% success rate for demo
                
                if (verified) {
                    await this.completeTask(task);
                } else {
                    throw new Error('ওয়েবসাইট ভিজিট ভেরিফাই হয়নি');
                }
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        }, 3000);
    }

    async verifyTelegramJoin(task) {
        // Simulate Telegram join verification
        this.showNotification('টেলিগ্রাম জয়েন চেক করা হচ্ছে...', 'info');
        
        setTimeout(async () => {
            try {
                // In real implementation, this would use Telegram API
                const verified = Math.random() > 0.1; // 90% success rate for demo
                
                if (verified) {
                    await this.completeTask(task);
                } else {
                    throw new Error('টেলিগ্রাম চ্যানেল জয়েন ভেরিফাই হয়নি');
                }
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        }, 2000);
    }

    async verifyYouTubeSubscribe(task) {
        // Simulate YouTube subscribe verification
        this.showNotification('ইউটিউব সাবস্ক্রাইব চেক করা হচ্ছে...', 'info');
        
        setTimeout(async () => {
            try {
                // In real implementation, this would use YouTube API
                const verified = Math.random() > 0.15; // 85% success rate for demo
                
                if (verified) {
                    await this.completeTask(task);
                } else {
                    throw new Error('ইউটিউব সাবস্ক্রাইব ভেরিফাই হয়নি');
                }
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        }, 2500);
    }

    async verifyAppDownload(task) {
        // Simulate app download verification
        this.showNotification('অ্যাপ ডাউনলোড চেক করা হচ্ছে...', 'info');
        
        setTimeout(async () => {
            try {
                // In real implementation, this would check app installation
                const verified = Math.random() > 0.3; // 70% success rate for demo
                
                if (verified) {
                    await this.completeTask(task);
                } else {
                    throw new Error('অ্যাপ ডাউনলোড ভেরিফাই হয়নি');
                }
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        }, 4000);
    }

    async verifyGenericTask(task) {
        // Generic task verification with timer
        this.showNotification(`"${task.title}" সম্পূর্ণ হচ্ছে...`, 'info');
        
        setTimeout(async () => {
            try {
                await this.completeTask(task);
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        }, task.timeLimit * 1000 || 30000);
    }

    async completeTask(task) {
        try {
            const userId = window.app?.userData?.uid;
            
            if (authService.isDemo()) {
                // Demo mode completion
                if (window.app && window.app.userData) {
                    window.app.userData.balance += task.reward;
                    window.app.userData.totalEarned += task.reward;
                    
                    if (!window.app.userData.completedTasks) {
                        window.app.userData.completedTasks = [];
                    }
                    window.app.userData.completedTasks.push(task.id);
                    
                    window.app.updateUI();
                    this.filterTasks();
                    this.renderTasks();
                }
            } else {
                // Real mode completion
                await firebaseService.completeTask(userId, task.id, task.reward);
                
                // Log task completion
                await firebaseService.logUserActivity(userId, 'task_completed', {
                    taskId: task.id,
                    taskTitle: task.title,
                    reward: task.reward
                });
            }

            // Show success notification
            this.showNotification(
                `✅ টাস্ক সম্পূর্ণ! +${task.reward} ISLM পেয়েছেন`,
                'success'
            );

            console.log(`✅ Task completed: ${task.title} - ${task.reward} ISLM`);

        } catch (error) {
            console.error('❌ Task completion failed:', error);
            throw new Error('টাস্ক সম্পূর্ণ করতে সমস্যা হচ্ছে');
        }
    }

    getTimeLeft(expiryDate) {
        const now = new Date();
        const expiry = new Date(expiryDate);
        const diff = expiry - now;
        
        if (diff <= 0) return 'সময় শেষ';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return `${days} দিন ${hours} ঘন্টা`;
        if (hours > 0) return `${hours} ঘন্টা`;
        
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${minutes} মিনিট`;
    }

    showNotification(message, type) {
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    // Admin methods (for future use)
    async createTask(taskData) {
        // Would create task in Firebase
        console.log('Creating task:', taskData);
    }

    async updateTask(taskId, updates) {
        // Would update task in Firebase
        console.log('Updating task:', taskId, updates);
    }

    async deactivateTask(taskId) {
        // Would deactivate task in Firebase
        console.log('Deactivating task:', taskId);
    }
}

// Initialize Task Service
const taskService = new TaskService();
window.taskService = taskService;

console.log('✅ Professional Task Service Ready');
