/**
 * Pomodoro Mode Implementation
 * Manages tasks and work in focused intervals with customizable breaks
 */

class PomodoroMode {
    constructor() {
        this.isActive = false;
        this.popupWindow = null;
        
        this.timerSettings = {
            workDuration: 25 * 60, // 25 minutes in seconds
            shortBreakDuration: 5 * 60, // 5 minutes in seconds
            longBreakDuration: 15 * 60, // 15 minutes in seconds
            sessionsBeforeLongBreak: 4,
            completedTasksDisplay: 'strikethrough' // 'strikethrough' or 'hide'
        };
        
        this.timerState = {
            currentSession: 'work', // 'work', 'shortBreak', or 'longBreak'
            timeRemaining: 25 * 60,
            isRunning: false,
            sessionCount: 0,
            timerInterval: null,
            startTime: null,
            pauseTime: null
        };
        
        this.taskData = {
            tasks: [],
            nextId: 1
        };
    }

    activate(options = {}) {
        this.isActive = true;
        
        console.log("Activating Pomodoro Mode");
        
        // Load saved data if it exists for the current document
        this.loadSavedData();
        
        // Create the popup window
        this.createPomodoroWindow();
        
        console.log('Pomodoro Mode enabled in a separate window');
    }

    deactivate() {
        this.isActive = false;
        
        // Save current data before deactivating
        this.saveData();
        
        // Close the popup window if it exists
        if (this.popupWindow && !this.popupWindow.closed) {
            this.popupWindow.close();
            this.popupWindow = null;
        }
        
        console.log('Pomodoro Mode disabled');
    }

    getOptions() {
        return {
            isRunning: this.timerState.isRunning,
            currentSession: this.timerState.currentSession,
            timeRemaining: this.timerState.timeRemaining,
            taskCount: this.taskData.tasks ? this.taskData.tasks.length : 0
        };
    }

