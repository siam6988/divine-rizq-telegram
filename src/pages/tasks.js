// Tasks Page - যেখানে কাজ করে টাকা কামাই! 💼
export function render() {
    return `
        <div class="page">
            <div class="page-header">
                <h1 class="page-title">টাস্ক করে আর্ন করুন</h1>
                <p class="page-subtitle">বসে না থেকে কাজ করে টাকা কামান! 💪</p>
            </div>

            <!-- Task Filters -->
            <div class="card">
                <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem;">
                    <button class="btn btn-outline active" data-filter="all">সব টাস্ক</button>
                    <button class="btn btn-outline" data-filter="website">ওয়েবসাইট</button>
                    <button class="btn btn-outline" data-filter="youtube">YouTube</button>
                    <button class="btn btn-outline" data-filter="telegram">Telegram</button>
                    <button class="btn btn-outline" data-filter="app">App</button>
                </div>
            </div>

            <!-- Available Tasks -->
            <div class="card">
                <h3 class="card-title">🎯 অ্যাভেইলএবল টাস্ক</h3>
                <div id="tasksList">
                    <div style="text-align: center; padding: 2rem;">
                        <div class="loader"></div>
                        <p>টাস্ক লোড হচ্ছে...</p>
                    </div>
                </div>
            </div>

            <!-- Completed Tasks -->
            <div class="card">
                <h3 class="card-title">✅ কমপ্লিটেড টাস্ক</h3>
                <div id="completedTasks">
                    <p style="text-align: center; color: #666; padding: 1rem;">
                        এখনও কোনো টাস্ক কমপ্লিট করেননি
                    </p>
                </div>
            </div>

            <!-- Pro Tips -->
            <div class="card" style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: #333;">
                <h3>🚀 প্রো টিপস</h3>
                <ul style="margin-left: 1rem;">
                    <li>টাস্ক শুরু করলে অটো verify হবে</li>
                    <li>YouTube টাস্ক-এ subscribe করতে হবে</li>
                    <li>Website টাস্ক-এ ৩০ সেকেন্ড থাকতে হবে</li>
                    <li>Telegram টাস্ক-এ join করতে হবে</li>
                </ul>
            </div>
        </div>
    `;
}

export async function afterRender() {
    await loadTasks();
    setupTaskFilters();
}

