/**
 * Writing Modes Panel JavaScript
 * Handles the modes panel functionality and mode activation
 */

class WritingModesManager {
    constructor() {
        this.currentMode = null;
        this.modeOptions = {};
        this.modeInstances = {};
        this.init();
    }

    init() {
        this.initializeModeInstances();
        this.bindEvents();
        this.initializeModeCards();
        
        // Ensure active mode indicator is hidden by default
        this.updateActiveModeIndicator(null);
    }

    initializeModeInstances() {
        // Initialize mode instances
        if (typeof TextrisMode !== 'undefined') {
            this.modeInstances.textris = new TextrisMode();
        }
        if (typeof FireMode !== 'undefined') {
            this.modeInstances.fire = new FireMode();
        }
        if (typeof ReaderMode !== 'undefined') {
            this.modeInstances.reader = new ReaderMode();
        }
        if (typeof MetaMode !== 'undefined') {
            this.modeInstances.meta = new MetaMode();
        }
        if (typeof KeyTermsMode !== 'undefined') {
            this.modeInstances.keyTerms = new KeyTermsMode();
        }
        if (typeof InfraredMode !== 'undefined') {
            this.modeInstances.infrared = new InfraredMode();
        }
        if (typeof PomodoroMode !== 'undefined') {
            this.modeInstances.pomodoro = new PomodoroMode();
        }
        if (typeof GreeningMode !== 'undefined') {
            this.modeInstances.greening = new GreeningMode();
        }
        if (typeof SourceSynthesisMode !== 'undefined') {
            this.modeInstances.sourceSynthesis = new SourceSynthesisMode();
        }
        if (typeof AudienceMode !== 'undefined') {
            this.modeInstances.audience = new AudienceMode();
        }
        if (typeof WordCloudMode !== 'undefined') {
            this.modeInstances.wordCloud = new WordCloudMode();
        }
        // More mode instances will be added here
    }