    createPomodoroWindow() {
        // Calculate centered position
        const width = 450;
        const height = 600;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        
        // Check if window already exists and is not closed
        if (this.popupWindow && !this.popupWindow.closed) {
            this.popupWindow.focus();
            return;
        }
        
        // Create a new popup window
        this.popupWindow = window.open('', 'PomodoroTimer', 
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`);
        
        if (!this.popupWindow) {
            console.error('Popup blocked! Please allow popups for this site.');
            return;
        }
        
        // Get the document in the popup window
        const popupDoc = this.popupWindow.document;
        
        // Generate HTML for the popup
        this.generatePomodoroHTML(popupDoc);
        
        // Initialize the Pomodoro timer and tasks in the popup
        this.initializePomodoroPopup();
        
        // Handle window close events
        this.popupWindow.addEventListener('beforeunload', () => {
            // Save data when window is closed
            this.saveData();
        });
    }

    generatePomodoroHTML(popupDoc) {
        // Get the current theme colors
        const primaryColor = '#57068c';
        const primaryDark = '#400667';
        
        // Create HTML structure for the popup
        popupDoc.open();
        popupDoc.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Pomodoro Timer</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Open+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
                <style>
                    :root {
                        --primary-color: ${primaryColor};
                        --primary-dark: ${primaryDark};
                        --background-color: #f8f8fa;
                        --card-bg: white;
                        --border-color: #e6e6e6;
                        --text-color: #333;
                        --text-secondary: #666;
                    }
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Open Sans', sans-serif;
                        background-color: var(--background-color);
                        color: var(--text-color);
                        line-height: 1.6;
                        height: 100vh;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                    }
                    
                    .pomodoro-header {
                        background-color: var(--card-bg);
                        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                        padding: 12px 16px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 16px;
                        z-index: 10;
                        flex-shrink: 0;
                        border-bottom: 1px solid var(--border-color);
                    }
                    
                    .pomodoro-title-area {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    
                    .pomodoro-title {
                        font-family: 'Playfair Display', serif;
                        font-size: 1.3rem;
                        color: var(--primary-color);
                        font-weight: 600;
                        white-space: nowrap;
                    }
                    
                    .pomodoro-timer-display {
                        display: flex;
                        align-items: center;
                        background-color: #f5f5f7;
                        border-radius: 24px;
                        padding: 6px 15px;
                        border: 1px solid var(--border-color);
                        gap: 8px;
                        margin-left: auto;
                        position: relative;
                    }
                    
                    .session-type-indicator {
                        width: 10px;
                        height: 10px;
                        border-radius: 50%;
                        background-color: #3498db;
                        margin-right: 3px;
                    }
                    
                    .work-session .session-type-indicator {
                        background-color: #3498db;
                    }
                    
                    .short-break-session .session-type-indicator {
                        background-color: #2ecc71;
                    }
                    
                    .long-break-session .session-type-indicator {
                        background-color: #9b59b6;
                    }
                    
                    .pomodoro-time {
                        font-size: 1.2rem;
                        font-weight: 600;
                        font-variant-numeric: tabular-nums;
                        min-width: 60px;
                        text-align: center;
                    }
                    
                    .pomodoro-session-info {
                        font-size: 0.8rem;
                        color: var(--text-secondary);
                        white-space: nowrap;
                    }
                    
                    .timer-controls {
                        display: flex;
                        gap: 4px;
                    }
                    
                    .timer-btn {
                        background: none;
                        border: none;
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        color: var(--text-secondary);
                        font-size: 0.9rem;
                        transition: all 0.2s ease;
                    }
                    
                    .timer-btn:hover {
                        background-color: rgba(0,0,0,0.05);
                        color: var(--text-color);
                    }
                    
                    .timer-btn.active {
                        color: var(--primary-color);
                    }
                    
                    .pomodoro-settings-btn {
                        background: none;
                        border: none;
                        font-size: 1.1rem;
                        color: var(--text-secondary);
                        cursor: pointer;
                        width: 32px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        transition: all 0.2s ease;
                    }
                    
                    .pomodoro-settings-btn:hover {
                        background-color: rgba(0,0,0,0.05);
                        color: var(--primary-color);
                    }
                    
                    .pomodoro-content {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                        padding: 16px;
                    }
                    
                    .pomodoro-tasks-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 12px;
                    }
                    
                    .pomodoro-tasks-title {
                        font-size: 1.1rem;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    }
                    
                    #tasks-counter {
                        font-size: 0.85rem;
                        color: var(--text-secondary);
                        background-color: #f5f5f7;
                        padding: 3px 10px;
                        border-radius: 12px;
                    }
                    
                    .pomodoro-tasks-container {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                        background-color: var(--card-bg);
                        border-radius: 8px;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    }
                    
                    .pomodoro-task-list-wrapper {
                        flex: 1;
                        overflow-y: auto;
                        padding: 8px 16px;
                    }
                    
                    .pomodoro-task-list {
                        list-style: none;
                    }
                    
                    .pomodoro-task-item {
                        margin-bottom: 8px;
                        position: relative;
                    }
                    
                    .pomodoro-task-content {
                        padding: 8px 10px;
                        background-color: #f8f9fa;
                        border-radius: 6px;
                        display: flex;
                        align-items: center;
                        transition: all 0.2s ease;
                        position: relative;
                        border: 1px solid transparent;
                    }
                    
                    .pomodoro-task-content:hover {
                        background-color: #f1f3f5;
                        border-color: #e9ecef;
                    }
                    
                    .pomodoro-task-checkbox {
                        width: 16px;
                        height: 16px;
                        cursor: pointer;
                        accent-color: var(--primary-color);
                        margin-right: 10px;
                    }
                    
                    .pomodoro-task-text {
                        flex: 1;
                        font-size: 14px;
                        color: var(--text-color);
                        word-break: break-word;
                        padding-right: 10px;
                    }
                    
                    .pomodoro-task-completed .pomodoro-task-text {
                        text-decoration: line-through;
                        color: #999;
                    }
                    
                    .pomodoro-task-controls {
                        opacity: 0.3;
                        display: flex;
                        gap: 4px;
                        transition: opacity 0.2s ease;
                    }
                    
                    .pomodoro-task-content:hover .pomodoro-task-controls {
                        opacity: 1;
                    }
                    
                    .pomodoro-task-btn {
                        background: none;
                        border: none;
                        font-size: 0.85rem;
                        color: #666;
                        cursor: pointer;
                        width: 24px;
                        height: 24px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 4px;
                        transition: all 0.15s ease;
                    }
                    
                    .pomodoro-task-btn:hover {
                        background-color: rgba(0,0,0,0.05);
                        color: #333;
                    }
                    
                    .pomodoro-task-delete:hover {
                        color: #f44336;
                        background-color: rgba(244,67,54,0.1);
                    }
                    
                    .pomodoro-add-task-area {
                        padding: 12px 16px;
                        border-top: 1px solid var(--border-color);
                        background-color: #f8f9fa;
                    }
                    
                    .pomodoro-add-task {
                        display: flex;
                        gap: 8px;
                    }
                    
                    .pomodoro-add-task-input {
                        flex: 1;
                        padding: 8px 12px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-family: 'Open Sans', sans-serif;
                        font-size: 14px;
                        background-color: white;
                        transition: border-color 0.2s ease;
                    }
                    
                    .pomodoro-add-task-input:focus {
                        outline: none;
                        border-color: var(--primary-color);
                    }
                    
                    .pomodoro-add-task-btn {
                        background-color: var(--primary-color);
                        color: white;
                        border: none;
                        border-radius: 4px;
                        padding: 8px 12px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        font-weight: 500;
                        transition: background-color 0.2s ease;
                    }
                    
                    .pomodoro-add-task-btn:hover {
                        background-color: var(--primary-dark);
                    }
                    
                    .pomodoro-no-tasks {
                        padding: 40px 20px;
                        text-align: center;
                        color: #999;
                        font-style: italic;
                    }
                    
                    .timer-progress {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        height: 3px;
                        background-color: var(--primary-color);
                        transition: width 1s linear;
                    }
                </style>
            </head>
            <body>
                <div class="pomodoro-header">
                    <div class="pomodoro-title-area">
                        <div class="pomodoro-title">
                            <i class="fas fa-clock"></i> Pomodoro
                        </div>
                    </div>
                    
                    <div class="pomodoro-timer-display work-session">
                        <div class="session-type-indicator"></div>
                        <div id="pomodoro-time" class="pomodoro-time">25:00</div>
                        <div class="pomodoro-session-info">
                            <span id="session-type">Work</span>
                            <span id="session-count"> • Session 1</span>
                        </div>
                        <div class="timer-controls">
                            <button id="play-pause-btn" class="timer-btn" title="Start/Pause">
                                <i class="fas fa-play"></i>
                            </button>
                            <button id="reset-btn" class="timer-btn" title="Reset">
                                <i class="fas fa-stop"></i>
                            </button>
                        </div>
                        <div class="timer-progress" id="timer-progress" style="width: 0%;"></div>
                    </div>
                    
                    <button class="pomodoro-settings-btn" id="settings-btn" title="Settings">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
                
                <div class="pomodoro-content">
                    <div class="pomodoro-tasks-header">
                        <div class="pomodoro-tasks-title">
                            <i class="fas fa-tasks"></i>
                            Tasks
                            <span id="tasks-counter">0 tasks</span>
                        </div>
                    </div>
                    
                    <div class="pomodoro-tasks-container">
                        <div class="pomodoro-task-list-wrapper">
                            <ul class="pomodoro-task-list" id="task-list">
                                <div class="pomodoro-no-tasks" id="no-tasks-message">
                                    No tasks yet. Add one below to get started!
                                </div>
                            </ul>
                        </div>
                        
                        <div class="pomodoro-add-task-area">
                            <div class="pomodoro-add-task">
                                <input type="text" 
                                       class="pomodoro-add-task-input" 
                                       id="new-task-input" 
                                       placeholder="Add a new task..."
                                       maxlength="200">
                                <button class="pomodoro-add-task-btn" id="add-task-btn">
                                    <i class="fas fa-plus"></i>
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `);
        popupDoc.close();
    }

