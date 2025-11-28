// Tasks Page Component
async function loadTasksPage() {
    const tasks = await getAvailableTasks();
    
    return `
        <div class="page active" id="tasks-page">
            <div class="card">
                <h2 class="card-title">📋 উপলব্ধ টাস্কগুলো</h2>
                <p>টাস্ক সম্পন্ন করে আয় করুন। প্রতিটি টাস্ক automatically verify হবে।</p>
            </div>

            <!-- Task Filter -->
            <div class="card">
                <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem;">
                    <button class="btn" onclick="filterTasks('all')">সব টাস্ক</button>
                    <button class="btn" onclick="filterTasks('website')">ওয়েবসাইট</button>
                    <button class="btn" onclick="filterTasks('youtube')">YouTube</button>
                    <button class="btn" onclick="filterTasks('telegram')">Telegram</button>
                    <button class="btn" onclick="filterTasks('app')">App Download</button>
                </div>
            </div>

            <!-- Tasks List -->
            <div id="tasks-list">
                ${await renderTasksList(tasks)}
            </div>

            <!-- Completed Tasks Stats -->
            <div class="card">
                <h3 class="card-title">📊 আপনার টাস্ক স্ট্যাটস</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; text-align: center;">
                    <div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary-green);">
                            ${await getCompletedTasksCount()}
                        </div>
                        <div style="font-size: 0.9rem;">সম্পন্ন টাস্ক</div>
                    </div>
                    <div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--gold);">
                            ${await getTotalEarnedFromTasks()} ISLM
                        </div>
                        <div style="font-size: 0.9rem;">টাস্ক থেকে আয়</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function getAvailableTasks() {
    try {
        const snapshot = await db.collection('tasks')
            .where('status', '==', 'active')
            .get();
        
        const tasks = [];
        snapshot.forEach(doc => {
            tasks.push({ id: doc.id, ...doc.data() });
        });
        return tasks;
    } catch (error) {
        console.error('Error getting tasks:', error);
        return [];
    }
}

async function renderTasksList(tasks) {
    if (tasks.length === 0) {
        return `
            <div class="card text-center">
                <p>🚫 এখন কোন টাস্ক উপলব্ধ নেই</p>
                <p>শীঘ্রই নতুন টাস্ক যোগ করা হবে</p>
            </div>
        `;
    }

    let html = '';
    for (const task of tasks) {
        const progress = await getTaskProgress(task.id);
        html += createTaskCard(task, progress);
    }
    return html;
}

function createTaskCard(task, progress) {
    const isCompleted = progress?.status === 'completed';
    const isInProgress = progress?.status === 'in_progress';
    
    return `
        <div class="task-card" data-task-type="${task.taskType}" data-task-id="${task.id}">
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <div class="task-reward">+${task.reward} ISLM</div>
            </div>
            
            <div class="task-description">
                ${task.description}
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <small><strong>ধরণ:</strong> ${getTaskTypeName(task.taskType)}</small>
                <small><strong>সময়:</strong> ${task.duration || 1} মিনিট</small>
            </div>
            
            ${isCompleted ? `
                <div class="text-center">
                    <button class="btn" disabled style="background: #28a745;">
                        ✅ সম্পন্ন
                    </button>
                </div>
            ` : isInProgress ? `
                <div class="task-progress">
                    <div class="progress-bar" style="width: ${progress.percentage || 0}%"></div>
                </div>
                <div class="text-center">
                    <button class="btn btn-gold" onclick="continueTask('${task.id}')">
                        🔄 চালিয়ে যান (${progress.percentage || 0}%)
                    </button>
                </div>
            ` : `
                <div class="text-center">
                    <button class="btn btn-gold" onclick="startTask('${task.id}')">
                        🚀 শুরু করুন
                    </button>
                </div>
            `}
        </div>
    `;
}

function getTaskTypeName(taskType) {
    const types = {
        'website_visit': 'ওয়েবসাইট ভিজিট',
        'youtube_subscribe': 'YouTube সাবস্ক্রাইব',
        'telegram_join': 'Telegram জয়েন',
        'app_download': 'App ডাউনলোড',
        'social_like': 'সোশ্যাল লাইক',
        'video_watch': 'ভিডিও দেখুন'
    };
    return types[taskType] || taskType;
}

async function getTaskProgress(taskId) {
    const user = window.currentUser;
    if (!user) return null;
    
    try {
        const doc = await db.collection('taskProgress')
            .doc(`${user.uid}_${taskId}`)
            .get();
        
        return doc.exists ? doc.data() : null;
    } catch (error) {
        return null;
    }
}

async function getCompletedTasksCount() {
    const user = window.currentUser;
    if (!user) return 0;
    
    try {
        const snapshot = await db.collection('taskProgress')
            .where('userId', '==', user.uid)
            .where('status', '==', 'completed')
            .get();
        
        return snapshot.size;
    } catch (error) {
        return 0;
    }
}

async function getTotalEarnedFromTasks() {
    const user = window.currentUser;
    if (!user) return 0;
    
    try {
        const snapshot = await db.collection('activities')
            .where('userId', '==', user.uid)
            .where('type', '==', 'task_reward')
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

async function startTask(taskId) {
    const user = window.currentUser;
    if (!user) {
        alert('লগইন প্রয়োজন');
        return;
    }
    
    // Navigate to verify page with task ID
    window.currentTaskId = taskId;
    window.navigateTo('verify');
}

async function continueTask(taskId) {
    window.currentTaskId = taskId;
    window.navigateTo('verify');
}

function filterTasks(type) {
    const taskCards = document.querySelectorAll('.task-card');
    
    taskCards.forEach(card => {
        if (type === 'all') {
            card.style.display = 'block';
        } else {
            const taskType = card.getAttribute('data-task-type');
            if (taskType.includes(type)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
}
