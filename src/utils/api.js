// Automated Task Verification Engine
// এই ফাইলে বিভিন্ন ধরনের task-এর auto verification logic ইমপ্লিমেন্ট করা হয়েছে

import { db } from '../firebase.js';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

class TaskVerifyEngine {
    constructor() {
        this.verificationHandlers = {
            'website_visit': this.verifyWebsiteVisit.bind(this),
            'youtube_subscribe': this.verifyYoutubeSubscribe.bind(this),
            'telegram_join': this.verifyTelegramJoin.bind(this),
            'app_download': this.verifyAppDownload.bind(this),
            'video_watch': this.verifyVideoWatch.bind(this)
        };
        
        this.activeVerifications = new Map();
    }

    async startVerification(task, userId) {
        const verificationId = `${userId}_${task.id}`;
        
        try {
            // Progress record তৈরি করা
            await this.createProgressRecord(task, userId);
            
            // Verification handler শুরু করা
            const handler = this.verificationHandlers[task.taskType];
            if (handler) {
                this.activeVerifications.set(verificationId, {
                    task,
                    userId,
                    startTime: Date.now(),
                    handler
                });
                
                await handler(task, userId);
            } else {
                throw new Error(`Unsupported task type: ${task.taskType}`);
            }
            
        } catch (error) {
            console.error('Verification start failed:', error);
            await this.updateProgress(verificationId, 'failed', error.message);
        }
    }