    initializePomodoroPopup() {
        const popupDoc = this.popupWindow.document;
        
        // Initialize timer display
        this.updateTimerDisplay();
        this.renderTasks();
        
        // Set up event listeners in popup
        const playPauseBtn = popupDoc.getElementById('play-pause-btn');
        const resetBtn = popupDoc.getElementById('reset-btn');
        const addTaskBtn = popupDoc.getElementById('add-task-btn');
        const newTaskInput = popupDoc.getElementById('new-task-input');
        
        playPauseBtn.addEventListener('click', () => this.toggleTimer());
        resetBtn.addEventListener('click', () => this.resetTimer());
        addTaskBtn.addEventListener('click', () => this.addTask());
        
        newTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        
        // Focus the input
        newTaskInput.focus();
    }

    toggleTimer() {
        if (this.timerState.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        this.timerState.isRunning = true;
        this.timerState.startTime = Date.now();
        
        this.timerState.timerInterval = setInterval(() => {
            this.timerState.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timerState.timeRemaining <= 0) {
                this.completeSession();
            }
        }, 1000);
        
        this.updatePlayPauseButton();
    }

    pauseTimer() {
        this.timerState.isRunning = false;
        this.timerState.pauseTime = Date.now();
        
        if (this.timerState.timerInterval) {
            clearInterval(this.timerState.timerInterval);
            this.timerState.timerInterval = null;
        }
        
        this.updatePlayPauseButton();
    }

