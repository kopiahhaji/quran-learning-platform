class ProgressManager {
    constructor() {
        this.storageKey = 'tajweed_progress';
        this.progress = this.loadProgress();
    }

    loadProgress() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : {
            completedLessons: [],
            practiceHistory: [],
            achievements: [],
            lastSession: null,
            totalPracticeTime: 0,
            currentLevel: 1,
            experiencePoints: 0
        };
    }

    saveProgress() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
    }

    completeLesson(lessonId) {
        if (!this.progress.completedLessons.includes(lessonId)) {
            this.progress.completedLessons.push(lessonId);
            this.addExperience(50); // Award XP for completing a lesson
            this.checkAchievements();
            this.saveProgress();
        }
        this.updateUI();
    }

    recordPractice(details) {
        const practiceRecord = {
            ...details,
            timestamp: new Date().toISOString(),
            duration: details.duration || 0
        };
        
        this.progress.practiceHistory.push(practiceRecord);
        this.progress.totalPracticeTime += details.duration;
        this.addExperience(Math.floor(details.duration / 60) * 10); // 10 XP per minute
        this.saveProgress();
        this.updateUI();
    }

    addExperience(points) {
        this.progress.experiencePoints += points;
        
        // Level up system
        const newLevel = Math.floor(Math.sqrt(this.progress.experiencePoints / 100)) + 1;
        if (newLevel > this.progress.currentLevel) {
            this.levelUp(newLevel);
        }
    }

    levelUp(newLevel) {
        const achievement = {
            type: 'LEVEL_UP',
            level: newLevel,
            timestamp: new Date().toISOString()
        };
        this.progress.achievements.push(achievement);
        this.progress.currentLevel = newLevel;
        this.showLevelUpNotification(newLevel);
    }

    checkAchievements() {
        const lessonCount = this.progress.completedLessons.length;
        const practiceMinutes = Math.floor(this.progress.totalPracticeTime / 60);
        
        // Check for milestones
        if (lessonCount === 5 && !this.hasAchievement('BEGINNER')) {
            this.addAchievement('BEGINNER', 'Completed 5 lessons');
        }
        if (lessonCount === 10 && !this.hasAchievement('INTERMEDIATE')) {
            this.addAchievement('INTERMEDIATE', 'Completed 10 lessons');
        }
        if (practiceMinutes >= 60 && !this.hasAchievement('DEDICATED')) {
            this.addAchievement('DEDICATED', 'Practiced for 1 hour');
        }
    }

    hasAchievement(type) {
        return this.progress.achievements.some(a => a.type === type);
    }

    addAchievement(type, description) {
        const achievement = {
            type,
            description,
            timestamp: new Date().toISOString()
        };
        this.progress.achievements.push(achievement);
        this.showAchievementNotification(achievement);
        this.saveProgress();
    }

    showLevelUpNotification(level) {
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.innerHTML = `
            <h3>Level Up!</h3>
            <p>You've reached level ${level}</p>
        `;
        this.showNotification(notification);
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <h3>Achievement Unlocked!</h3>
            <p>${achievement.description}</p>
        `;
        this.showNotification(notification);
    }

    showNotification(element) {
        const container = document.querySelector('.notification-container') || 
            this.createNotificationContainer();
        
        container.appendChild(element);
        setTimeout(() => {
            element.classList.add('show');
            setTimeout(() => {
                element.classList.remove('show');
                setTimeout(() => element.remove(), 300);
            }, 3000);
        }, 100);
    }

    createNotificationContainer() {
        const container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
        return container;
    }

    updateUI() {
        // Update progress bar
        const progressBar = document.querySelector('.progress');
        const progressText = document.querySelector('.progress-text');
        if (progressBar && progressText) {
            const totalLessons = document.querySelectorAll('.tajwid-section').length;
            const progress = (this.progress.completedLessons.length / totalLessons) * 100;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}% Completed`;
        }

        // Update level indicator
        const levelIndicator = document.querySelector('.level-indicator');
        if (levelIndicator) {
            levelIndicator.textContent = `Level ${this.progress.currentLevel}`;
        }

        // Update practice history
        this.updatePracticeHistory();
    }

    updatePracticeHistory() {
        const historyList = document.querySelector('.history-list');
        if (!historyList) return;

        const recentHistory = this.progress.practiceHistory
            .slice(-5)
            .reverse()
            .map(practice => `
                <div class="history-item">
                    <div class="practice-info">
                        <span class="practice-type">${practice.type}</span>
                        <span class="practice-duration">${Math.floor(practice.duration / 60)} min</span>
                    </div>
                    <div class="practice-date">
                        ${new Date(practice.timestamp).toLocaleDateString()}
                    </div>
                </div>
            `).join('');

        historyList.innerHTML = recentHistory;
    }

    getProgress() {
        return this.progress;
    }

    reset() {
        localStorage.removeItem(this.storageKey);
        this.progress = this.loadProgress();
        this.updateUI();
    }
}

// Export for use in other files
window.ProgressManager = ProgressManager;