    bindEvents() {
        // Modes panel toggle
        const modesToggleBtn = document.getElementById('modes-toggle-btn');
        const modesPanel = document.getElementById('modes-panel');
        const modesPanelOverlay = document.getElementById('modes-panel-overlay');
        const closePanelBtn = document.getElementById('close-modes-panel');

        if (modesToggleBtn) {
            modesToggleBtn.addEventListener('click', () => this.openModesPanel());
        }

        if (closePanelBtn) {
            closePanelBtn.addEventListener('click', () => this.closeModesPanel());
        }

        if (modesPanelOverlay) {
            modesPanelOverlay.addEventListener('click', () => this.closeModesPanel());
        }

        // ESC key to close panel
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isPanelOpen()) {
                this.closeModesPanel();
            }
        });

        // Global event delegation for mode activation buttons
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.activate-mode-btn:not([disabled])');
            if (button) {
                e.preventDefault();
                this.handleModeActivation(button);
            }
        });

        // Disable mode button
        const disableModeBtn = document.getElementById('disable-mode-btn');
        if (disableModeBtn) {
            disableModeBtn.addEventListener('click', () => this.disableCurrentMode());
        }
    }

    initializeModeCards() {
        // Add any initialization for mode cards
        const modeCards = document.querySelectorAll('.mode-card:not(.disabled)');
        modeCards.forEach(card => {
            const mode = card.dataset.mode;
            if (mode) {
                // Initialize mode-specific settings
                this.initializeMode(mode, card);
            }
        });
    }

    initializeMode(mode, card) {
        // Initialize mode-specific elements like selects
        switch (mode) {
            case 'textris':
                const textrisSelect = card.querySelector('#textris-panel-select');
                if (textrisSelect) {
                    textrisSelect.addEventListener('change', (e) => {
                        this.modeOptions.textris = { level: e.target.value };
                    });
                }
                break;
            case 'infrared':
                const infraredSelect = card.querySelector('#infrared-pattern-select');
                if (infraredSelect) {
                    infraredSelect.addEventListener('change', (e) => {
                        this.modeOptions.infrared = { pattern: e.target.value };
                    });
                }
                break;
        }
    }

    openModesPanel() {
        const modesPanel = document.getElementById('modes-panel');
        const modesPanelOverlay = document.getElementById('modes-panel-overlay');
        const modesToggleBtn = document.getElementById('modes-toggle-btn');

        if (modesPanel && modesPanelOverlay) {
            modesPanel.classList.add('visible');
            modesPanelOverlay.classList.add('visible');
            
            // Update ARIA attributes
            modesPanel.setAttribute('aria-hidden', 'false');
            modesPanelOverlay.setAttribute('aria-hidden', 'false');
            
            if (modesToggleBtn) {
                modesToggleBtn.setAttribute('aria-expanded', 'true');
            }

            // Focus management
            const firstFocusable = modesPanel.querySelector('button, select, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }
    }

    closeModesPanel() {
        const modesPanel = document.getElementById('modes-panel');
        const modesPanelOverlay = document.getElementById('modes-panel-overlay');
        const modesToggleBtn = document.getElementById('modes-toggle-btn');

        if (modesPanel && modesPanelOverlay) {
            modesPanel.classList.remove('visible');
            modesPanelOverlay.classList.remove('visible');
            
            // Update ARIA attributes
            modesPanel.setAttribute('aria-hidden', 'true');
            modesPanelOverlay.setAttribute('aria-hidden', 'true');
            
            if (modesToggleBtn) {
                modesToggleBtn.setAttribute('aria-expanded', 'false');
                modesToggleBtn.focus(); // Return focus to toggle button
            }
        }
    }

    isPanelOpen() {
        const modesPanel = document.getElementById('modes-panel');
        return modesPanel && modesPanel.classList.contains('visible');
    }

    handleModeActivation(button) {
        const modeCard = button.closest('.mode-card');
        if (!modeCard || !modeCard.dataset.mode) return;

        const modeName = modeCard.dataset.mode;
        console.log(`Activating ${modeName} mode`);

        // Get mode-specific options
        const options = this.getModeOptions(modeName, modeCard);

        // Activate the mode
        this.activateMode(modeName, options);

        // Close the panel
        this.closeModesPanel();
    }

    getModeOptions(modeName, modeCard) {
        const options = {};

        switch (modeName) {
            case 'textris':
                const textrisSelect = modeCard.querySelector('#textris-panel-select');
                if (textrisSelect) {
                    options.level = textrisSelect.value;
                }
                break;
            case 'infrared':
                const infraredSelect = modeCard.querySelector('#infrared-pattern-select');
                if (infraredSelect) {
                    options.pattern = infraredSelect.value;
                }
                break;
        }

        return options;
    }

    activateMode(modeName, options = {}) {
        // Disable current mode first
        if (this.currentMode) {
            this.disableCurrentMode();
        }

        this.currentMode = modeName;
        this.modeOptions[modeName] = options;

        // Update UI
        this.updateActiveModeIndicator(modeName);
        this.updateModeCards(modeName);

        // Activate mode-specific functionality
        this.executeMode(modeName, options);

        // Show notification
        this.showNotification(`${this.getModeDisplayName(modeName)} activated`);
    }

    disableCurrentMode() {
        if (!this.currentMode) return;

        console.log(`Disabling ${this.currentMode} mode`);

        // Disable mode-specific functionality
        this.deactivateMode(this.currentMode);

        // Update UI
        this.updateActiveModeIndicator(null);
        this.updateModeCards(null);

        // Clear current mode
        this.currentMode = null;

        // Show notification
        this.showNotification('Mode disabled');
    }

    executeMode(modeName, options) {
        // This is where mode-specific functionality would be implemented
        // For now, we'll just log the activation
        console.log(`Executing ${modeName} mode with options:`, options);

        switch (modeName) {
            case 'textris':
                this.activateTextrisMode(options);
                break;
            case 'fire':
                this.activateFireMode(options);
                break;
            case 'reader':
                this.activateReaderMode(options);
                break;
            case 'meta':
                this.activateMetaMode(options);
                break;
            case 'keyTerms':
                this.activateKeyTermsMode(options);
                break;
            case 'infrared':
                this.activateInfraredMode(options);
                break;
            case 'pomodoro':
                this.activatePomodoroMode(options);
                break;
            case 'greening':
                this.activateGreeningMode(options);
                break;
            case 'sourceSynthesis':
                this.activateSourceSynthesisMode(options);
                break;
            case 'audience':
                this.activateAudienceMode(options);
                break;
            case 'wordCloud':
                this.activateWordCloudMode(options);
                break;
        }
    }

    deactivateMode(modeName) {
        // Deactivate mode-specific functionality
        switch (modeName) {
            case 'textris':
                this.deactivateTextrisMode();
                break;
            case 'fire':
                this.deactivateFireMode();
                break;
            case 'reader':
                this.deactivateReaderMode();
                break;
            case 'meta':
                this.deactivateMetaMode();
                break;
            case 'keyTerms':
                this.deactivateKeyTermsMode();
                break;
            case 'infrared':
                this.deactivateInfraredMode();
                break;
            case 'pomodoro':
                this.deactivatePomodoroMode();
                break;
            case 'greening':
                this.deactivateGreeningMode();
                break;
            case 'sourceSynthesis':
                this.deactivateSourceSynthesisMode();
                break;
            case 'audience':
                this.deactivateAudienceMode();
                break;
            case 'wordCloud':
                this.deactivateWordCloudMode();
                break;
        }
    }

    updateActiveModeIndicator(modeName) {
        const activeModeIndicator = document.getElementById('active-mode-indicator');
        const activeModeName = document.getElementById('active-mode-name');
        const disableModeBtn = document.getElementById('disable-mode-btn');

        if (activeModeIndicator && activeModeName) {
            if (modeName) {
                // Show the indicator and update content
                activeModeIndicator.classList.add('visible');
                activeModeName.textContent = this.getModeDisplayName(modeName);
                if (disableModeBtn) {
                    disableModeBtn.style.display = 'inline-block';
                }
            } else {
                // Hide the entire indicator when no mode is active
                activeModeIndicator.classList.remove('visible');
                activeModeName.textContent = 'No mode active';
                if (disableModeBtn) {
                    disableModeBtn.style.display = 'none';
                }
            }
        }
    }

    updateModeCards(activeModeName) {
        const modeCards = document.querySelectorAll('.mode-card:not(.disabled)');
        modeCards.forEach(card => {
            if (card.dataset.mode === activeModeName) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    getModeDisplayName(modeName) {
        const displayNames = {
            textris: 'Textris Mode',
            fire: 'Fire Mode',
            reader: 'Reader Mode',
            meta: 'Meta Mode',
            keyTerms: 'Key Terms Mode',
            infrared: 'Infrared Mode',
            pomodoro: 'Pomodoro Mode',
            greening: 'Greening Mode',
            sourceSynthesis: 'Source Synthesis Mode',
            audience: 'Audience Perspective Mode',
            wordCloud: 'Word Cloud Mode'
        };
        return displayNames[modeName] || modeName;
    }

    showNotification(message) {
        const notification = document.getElementById('notification');
        const notificationMessage = document.getElementById('notification-message');
        
        if (notification && notificationMessage) {
            notificationMessage.textContent = message;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
    }

    // Mode-specific functionality implementations
    activateTextrisMode(options) { 
        if (this.modeInstances.textris) {
            this.modeInstances.textris.activate(options);
            this.setupTextrisOptions(options);
        }
    }
    
    deactivateTextrisMode() { 
        if (this.modeInstances.textris) {
            this.modeInstances.textris.deactivate();
        }
    }

    setupTextrisOptions(options) {
        const activeModeOptions = document.getElementById('active-mode-options');
        if (!activeModeOptions) return;

        // Clear existing options
        activeModeOptions.innerHTML = '';

        // Create level select
        const optionContainer = document.createElement('div');
        optionContainer.className = 'mode-option';

        const optionLabel = document.createElement('span');
        optionLabel.className = 'mode-option-label';
        optionLabel.textContent = 'Level: ';

        const levelSelect = document.createElement('select');
        levelSelect.className = 'mode-option-select';

        const paragraphOption = document.createElement('option');
        paragraphOption.value = 'paragraph';
        paragraphOption.textContent = 'Paragraph';

        const sentenceOption = document.createElement('option');
        sentenceOption.value = 'sentence';
        sentenceOption.textContent = 'Sentence';

        levelSelect.appendChild(paragraphOption);
        levelSelect.appendChild(sentenceOption);
        levelSelect.value = options.level || 'paragraph';

        // Add event listener for level changes
        levelSelect.addEventListener('change', (e) => {
            if (this.modeInstances.textris) {
                this.modeInstances.textris.setLevel(e.target.value);
            }
        });

        optionContainer.appendChild(optionLabel);
        optionContainer.appendChild(levelSelect);
        activeModeOptions.appendChild(optionContainer);

        // Add history buttons
        const historyContainer = document.createElement('div');
        historyContainer.className = 'textris-history-buttons';

        const undoBtn = document.createElement('button');
        undoBtn.className = 'textris-history-btn';
        undoBtn.textContent = 'Undo';
        undoBtn.addEventListener('click', () => {
            if (this.modeInstances.textris) {
                this.modeInstances.textris.undo();
            }
        });

        const redoBtn = document.createElement('button');
        redoBtn.className = 'textris-history-btn';
        redoBtn.textContent = 'Redo';
        redoBtn.addEventListener('click', () => {
            if (this.modeInstances.textris) {
                this.modeInstances.textris.redo();
            }
        });

        historyContainer.appendChild(undoBtn);
        historyContainer.appendChild(redoBtn);
        activeModeOptions.appendChild(historyContainer);
    }
    
    activateFireMode(options) { 
        if (this.modeInstances.fire) {
            this.modeInstances.fire.activate(options);
            this.setupFireOptions();
        }
    }
    
    deactivateFireMode() { 
        if (this.modeInstances.fire) {
            this.modeInstances.fire.deactivate();
        }
    }

    setupFireOptions() {
        const activeModeOptions = document.getElementById('active-mode-options');
        if (!activeModeOptions) return;

        // Clear existing options
        activeModeOptions.innerHTML = '';

        // Update options based on current stage
        this.updateFireOptions();

        // Set up periodic updates for dynamic content
        this.fireOptionsInterval = setInterval(() => {
            this.updateFireOptions();
        }, 500);
    }

    updateFireOptions() {
        if (!this.modeInstances.fire || !this.modeInstances.fire.isActive) {
            if (this.fireOptionsInterval) {
                clearInterval(this.fireOptionsInterval);
                this.fireOptionsInterval = null;
            }
            return;
        }

        const activeModeOptions = document.getElementById('active-mode-options');
        if (!activeModeOptions) return;

        const stage = this.modeInstances.fire.getStage();
        const selectedCount = this.modeInstances.fire.getSelectedCount();

        // Clear and rebuild options
        activeModeOptions.innerHTML = '';

        if (stage === 'selection') {
            // Stage 1: Selection
            const stageIndicator = document.createElement('div');
            stageIndicator.className = 'fire-stage-indicator';
            stageIndicator.innerHTML = '<i class="fas fa-fire"></i> Stage 1: Select key sentences';
            activeModeOptions.appendChild(stageIndicator);

            // Selection counter
            const selectionCounter = document.createElement('div');
            selectionCounter.id = 'fire-selection-counter';
            selectionCounter.className = 'fire-counter';
            selectionCounter.textContent = `${selectedCount} sentences selected`;
            activeModeOptions.appendChild(selectionCounter);

            // Button container
            const btnContainer = document.createElement('div');
            btnContainer.className = 'fire-toolbar-group';

            // Restore original button
            const restoreBtn = document.createElement('button');
            restoreBtn.className = 'fire-mode-btn';
            restoreBtn.innerHTML = '<i class="fas fa-undo"></i> Restore Original';
            restoreBtn.addEventListener('click', () => {
                if (confirm('Restore original paragraphs? This will exit Fire Mode.')) {
                    this.disableCurrentMode();
                }
            });

            // Next stage button
            const nextStageBtn = document.createElement('button');
            nextStageBtn.className = 'fire-mode-btn';
            nextStageBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Restructure';
            nextStageBtn.disabled = selectedCount === 0;
            nextStageBtn.addEventListener('click', () => {
                this.modeInstances.fire.proceedToRestructuring();
            });

            btnContainer.appendChild(restoreBtn);
            btnContainer.appendChild(nextStageBtn);
            activeModeOptions.appendChild(btnContainer);

        } else if (stage === 'restructuring') {
            // Stage 2: Restructuring
            const stageIndicator = document.createElement('div');
            stageIndicator.className = 'fire-stage-indicator';
            stageIndicator.innerHTML = '<i class="fas fa-fire"></i> Stage 2: Restructure';
            activeModeOptions.appendChild(stageIndicator);

            // Sentence counter
            const sentenceCounter = document.createElement('div');
            sentenceCounter.id = 'fire-sentence-counter';
            sentenceCounter.className = 'fire-counter';
            sentenceCounter.textContent = `${selectedCount} key sentences highlighted`;
            activeModeOptions.appendChild(sentenceCounter);

            // Button container
            const btnContainer = document.createElement('div');
            btnContainer.className = 'fire-toolbar-group';

            // Previous stage button
            const prevStageBtn = document.createElement('button');
            prevStageBtn.className = 'fire-mode-btn';
            prevStageBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Previous Stage';
            prevStageBtn.addEventListener('click', () => {
                this.modeInstances.fire.returnToSelection();
            });

            // Finish button
            const finishBtn = document.createElement('button');
            finishBtn.className = 'fire-mode-btn';
            finishBtn.innerHTML = '<i class="fas fa-check"></i> Finish';
            finishBtn.addEventListener('click', () => {
                if (confirm('Finish Fire Mode? Your key sentences will remain highlighted.')) {
                    this.disableCurrentMode();
                }
            });

            btnContainer.appendChild(prevStageBtn);
            btnContainer.appendChild(finishBtn);
            activeModeOptions.appendChild(btnContainer);
        }
    }
    
    activateReaderMode(options) { 
        if (this.modeInstances.reader) {
            this.modeInstances.reader.activate(options);
        }
    }
    
    deactivateReaderMode() { 
        if (this.modeInstances.reader) {
            this.modeInstances.reader.deactivate();
        }
    }
    
    activateMetaMode(options) { 
        if (this.modeInstances.meta) {
            this.modeInstances.meta.activate(options);
        }
    }
    deactivateMetaMode() { 
        if (this.modeInstances.meta) {
            this.modeInstances.meta.deactivate();
        }
    }
    
    activateKeyTermsMode(options) { 
        if (this.modeInstances.keyTerms) {
            this.modeInstances.keyTerms.activate(options);
            this.setupKeyTermsOptions();
        }
    }
    deactivateKeyTermsMode() { 
        if (this.modeInstances.keyTerms) {
            this.modeInstances.keyTerms.deactivate();
        }
    }

    setupKeyTermsOptions() {
        const activeModeOptions = document.getElementById('active-mode-options');
        if (!activeModeOptions) return;

        // Clear existing options
        activeModeOptions.innerHTML = '';

        // Create edit terms button
        const editButton = document.createElement('button');
        editButton.className = 'mode-option-btn';
        editButton.innerHTML = '<i class="fas fa-edit"></i> Edit Terms';
        editButton.style.cssText = `
            background-color: #57068c;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 16px;
            font-size: 14px;
            cursor: pointer;
            margin-right: 10px;
        `;
        editButton.addEventListener('click', () => {
            if (this.modeInstances.keyTerms) {
                this.modeInstances.keyTerms.showKeyTermsPanel();
            }
        });

        // Create highlight button
        const highlightButton = document.createElement('button');
        highlightButton.className = 'mode-option-btn';
        highlightButton.innerHTML = '<i class="fas fa-highlighter"></i> Apply Highlighting';
        highlightButton.style.cssText = `
            background-color: #57068c;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 16px;
            font-size: 14px;
            cursor: pointer;
            margin-right: 10px;
        `;
        highlightButton.addEventListener('click', () => {
            if (this.modeInstances.keyTerms) {
                this.modeInstances.keyTerms.applyHighlighting();
            }
        });

        // Create clear button
        const clearButton = document.createElement('button');
        clearButton.className = 'mode-option-btn';
        clearButton.innerHTML = '<i class="fas fa-eraser"></i> Clear Highlighting';
        clearButton.style.cssText = `
            background-color: #f4ebfa;
            color: #57068c;
            border: 1px solid #57068c;
            border-radius: 6px;
            padding: 8px 16px;
            font-size: 14px;
            cursor: pointer;
            margin-right: 10px;
        `;
        clearButton.addEventListener('click', () => {
            if (this.modeInstances.keyTerms) {
                this.modeInstances.keyTerms.removeHighlighting();
            }
        });

        // Add term count display
        const termCount = document.createElement('span');
        termCount.className = 'mode-option-label';
        const count = this.modeInstances.keyTerms ? this.modeInstances.keyTerms.getTermsCount() : 0;
        termCount.textContent = `${count} term group${count !== 1 ? 's' : ''} defined`;
        termCount.style.cssText = `
            color: #666;
            font-size: 14px;
            margin-left: 10px;
        `;

        // Create container for the buttons
        const btnContainer = document.createElement('div');
        btnContainer.className = 'mode-options-container';
        btnContainer.style.cssText = `
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
        `;
        
        btnContainer.appendChild(editButton);
        btnContainer.appendChild(highlightButton);
        btnContainer.appendChild(clearButton);
        btnContainer.appendChild(termCount);

        activeModeOptions.appendChild(btnContainer);
    }
    
    activateInfraredMode(options) { 
        if (this.modeInstances.infrared) {
            this.modeInstances.infrared.activate(options);
            this.setupInfraredOptions();
        }
    }
    deactivateInfraredMode() { 
        if (this.modeInstances.infrared) {
            this.modeInstances.infrared.deactivate();
        }
    }

    setupInfraredOptions() {
        const activeModeOptions = document.getElementById('active-mode-options');
        if (!activeModeOptions) return;

        // Clear existing options
        activeModeOptions.innerHTML = '';

        // Create pattern selector
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'mode-options-group';
        selectorContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            margin-right: 15px;
        `;

        const selectorLabel = document.createElement('span');
        selectorLabel.className = 'mode-option-label';
        selectorLabel.textContent = 'Pattern:';
        selectorLabel.style.cssText = `
            color: #666;
            font-size: 14px;
        `;

        const patternSelector = document.createElement('select');
        patternSelector.className = 'toolbar-selector';
        patternSelector.id = 'infrared-pattern-selector';
        patternSelector.style.cssText = `
            padding: 4px 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background-color: white;
            font-size: 14px;
            cursor: pointer;
        `;

        // Add options for each pattern
        if (this.modeInstances.infrared) {
            Object.entries(this.modeInstances.infrared.patterns).forEach(([key, pattern]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = pattern.name;
                if (key === this.modeInstances.infrared.activePattern) {
                    option.selected = true;
                }
                patternSelector.appendChild(option);
            });
        }

        // Pattern change handler
        patternSelector.addEventListener('change', (e) => {
            if (this.modeInstances.infrared) {
                this.modeInstances.infrared.setPattern(e.target.value);
                this.updateInfraredStats();
            }
        });

        selectorContainer.appendChild(selectorLabel);
        selectorContainer.appendChild(patternSelector);

        // Create control buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'mode-options-group';
        buttonContainer.style.cssText = `
            display: flex;
            gap: 8px;
            margin-right: 15px;
        `;

        // Clear highlighting button
        const clearBtn = document.createElement('button');
        clearBtn.className = 'mode-option-btn';
        clearBtn.innerHTML = '<i class="fas fa-eraser"></i> Clear';
        clearBtn.style.cssText = `
            background-color: #f4ebfa;
            color: #57068c;
            border: 1px solid #57068c;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 13px;
            cursor: pointer;
        `;
        clearBtn.addEventListener('click', () => {
            if (this.modeInstances.infrared) {
                this.modeInstances.infrared.removeHighlighting();
                this.updateInfraredStats();
            }
        });

        // Refresh highlighting button
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'mode-option-btn';
        refreshBtn.innerHTML = '<i class="fas fa-sync"></i> Refresh';
        refreshBtn.style.cssText = `
            background-color: #57068c;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 13px;
            cursor: pointer;
        `;
        refreshBtn.addEventListener('click', () => {
            if (this.modeInstances.infrared) {
                this.modeInstances.infrared.applyHighlighting();
                this.updateInfraredStats();
            }
        });

        // Export analysis button
        const exportBtn = document.createElement('button');
        exportBtn.className = 'mode-option-btn';
        exportBtn.innerHTML = '<i class="fas fa-file-export"></i> Export';
        exportBtn.style.cssText = `
            background-color: #f4ebfa;
            color: #57068c;
            border: 1px solid #57068c;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 13px;
            cursor: pointer;
        `;
        exportBtn.addEventListener('click', () => {
            if (this.modeInstances.infrared) {
                this.modeInstances.infrared.exportAnalysis();
            }
        });

        buttonContainer.appendChild(clearBtn);
        buttonContainer.appendChild(refreshBtn);
        buttonContainer.appendChild(exportBtn);

        // Create stats display
        const statsContainer = document.createElement('div');
        statsContainer.className = 'infrared-stats-container';
        statsContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 5px;
        `;

        const statsDisplay = document.createElement('span');
        statsDisplay.id = 'infrared-stats';
        statsDisplay.className = 'mode-option-label';
        statsDisplay.style.cssText = `
            font-weight: 500;
            font-size: 14px;
            color: #666;
        `;

        // Add pattern description
        const descriptionDiv = document.createElement('div');
        descriptionDiv.className = 'infrared-description';
        descriptionDiv.style.cssText = `
            font-size: 0.85rem;
            color: #666;
            font-style: italic;
            line-height: 1.3;
            max-width: 400px;
        `;

        statsContainer.appendChild(statsDisplay);
        statsContainer.appendChild(descriptionDiv);

        // Create main container
        const mainContainer = document.createElement('div');
        mainContainer.className = 'infrared-mode-options';
        mainContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        `;

        mainContainer.appendChild(selectorContainer);
        mainContainer.appendChild(buttonContainer);
        mainContainer.appendChild(statsContainer);

        // Add to active mode options
        activeModeOptions.appendChild(mainContainer);

        // Update initial stats display
        this.updateInfraredStats();
    }

    updateInfraredStats() {
        const statsEl = document.getElementById('infrared-stats');
        const descEl = document.querySelector('.infrared-description');
        
        if (statsEl && this.modeInstances.infrared && this.modeInstances.infrared.activePattern) {
            const count = this.modeInstances.infrared.getHighlightCount();
            const patternName = this.modeInstances.infrared.getActivePatternName();
            const description = this.modeInstances.infrared.getPatternDescription();
            
            statsEl.textContent = `${count} ${patternName.toLowerCase()} found`;
            
            if (descEl) {
                descEl.textContent = description;
            }
        }
    }
    
    activatePomodoroMode(options) { 
        if (this.modeInstances.pomodoro) {
            this.modeInstances.pomodoro.activate(options);
            this.setupPomodoroOptions();
        }
    }
    deactivatePomodoroMode() { 
        if (this.modeInstances.pomodoro) {
            this.modeInstances.pomodoro.deactivate();
        }
    }

    setupPomodoroOptions() {
        const activeModeOptions = document.getElementById('active-mode-options');
        if (!activeModeOptions) return;

        // Clear existing options
        activeModeOptions.innerHTML = '';

        // Create a simple indicator showing Pomodoro is active
        const pomodoroIndicator = document.createElement('div');
        pomodoroIndicator.className = 'pomodoro-toolbar-indicator';
        pomodoroIndicator.innerHTML = '<i class="fas fa-clock"></i> Pomodoro Active';
        pomodoroIndicator.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            color: #57068c;
            font-size: 14px;
            font-weight: 500;
        `;

        // Add toggle button to show/hide the Pomodoro window
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'pomodoro-btn';
        toggleBtn.innerHTML = '<i class="fas fa-external-link-alt"></i> Show Timer';
        toggleBtn.style.cssText = `
            background-color: #57068c;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 13px;
            cursor: pointer;
            margin-left: 10px;
        `;
        toggleBtn.addEventListener('click', () => {
            if (this.modeInstances.pomodoro) {
                if (this.modeInstances.pomodoro.popupWindow && !this.modeInstances.pomodoro.popupWindow.closed) {
                    this.modeInstances.pomodoro.popupWindow.focus();
                } else {
                    this.modeInstances.pomodoro.createPomodoroWindow();
                }
            }
        });

        // Add status display
        const statusDisplay = document.createElement('span');
        statusDisplay.className = 'pomodoro-status-indicator';
        statusDisplay.style.cssText = `
            background-color: #f4ebfa;
            color: #57068c;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            border: 1px solid #57068c;
            margin-left: 10px;
        `;
        
        if (this.modeInstances.pomodoro) {
            const options = this.modeInstances.pomodoro.getOptions();
            statusDisplay.textContent = `${options.taskCount} tasks`;
            
            if (options.isRunning) {
                statusDisplay.classList.add('running');
            }
        }

        // Create container for the indicator
        const container = document.createElement('div');
        container.className = 'pomodoro-mode-options';
        container.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        `;
        
        container.appendChild(pomodoroIndicator);
        container.appendChild(toggleBtn);
        container.appendChild(statusDisplay);

        // Add to active mode options
        activeModeOptions.appendChild(container);
    }
    
    activateGreeningMode(options) { 
        if (this.modeInstances.greening) {
            this.modeInstances.greening.activate(options);
            this.setupGreeningOptions();
        }
    }
    deactivateGreeningMode() { 
        if (this.modeInstances.greening) {
            this.modeInstances.greening.deactivate();
        }
    }

    setupGreeningOptions() {
        const activeModeOptions = document.getElementById('active-mode-options');
        if (!activeModeOptions) return;

        // Clear existing options
        activeModeOptions.innerHTML = '';

        // Create main container
        const container = document.createElement('div');
        container.className = 'greening-mode-options';
        container.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        `;

        // Goal status display
        const goalStatus = document.createElement('div');
        goalStatus.className = 'greening-goal-status';
        goalStatus.style.cssText = `
            background-color: #f4ebfa;
            color: #57068c;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            border: 1px solid #57068c;
        `;

        if (this.modeInstances.greening && this.modeInstances.greening.isActive) {
            const goalDesc = this.modeInstances.greening.getGoalDescription();
            const progress = this.modeInstances.greening.calculateProgress();
            goalStatus.textContent = `${goalDesc} (${Math.round(progress)}% selected)`;
        } else {
            goalStatus.textContent = 'Setting goal...';
        }

        // Clear selections button
        const clearBtn = document.createElement('button');
        clearBtn.className = 'greening-btn';
        clearBtn.innerHTML = '<i class="fas fa-eraser"></i> Clear Selections';
        clearBtn.style.cssText = `
            background-color: #f4ebfa;
            color: #57068c;
            border: 1px solid #57068c;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 13px;
            cursor: pointer;
        `;
        clearBtn.addEventListener('click', () => {
            if (this.modeInstances.greening) {
                this.modeInstances.greening.clearAllSelections();
                this.updateGreeningStatus();
            }
        });

        // Apply greening button
        const applyBtn = document.createElement('button');
        applyBtn.className = 'greening-btn';
        applyBtn.innerHTML = '<i class="fas fa-check"></i> Apply Greening';
        applyBtn.style.cssText = `
            background-color: #4caf50;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 13px;
            cursor: pointer;
        `;
        applyBtn.addEventListener('click', () => {
            if (this.modeInstances.greening) {
                if (confirm('Apply greening? This will permanently delete selected text.')) {
                    this.modeInstances.greening.applyGreening();
                    this.disableCurrentMode();
                }
            }
        });

        // Progress display
        const progressDisplay = document.createElement('div');
        progressDisplay.className = 'greening-progress';
        progressDisplay.style.cssText = `
            color: #666;
            font-size: 14px;
            margin-left: 10px;
        `;

        if (this.modeInstances.greening) {
            const selectedCount = this.modeInstances.greening.getSelectedWordCount();
            progressDisplay.textContent = `${selectedCount} words selected for removal`;
        }

        container.appendChild(goalStatus);
        container.appendChild(clearBtn);
        container.appendChild(applyBtn);
        container.appendChild(progressDisplay);

        activeModeOptions.appendChild(container);

        // Set up periodic updates for progress
        this.greeningUpdateInterval = setInterval(() => {
            this.updateGreeningStatus();
        }, 1000);
    }

    updateGreeningStatus() {
        if (!this.modeInstances.greening || !this.modeInstances.greening.isActive) {
            if (this.greeningUpdateInterval) {
                clearInterval(this.greeningUpdateInterval);
                this.greeningUpdateInterval = null;
            }
            return;
        }

        const goalStatusEl = document.querySelector('.greening-goal-status');
        const progressEl = document.querySelector('.greening-progress');

        if (goalStatusEl) {
            const goalDesc = this.modeInstances.greening.getGoalDescription();
            const progress = this.modeInstances.greening.calculateProgress();
            goalStatusEl.textContent = `${goalDesc} (${Math.round(progress)}% selected)`;
            
            // Update color based on progress
            if (progress >= 100) {
                goalStatusEl.style.backgroundColor = '#e8f5e8';
                goalStatusEl.style.color = '#2e7d32';
                goalStatusEl.style.borderColor = '#4caf50';
            }
        }

        if (progressEl) {
            const selectedCount = this.modeInstances.greening.getSelectedWordCount();
            progressEl.textContent = `${selectedCount} words selected for removal`;
        }
    }
    
    activateSourceSynthesisMode(options) { 
        if (this.modeInstances.sourceSynthesis) {
            this.modeInstances.sourceSynthesis.activate(options);
            this.setupSourceSynthesisOptions();
        }
    }
    deactivateSourceSynthesisMode() { 
        if (this.modeInstances.sourceSynthesis) {
            this.modeInstances.sourceSynthesis.deactivate();
        }
    }

    setupSourceSynthesisOptions() {
        const activeModeOptions = document.getElementById('active-mode-options');
        if (!activeModeOptions) return;

        // Clear existing options
        activeModeOptions.innerHTML = '';

        // Create main container
        const container = document.createElement('div');
        container.className = 'source-synthesis-mode-options';
        container.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        `;

        // Source count status
        const sourceStatus = document.createElement('div');
        sourceStatus.className = 'source-synthesis-status';
        sourceStatus.style.cssText = `
            background-color: #f4ebfa;
            color: #57068c;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            border: 1px solid #57068c;
        `;

        if (this.modeInstances.sourceSynthesis) {
            const sourceCount = this.modeInstances.sourceSynthesis.getSourcesCount();
            sourceStatus.textContent = `${sourceCount} source${sourceCount !== 1 ? 's' : ''} tracked`;
        } else {
            sourceStatus.textContent = 'No sources defined';
        }

        // Edit sources button
        const editBtn = document.createElement('button');
        editBtn.className = 'source-synthesis-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Sources';
        editBtn.style.cssText = `
            background-color: #57068c;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 13px;
            cursor: pointer;
        `;
        editBtn.addEventListener('click', () => {
            if (this.modeInstances.sourceSynthesis) {
                this.modeInstances.sourceSynthesis.showSourceSynthesisPanel();
            }
        });

        // Apply highlighting button
        const highlightBtn = document.createElement('button');
        highlightBtn.className = 'source-synthesis-btn';
        highlightBtn.innerHTML = '<i class="fas fa-highlighter"></i> Apply Highlighting';
        highlightBtn.style.cssText = `
            background-color: #4caf50;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 13px;
            cursor: pointer;
        `;
        highlightBtn.addEventListener('click', () => {
            if (this.modeInstances.sourceSynthesis) {
                this.modeInstances.sourceSynthesis.applyHighlighting();
            }
        });

        // Clear highlighting button
        const clearBtn = document.createElement('button');
        clearBtn.className = 'source-synthesis-btn';
        clearBtn.innerHTML = '<i class="fas fa-eraser"></i> Clear';
        clearBtn.style.cssText = `
            background-color: #f4ebfa;
            color: #57068c;
            border: 1px solid #57068c;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 13px;
            cursor: pointer;
        `;
        clearBtn.addEventListener('click', () => {
            if (this.modeInstances.sourceSynthesis) {
                this.modeInstances.sourceSynthesis.removeHighlighting();
            }
        });

        // Export analysis button
        const exportBtn = document.createElement('button');
        exportBtn.className = 'source-synthesis-btn';
        exportBtn.innerHTML = '<i class="fas fa-file-export"></i> Export Analysis';
        exportBtn.style.cssText = `
            background-color: #f4ebfa;
            color: #57068c;
            border: 1px solid #57068c;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 13px;
            cursor: pointer;
        `;
        exportBtn.addEventListener('click', () => {
            if (this.modeInstances.sourceSynthesis) {
                this.modeInstances.sourceSynthesis.exportIntegrationAnalysis();
            }
        });

        // Stats display
        const statsDisplay = document.createElement('div');
        statsDisplay.className = 'source-synthesis-stats';
        statsDisplay.style.cssText = `
            color: #666;
            font-size: 14px;
            margin-left: 10px;
        `;

        if (this.modeInstances.sourceSynthesis) {
            const highlightCount = this.modeInstances.sourceSynthesis.getHighlightCount();
            statsDisplay.textContent = `${highlightCount} terms highlighted`;
        }

        container.appendChild(sourceStatus);
        container.appendChild(editBtn);
        container.appendChild(highlightBtn);
        container.appendChild(clearBtn);
        container.appendChild(exportBtn);
        container.appendChild(statsDisplay);

        activeModeOptions.appendChild(container);
    }
    
    activateAudienceMode(options) { 
        if (this.modeInstances.audience) {
            this.modeInstances.audience.activate(options);
            this.setupAudienceOptions();
        }
    }
    deactivateAudienceMode() { 
        if (this.modeInstances.audience) {
            this.modeInstances.audience.deactivate();
        }
    }

    setupAudienceOptions() {
        const activeModeOptions = document.getElementById('active-mode-options');
        if (!activeModeOptions) return;

        // Clear existing options
        activeModeOptions.innerHTML = '';

        // Create main container
        const container = document.createElement('div');
        container.className = 'audience-mode-options';
        container.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        `;

        // Annotation count status
        const annotationStatus = document.createElement('div');
        annotationStatus.className = 'audience-status';
        annotationStatus.style.cssText = `
            background-color: #f4ebfa;
            color: #57068c;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            border: 1px solid #57068c;
        `;

        if (this.modeInstances.audience) {
            const annotationCount = this.modeInstances.audience.getAnnotationCount();
            annotationStatus.textContent = `${annotationCount} annotation${annotationCount !== 1 ? 's' : ''}`;
        } else {
            annotationStatus.textContent = 'No annotations';
        }

        // Persona selector
        const personaSelector = document.createElement('select');
        personaSelector.className = 'audience-persona-select';
        personaSelector.style.cssText = `
            padding: 4px 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background-color: white;
            font-size: 13px;
            cursor: pointer;
        `;

        const personas = [
            { value: 'expert', label: 'Expert Reader' },
            { value: 'novice', label: 'Novice Reader' },
            { value: 'skeptical', label: 'Skeptical Reader' },
            { value: 'timeconstrained', label: 'Time-Constrained Reader' },
            { value: 'generous', label: 'Generous Reader' }
        ];

        personas.forEach(persona => {
            const option = document.createElement('option');
            option.value = persona.value;
            option.textContent = persona.label;
            personaSelector.appendChild(option);
        });

        if (this.modeInstances.audience) {
            personaSelector.value = this.modeInstances.audience.currentPersona;
        }

        personaSelector.addEventListener('change', (e) => {
            if (this.modeInstances.audience) {
                this.modeInstances.audience.currentPersona = e.target.value;
            }
        });

        // Clear annotations button
        const clearBtn = document.createElement('button');
        clearBtn.className = 'audience-btn';
        clearBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Clear All';
        clearBtn.style.cssText = `
            background-color: #f4ebfa;
            color: #57068c;
            border: 1px solid #57068c;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 13px;
            cursor: pointer;
        `;
        clearBtn.addEventListener('click', () => {
            if (this.modeInstances.audience) {
                this.modeInstances.audience.clearAllAnnotations();
                this.updateAudienceStatus();
            }
        });

        // Export annotations button
        const exportBtn = document.createElement('button');
        exportBtn.className = 'audience-btn';
        exportBtn.innerHTML = '<i class="fas fa-file-export"></i> Export';
        exportBtn.style.cssText = `
            background-color: #57068c;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 13px;
            cursor: pointer;
        `;
        exportBtn.addEventListener('click', () => {
            if (this.modeInstances.audience) {
                this.modeInstances.audience.exportAnnotations();
            }
        });

        // Stats display
        const statsDisplay = document.createElement('div');
        statsDisplay.className = 'audience-stats';
        statsDisplay.style.cssText = `
            color: #666;
            font-size: 14px;
            margin-left: 10px;
        `;

        if (this.modeInstances.audience) {
            const personaStats = this.modeInstances.audience.getPersonaStats();
            const personaCount = Object.keys(personaStats).length;
            statsDisplay.textContent = `${personaCount} persona${personaCount !== 1 ? 's' : ''} used`;
        }

        container.appendChild(annotationStatus);
        container.appendChild(personaSelector);
        container.appendChild(clearBtn);
        container.appendChild(exportBtn);
        container.appendChild(statsDisplay);

        activeModeOptions.appendChild(container);

        // Add persona guidance
        this.addPersonaGuidance();
    }

    addPersonaGuidance() {
        const toolbarModes = document.querySelector('.editor-toolbar-modes');
        if (!toolbarModes) return;

        // Remove existing guidance
        const existingGuidance = document.getElementById('audience-persona-guidance');
        if (existingGuidance) {
            existingGuidance.remove();
        }

        // Create guidance container
        const guidanceContainer = document.createElement('div');
        guidanceContainer.id = 'audience-persona-guidance';
        guidanceContainer.style.cssText = `
            margin-top: 10px;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        `;

        const currentPersona = this.modeInstances.audience ? this.modeInstances.audience.currentPersona : 'expert';
        const guidance = this.getPersonaGuidance(currentPersona);

        guidanceContainer.innerHTML = `
            <div class="audience-guidance-header ${currentPersona}-persona" style="display: flex; align-items: center; gap: 10px; padding: 10px 15px; font-weight: 500; border-bottom: 1px solid rgba(0, 0, 0, 0.1); background-color: ${guidance.bgColor}; color: ${guidance.color};">
                <i class="${guidance.icon}"></i> 
                <span>Reading as: ${guidance.title}</span>
            </div>
            <div class="audience-guidance-prompts" style="padding: 15px; background-color: white; border: 1px solid #e9ecef; border-top: none;">
                ${guidance.prompts.map(prompt => `
                    <div class="audience-prompt" style="padding: 8px 12px; background-color: #f8f9fa; border-radius: 4px; margin-bottom: 8px; font-size: 14px; line-height: 1.4; border-left: 3px solid ${guidance.color};">
                        ${prompt}
                    </div>
                `).join('')}
            </div>
        `;

        toolbarModes.appendChild(guidanceContainer);
    }

    getPersonaGuidance(persona) {
        const guidance = {
            expert: {
                title: 'Expert Reader',
                icon: 'fas fa-graduation-cap',
                color: '#9b59b6',
                bgColor: 'rgba(155, 89, 182, 0.1)',
                prompts: [
                    'What specialized terminology needs more precision?',
                    'Where could disciplinary conventions be better followed?',
                    'What important citations or references are missing?',
                    'Where could theoretical connections be strengthened?'
                ]
            },
            novice: {
                title: 'Novice Reader',
                icon: 'fas fa-book-open',
                color: '#3498db',
                bgColor: 'rgba(52, 152, 219, 0.1)',
                prompts: [
                    'What terms need definition for a newcomer?',
                    'Where is background knowledge assumed?',
                    'Which sections need more concrete examples?',
                    'What connections need to be made more explicit?'
                ]
            },
            skeptical: {
                title: 'Skeptical Reader',
                icon: 'fas fa-question-circle',
                color: '#e67e22',
                bgColor: 'rgba(230, 126, 34, 0.1)',
                prompts: [
                    'What counterarguments might this reader raise?',
                    'Where is evidence insufficient or unconvincing?',
                    'What claims need stronger support?',
                    'Where might bias or assumptions show through?'
                ]
            },
            timeconstrained: {
                title: 'Time-Constrained Reader',
                icon: 'fas fa-clock',
                color: '#2ecc71',
                bgColor: 'rgba(46, 204, 113, 0.1)',
                prompts: [
                    'What information is essential vs. nice-to-have?',
                    'Where could key points be highlighted better?',
                    'What sections could be condensed?',
                    'How can you front-load the main message?'
                ]
            },
            generous: {
                title: 'Generous Reader',
                icon: 'fas fa-star',
                color: '#f1c40f',
                bgColor: 'rgba(241, 196, 15, 0.1)',
                prompts: [
                    'What are the strengths of this argument?',
                    'Where does the writing show particular insight?',
                    'What connections or implications could be developed further?',
                    'How does this contribute to the broader conversation?'
                ]
            }
        };
        return guidance[persona] || guidance.expert;
    }

    updateAudienceStatus() {
        const statusEl = document.querySelector('.audience-status');
        const statsEl = document.querySelector('.audience-stats');
        
        if (statusEl && this.modeInstances.audience) {
            const annotationCount = this.modeInstances.audience.getAnnotationCount();
            statusEl.textContent = `${annotationCount} annotation${annotationCount !== 1 ? 's' : ''}`;
        }
        
        if (statsEl && this.modeInstances.audience) {
            const personaStats = this.modeInstances.audience.getPersonaStats();
            const personaCount = Object.keys(personaStats).length;
            statsEl.textContent = `${personaCount} persona${personaCount !== 1 ? 's' : ''} used`;
        }
    }
    
    activateWordCloudMode(options) { 
        if (this.modeInstances.wordCloud) {
            this.modeInstances.wordCloud.activate(options);
            this.setupWordCloudOptions();
        }
    }
    deactivateWordCloudMode() { 
        if (this.modeInstances.wordCloud) {
            this.modeInstances.wordCloud.deactivate();
        }
    }

    setupWordCloudOptions() {
        const activeModeOptions = document.getElementById('active-mode-options');
        if (!activeModeOptions) return;

        // Clear existing options
        activeModeOptions.innerHTML = '';

        // Create main container
        const container = document.createElement('div');
        container.className = 'word-cloud-mode-options';
        container.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        `;

        // Word count status
        const wordStatus = document.createElement('div');
        wordStatus.className = 'word-cloud-status';
        wordStatus.style.cssText = `
            background-color: #f4ebfa;
            color: #57068c;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            border: 1px solid #57068c;
        `;

        if (this.modeInstances.wordCloud) {
            const wordCount = this.modeInstances.wordCloud.getWordCount();
            wordStatus.textContent = `${wordCount} unique word${wordCount !== 1 ? 's' : ''}`;
        } else {
            wordStatus.textContent = 'Analyzing...';
        }

        // Regenerate button
        const regenerateBtn = document.createElement('button');
        regenerateBtn.className = 'word-cloud-btn';
        regenerateBtn.innerHTML = '<i class="fas fa-sync"></i> Regenerate';
        regenerateBtn.style.cssText = `
            background-color: #57068c;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 13px;
            cursor: pointer;
        `;
        regenerateBtn.addEventListener('click', () => {
            if (this.modeInstances.wordCloud) {
                this.modeInstances.wordCloud.regenerateCloud();
            }
        });

        // Export image button
        const exportImageBtn = document.createElement('button');
        exportImageBtn.className = 'word-cloud-btn';
        exportImageBtn.innerHTML = '<i class="fas fa-download"></i> Export Image';
        exportImageBtn.style.cssText = `
            background-color: #4caf50;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 13px;
            cursor: pointer;
        `;
        exportImageBtn.addEventListener('click', () => {
            if (this.modeInstances.wordCloud) {
                this.modeInstances.wordCloud.exportImage();
            }
        });

        // Export data button
        const exportDataBtn = document.createElement('button');
        exportDataBtn.className = 'word-cloud-btn';
        exportDataBtn.innerHTML = '<i class="fas fa-file-export"></i> Export Data';
        exportDataBtn.style.cssText = `
            background-color: #2196f3;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 13px;
            cursor: pointer;
        `;
        exportDataBtn.addEventListener('click', () => {
            if (this.modeInstances.wordCloud) {
                this.modeInstances.wordCloud.exportWordData();
            }
        });

        // Stats display
        const statsDisplay = document.createElement('div');
        statsDisplay.className = 'word-cloud-stats-display';
        statsDisplay.style.cssText = `
            color: #666;
            font-size: 14px;
            margin-left: 10px;
        `;

        if (this.modeInstances.wordCloud) {
            const maxFreq = this.modeInstances.wordCloud.getMaxFrequency();
            statsDisplay.textContent = `Max frequency: ${maxFreq}`;
        }

        container.appendChild(wordStatus);
        container.appendChild(regenerateBtn);
        container.appendChild(exportImageBtn);
        container.appendChild(exportDataBtn);
        container.appendChild(statsDisplay);

        activeModeOptions.appendChild(container);
    }
}

// Initialize the Writing Modes Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.writingModesManager = new WritingModesManager();
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WritingModesManager;
}