    async verifyWebsiteVisit(task, userId) {
        const verificationId = `${userId}_${task.id}`;
        const { verifyLogic } = task;
        
        // Verification criteria
        const minTime = verifyLogic.minTime || 30; // seconds
        const scrollRequired = verifyLogic.scrollRequired || false;
        const pagesRequired = verifyLogic.pagesRequired || 1;
        
        let pagesVisited = 0;
        let startTime = Date.now();
        let scrollDetected = false;

        // Scroll detection
        const scrollHandler = () => {
            scrollDetected = true;
            document.removeEventListener('scroll', scrollHandler);
        };
        
        document.addEventListener('scroll', scrollHandler);

        // Time and page visit tracking
        const checkCompletion = () => {
            const currentTime = Date.now();
            const timeSpent = (currentTime - startTime) / 1000;
            
            if (timeSpent >= minTime && 
                (!scrollRequired || scrollDetected) && 
                pagesVisited >= pagesRequired) {
                
                this.completeVerification(verificationId);
            } else {
                setTimeout(checkCompletion, 1000);
            }
        };

        // Page visibility tracking
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                pagesVisited++;
            }
        });

        checkCompletion();
    }

    async verifyYoutubeSubscribe(task, userId) {
        const verificationId = `${userId}_${task.id}`;
        
        // YouTube channel subscription detection
        // Note: This requires proper YouTube API integration
        const channelId = task.verifyLogic.channelId;
        
        // Simulate subscription check (replace with actual API call)
        const checkSubscription = async () => {
            try {
                // YouTube API call to check subscription status
                const isSubscribed = await this.checkYouTubeSubscription(channelId, userId);
                
                if (isSubscribed) {
                    this.completeVerification(verificationId);
                } else {
                    setTimeout(checkSubscription, 5000);
                }
            } catch (error) {
                console.error('YouTube subscription check failed:', error);
                setTimeout(checkSubscription, 10000);
            }
        };
        
        checkSubscription();
    }

    async verifyTelegramJoin(task, userId) {
        const verificationId = `${userId}_${task.id}`;
        const chatId = task.verifyLogic.chatId;
        
        // Telegram chat membership check
        if (window.Telegram?.WebApp) {
            const checkMembership = async () => {
                try {
                    const isMember = await this.checkTelegramMembership(chatId, userId);
                    
                    if (isMember) {
                        this.completeVerification(verificationId);
                    } else {
                        setTimeout(checkMembership, 5000);
                    }
                } catch (error) {
                    console.error('Telegram membership check failed:', error);
                    setTimeout(checkMembership, 10000);
                }
            };
            
            checkMembership();
        }
    }

    async verifyAppDownload(task, userId) {
        const verificationId = `${userId}_${task.id}`;
        
        // App download detection through user agent and other signals
        const userAgent = navigator.userAgent.toLowerCase();
        const appIdentifier = task.verifyLogic.appIdentifier;
        
        const checkDownload = () => {
            // Check for app-specific user agent patterns
            const isAppDetected = userAgent.includes(appIdentifier) || 
                                 this.checkAppInstallation(appIdentifier);
            
            if (isAppDetected) {
                this.completeVerification(verificationId);
            } else {
                // Check for play store/app store redirect
                const isStoreRedirect = document.referrer.includes('play.google.com') ||
                                       document.referrer.includes('apps.apple.com');
                
                if (isStoreRedirect) {
                    this.completeVerification(verificationId);
                } else {
                    setTimeout(checkDownload, 5000);
                }
            }
        };
        
        checkDownload();
    }

    async verifyVideoWatch(task, userId) {
        const verificationId = `${userId}_${task.id}`;
        const { verifyLogic } = task;
        const requiredDuration = verifyLogic.duration || 60; // seconds
        
        let videoElement = document.querySelector('video');
        let watchedDuration = 0;
        let isPlaying = false;

        const videoHandler = () => {
            if (videoElement) {
                videoElement.addEventListener('timeupdate', () => {
                    if (!videoElement.paused) {
                        isPlaying = true;
                        watchedDuration = videoElement.currentTime;
                        
                        if (watchedDuration >= requiredDuration) {
                            this.completeVerification(verificationId);
                            videoElement.removeEventListener('timeupdate', videoHandler);
                        }
                    }
                });
                
                // Check if video completes naturally
                videoElement.addEventListener('ended', () => {
                    if (videoElement.duration >= requiredDuration) {
                        this.completeVerification(verificationId);
                    }
                });
            }
        };

        // Wait for video element to be available
        if (videoElement) {
            videoHandler();
        } else {
            const observer = new MutationObserver((mutations) => {
                videoElement = document.querySelector('video');
                if (videoElement) {
                    videoHandler();
                    observer.disconnect();
                }
            });
            
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    async completeVerification(verificationId) {
        const verification = this.activeVerifications.get(verificationId);
        if (!verification) return;

        try {
            // Update progress to completed
            await this.updateProgress(verificationId, 'completed');
            
            // Award reward to user
            await this.awardReward(verification.userId, verification.task.reward);
            
            // Clean up
            this.activeVerifications.delete(verificationId);
            
        } catch (error) {
            console.error('Verification completion failed:', error);
            await this.updateProgress(verificationId, 'failed', error.message);
        }
    }

    async createProgressRecord(task, userId) {
        const progressRef = doc(db, 'taskProgress', `${userId}_${task.id}`);
        
        const progressData = {
            userId,
            taskId: task.id,
            taskType: task.taskType,
            status: 'in_progress',
            startedAt: new Date(),
            reward: task.reward
        };
        
        await setDoc(progressRef, progressData);
    }

    async updateProgress(verificationId, status, error = null) {
        const progressRef = doc(db, 'taskProgress', verificationId);
        
        const updateData = {
            status,
            updatedAt: new Date()
        };
        
        if (status === 'completed') {
            updateData.completedAt = new Date();
        }
        
        if (error) {
            updateData.error = error;
        }
        
        await updateDoc(progressRef, updateData);
    }

    async awardReward(userId, amount) {
        const walletRef = doc(db, 'wallet', userId);
        const walletSnap = await getDoc(walletRef);
        
        const currentBalance = walletSnap.exists() ? walletSnap.data().balance : 0;
        const newBalance = currentBalance + amount;
        
        await setDoc(walletRef, {
            balance: newBalance,
            lastUpdated: new Date()
        }, { merge: true });
        
        // Add to earnings history
        const historyRef = doc(db, 'earningsHistory', `${userId}_${Date.now()}`);
        await setDoc(historyRef, {
            userId,
            amount,
            type: 'task_reward',
            taskId: verificationId.split('_')[1],
            timestamp: new Date()
        });
    }

    // Mock methods for external API checks
    async checkYouTubeSubscription(channelId, userId) {
        // Implement actual YouTube API call
        return new Promise((resolve) => {
            setTimeout(() => resolve(Math.random() > 0.5), 2000);
        });
    }

    async checkTelegramMembership(chatId, userId) {
        // Implement actual Telegram API call
        return new Promise((resolve) => {
            setTimeout(() => resolve(Math.random() > 0.5), 2000);
        });
    }

    checkAppInstallation(appIdentifier) {
        // Implement app installation detection logic
        return false;
    }
}

export const taskVerifyEngine = new TaskVerifyEngine();