    resetTimer() {
        this.pauseTimer();
        
        if (this.timerState.currentSession === 'work') {
            this.timerState.timeRemaining = this.timerSettings.workDuration;
        } else if (this.timerState.currentSession === 'shortBreak') {
            this.timerState.timeRemaining = this.timerSettings.shortBreakDuration;
        } else {
            this.timerState.timeRemaining = this.timerSettings.longBreakDuration;
        }
        
        this.updateTimerDisplay();
    }

    completeSession() {
        this.pauseTimer();
        
        if (this.timerState.currentSession === 'work') {
            this.timerState.sessionCount++;
            
            // Play completion sound (if supported)
            this.playNotificationSound();
            
            // Determine next session type
            if (this.timerState.sessionCount % this.timerSettings.sessionsBeforeLongBreak === 0) {
                this.startBreakSession('longBreak');
            } else {
                this.startBreakSession('shortBreak');
            }
        } else {
            // Break completed, return to work
            this.startWorkSession();
        }
    }

    startWorkSession() {
        this.timerState.currentSession = 'work';
        this.timerState.timeRemaining = this.timerSettings.workDuration;
        this.updateSessionDisplay();
        this.updateTimerDisplay();
    }

    startBreakSession(type) {
        this.timerState.currentSession = type;
        
        if (type === 'shortBreak') {
            this.timerState.timeRemaining = this.timerSettings.shortBreakDuration;
        } else {
            this.timerState.timeRemaining = this.timerSettings.longBreakDuration;
        }
        
        this.updateSessionDisplay();
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        if (!this.popupWindow || this.popupWindow.closed) return;
        
        const popupDoc = this.popupWindow.document;
        const timeElement = popupDoc.getElementById('pomodoro-time');
        const progressElement = popupDoc.getElementById('timer-progress');
        
        if (timeElement) {
            const minutes = Math.floor(this.timerState.timeRemaining / 60);
            const seconds = this.timerState.timeRemaining % 60;
            timeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (progressElement) {
            let totalDuration;
            if (this.timerState.currentSession === 'work') {
                totalDuration = this.timerSettings.workDuration;
            } else if (this.timerState.currentSession === 'shortBreak') {
                totalDuration = this.timerSettings.shortBreakDuration;
            } else {
                totalDuration = this.timerSettings.longBreakDuration;
            }
            
            const progress = ((totalDuration - this.timerState.timeRemaining) / totalDuration) * 100;
            progressElement.style.width = `${progress}%`;
        }
    }

    updateSessionDisplay() {
        if (!this.popupWindow || this.popupWindow.closed) return;
        
        const popupDoc = this.popupWindow.document;
        const sessionTypeElement = popupDoc.getElementById('session-type');
        const sessionCountElement = popupDoc.getElementById('session-count');
        const timerDisplay = popupDoc.querySelector('.pomodoro-timer-display');
        
        if (sessionTypeElement) {
            if (this.timerState.currentSession === 'work') {
                sessionTypeElement.textContent = 'Work';
            } else if (this.timerState.currentSession === 'shortBreak') {
                sessionTypeElement.textContent = 'Short Break';
            } else {
                sessionTypeElement.textContent = 'Long Break';
            }
        }
        
        if (sessionCountElement) {
            sessionCountElement.textContent = ` • Session ${this.timerState.sessionCount + 1}`;
        }
        
        if (timerDisplay) {
            timerDisplay.className = `pomodoro-timer-display ${this.timerState.currentSession.replace(/([A-Z])/g, '-$1').toLowerCase()}-session`;
        }
    }

    updatePlayPauseButton() {
        if (!this.popupWindow || this.popupWindow.closed) return;
        
        const popupDoc = this.popupWindow.document;
        const playPauseBtn = popupDoc.getElementById('play-pause-btn');
        
        if (playPauseBtn) {
            const icon = playPauseBtn.querySelector('i');
            if (this.timerState.isRunning) {
                icon.className = 'fas fa-pause';
                playPauseBtn.title = 'Pause';
                playPauseBtn.classList.add('active');
            } else {
                icon.className = 'fas fa-play';
                playPauseBtn.title = 'Start';
                playPauseBtn.classList.remove('active');
            }
        }
    }

    addTask() {
        if (!this.popupWindow || this.popupWindow.closed) return;
        
        const popupDoc = this.popupWindow.document;
        const newTaskInput = popupDoc.getElementById('new-task-input');
        const taskText = newTaskInput.value.trim();
        
        if (taskText) {
            const task = {
                id: this.taskData.nextId++,
                text: taskText,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            this.taskData.tasks.push(task);
            newTaskInput.value = '';
            this.renderTasks();
            this.saveData();
        }
    }

    toggleTask(taskId) {
        const task = this.taskData.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.renderTasks();
            this.saveData();
        }
    }

    deleteTask(taskId) {
        this.taskData.tasks = this.taskData.tasks.filter(t => t.id !== taskId);
        this.renderTasks();
        this.saveData();
    }

    renderTasks() {
        if (!this.popupWindow || this.popupWindow.closed) return;
        
        const popupDoc = this.popupWindow.document;
        const taskList = popupDoc.getElementById('task-list');
        const noTasksMessage = popupDoc.getElementById('no-tasks-message');
        const tasksCounter = popupDoc.getElementById('tasks-counter');
        
        if (!taskList) return;
        
        // Update tasks counter
        if (tasksCounter) {
            const completedCount = this.taskData.tasks.filter(t => t.completed).length;
            tasksCounter.textContent = `${completedCount}/${this.taskData.tasks.length} tasks`;
        }
        
        // Clear existing tasks
        taskList.innerHTML = '';
        
        if (this.taskData.tasks.length === 0) {
            if (noTasksMessage) {
                taskList.appendChild(noTasksMessage);
            }
        } else {
            this.taskData.tasks.forEach(task => {
                const taskItem = popupDoc.createElement('li');
                taskItem.className = `pomodoro-task-item${task.completed ? ' pomodoro-task-completed' : ''}`;
                
                taskItem.innerHTML = `
                    <div class="pomodoro-task-content">
                        <input type="checkbox" class="pomodoro-task-checkbox" ${task.completed ? 'checked' : ''}>
                        <span class="pomodoro-task-text">${this.escapeHtml(task.text)}</span>
                        <div class="pomodoro-task-controls">
                            <button class="pomodoro-task-btn pomodoro-task-delete" title="Delete task">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
                
                // Add event listeners
                const checkbox = taskItem.querySelector('.pomodoro-task-checkbox');
                const deleteBtn = taskItem.querySelector('.pomodoro-task-delete');
                
                checkbox.addEventListener('change', () => this.toggleTask(task.id));
                deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
                
                taskList.appendChild(taskItem);
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    playNotificationSound() {
        try {
            // Create a simple beep sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            // Audio not supported or blocked
            console.log('Audio notification not available');
        }
    }

    saveData() {
        const documentId = this.getDocumentId();
        if (documentId) {
            const data = {
                timerSettings: this.timerSettings,
                timerState: {
                    ...this.timerState,
                    timerInterval: null // Don't save the interval
                },
                taskData: this.taskData
            };
            
            try {
                localStorage.setItem(`pomodoro_data_${documentId}`, JSON.stringify(data));
            } catch (e) {
                console.error('Error saving Pomodoro data:', e);
            }
        }
    }

    loadSavedData() {
        const documentId = this.getDocumentId();
        if (documentId) {
            const saved = localStorage.getItem(`pomodoro_data_${documentId}`);
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    this.timerSettings = { ...this.timerSettings, ...data.timerSettings };
                    this.timerState = { ...this.timerState, ...data.timerState };
                    this.taskData = { ...this.taskData, ...data.taskData };
                    
                    // Reset timer interval
                    this.timerState.timerInterval = null;
                    this.timerState.isRunning = false;
                } catch (e) {
                    console.error('Error loading Pomodoro data:', e);
                }
            }
        }
    }

    getDocumentId() {
        // Try to get document ID from global variable or URL
        if (typeof DOCUMENT_ID !== 'undefined' && DOCUMENT_ID) {
            return DOCUMENT_ID;
        }
        
        // Fallback: extract from URL
        const pathParts = window.location.pathname.split('/');
        const editorIndex = pathParts.indexOf('editor');
        if (editorIndex !== -1 && pathParts[editorIndex + 1]) {
            return pathParts[editorIndex + 1];
        }
        
        return 'default';
    }

    getTaskCount() {
        return this.taskData.tasks.length;
    }

    isTimerRunning() {
        return this.timerState.isRunning;
    }
}

// Export for use in writing_modes.js
if (typeof window !== 'undefined') {
    window.PomodoroMode = PomodoroMode;
}