async function loadTasks() {
    try {
        const tasks = await getAvailableTasks();
        displayTasks(tasks);
        await loadCompletedTasks();
    } catch (error) {
        console.error('Error loading tasks:', error);
        document.getElementById('tasksList').innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                ❌ টাস্ক লোড করতে সমস্যা! ইন্টারনেট চেক করুন।
            </div>
        `;
    }
}

async function getAvailableTasks() {
    // Mock tasks - real app-এ Firebase থেকে fetch করবে
    return [
        {
            id: "WEB_001",
            title: "আমাদের ওয়েবসাইট ভিজিট করুন",
            description: "ওয়েবসাইটে ৩০ সেকেন্ড অবস্থান করুন",
            reward: 0.5,
            taskType: "website_visit",
            icon: "🌐",
            difficulty: "easy"
        },
        {
            id: "YT_001", 
            title: "YouTube Channel Subscribe",
            description: "আমাদের YouTube channel-এ subscribe করুন",
            reward: 1.0,
            taskType: "youtube_subscribe",
            icon: "📺",
            difficulty: "medium"
        },
        {
            id: "TG_001",
            title: "Telegram Group Join",
            description: "আমাদের Telegram group-এ join করুন",
            reward: 0.75,
            taskType: "telegram_join", 
            icon: "✈️",
            difficulty: "easy"
        },
        {
            id: "APP_001",
            title: "Mobile App Download",
            description: "আমাদের mobile app download করুন",
            reward: 2.0,
            taskType: "app_download",
            icon: "📱",
            difficulty: "hard"
        }
    ];
}

function displayTasks(tasks) {
    const tasksList = document.getElementById('tasksList');
    
    if (tasks.length === 0) {
        tasksList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                😴 এখন কোনো টাস্ক নেই। কিছুক্ষণ পর চেক করুন!
            </div>
        `;
        return;
    }

    tasksList.innerHTML = tasks.map(task => `
        <div class="task-card card" data-task-type="${task.taskType}">
            <div class="card-header">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 1.5rem;">${task.icon}</span>
                    <div>
                        <h4 class="card-title">${task.title}</h4>
                        <p style="color: #666; font-size: 0.9rem;">${task.description}</p>
                    </div>
                </div>
                <span class="task-reward">+${task.reward} ISLM</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                <span class="btn btn-outline" style="padding: 0.25rem 0.75rem; font-size: 0.8rem;">
                    ${getDifficultyBadge(task.difficulty)}
                </span>
                <button class="btn start-task-btn" data-task-id="${task.id}">
                    শুরু করুন
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners to start buttons
    document.querySelectorAll('.start-task-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.target.dataset.taskId;
            startTask(taskId);
        });
    });
}

function getDifficultyBadge(difficulty) {
    const badges = {
        easy: "🎯 Easy",
        medium: "🔥 Medium", 
        hard: "💎 Hard"
    };
    return badges[difficulty] || "📝 Normal";
}

async function startTask(taskId) {
    const task = await getTaskById(taskId);
    if (!task) return;

    // Show task starting message
    showTaskStartMessage(task);

    // Start verification process
    try {
        const app = window.divineRizQApp;
        const userId = app?.getUser()?.uid;
        
        if (!userId) {
            alert('⚠️ লগইন করুন প্রথমে!');
            return;
        }

        // Task verification engine start
        await taskVerifyEngine.startVerification(task, userId);
        
    } catch (error) {
        console.error('Task start failed:', error);
        alert('❌ টাস্ক শুরু করতে সমস্যা!');
    }
}

function showTaskStartMessage(task) {
    const message = document.createElement('div');
    message.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">${task.icon}</div>
            <h3>${task.title}</h3>
            <p>টাস্ক শুরু হয়েছে! অটো verify হবে...</p>
            <div class="loader" style="margin: 1rem auto;"></div>
        </div>
    `;
    
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        min-width: 300px;
    `;
    
    document.body.appendChild(message);
    
    // Auto close after 3 seconds
    setTimeout(() => {
        message.remove();
    }, 3000);
}

function setupTaskFilters() {
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            
            // Update active button
            document.querySelectorAll('[data-filter]').forEach(b => {
                b.classList.remove('active');
            });
            e.target.classList.add('active');
            
            // Filter tasks
            filterTasks(filter);
        });
    });
}

function filterTasks(filter) {
    const tasks = document.querySelectorAll('.task-card');
    
    tasks.forEach(task => {
        if (filter === 'all') {
            task.style.display = 'block';
        } else {
            const taskType = task.dataset.taskType;
            if (taskType.includes(filter)) {
                task.style.display = 'block';
            } else {
                task.style.display = 'none';
            }
        }
    });
}

async function loadCompletedTasks() {
    try {
        const app = window.divineRizQApp;
        const userId = app?.getUser()?.uid;
        
        if (!userId) return;

        const completed = await getCompletedTasks(userId);
        displayCompletedTasks(completed);
        
    } catch (error) {
        console.error('Error loading completed tasks:', error);
    }
}

async function getCompletedTasks(userId) {
    // Mock data - real app-এ Firebase থেকে fetch করবে
    return [
        {
            taskId: "WEB_001",
            title: "Website Visit",
            completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            reward: 0.5
        }
    ];
}

function displayCompletedTasks(completedTasks) {
    const container = document.getElementById('completedTasks');
    
    if (completedTasks.length === 0) {
        container.innerHTML = `
            <p style="text-align: center; color: #666; padding: 1rem;">
                এখনও কোনো টাস্ক কমপ্লিট করেননি
            </p>
        `;
        return;
    }

    container.innerHTML = completedTasks.map(task => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-bottom: 1px solid #f0f0f0;">
            <div>
                <strong>${task.title}</strong>
                <br>
                <small style="color: #666;">
                    ${task.completedAt.toLocaleDateString('bn-BD')}
                </small>
            </div>
            <span style="color: var(--secondary-gold); font-weight: bold;">
                +${task.reward} ISLM
            </span>
        </div>
    `).join('');
}
