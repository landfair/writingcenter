/**
 * Greening Mode Implementation
 * Based on John McPhee's editing practice: reduce text while preserving voice and meaning
 */

class GreeningMode {
    constructor() {
        this.isActive = false;
        this.originalContent = null;
        this.goalType = null; // 'percentage', 'wordCount', 'lineCount'
        this.goalValue = 0;
        this.originalStats = {
            wordCount: 0,
            lineCount: 0,
            charCount: 0
        };
        this.selectedForDeletion = []; // Array of {id, element, text, wordCount}
        this.selectionCounter = 0;
        this.modalElement = null;
    }

    activate(options = {}) {
        this.isActive = false; // Will be set to true after goal is set
        
        // Store original content
        const editor = document.getElementById('editor');
        if (editor) {
            this.originalContent = editor.innerHTML;
        }
        
        // Calculate original statistics
        this.calculateOriginalStats();
        
        // Reset state
        this.selectedForDeletion = [];
        this.selectionCounter = 0;
        
        // Show goal setting modal
        this.showGoalModal();
        
        console.log('Greening Mode activated');
    }

    deactivate() {
        // Remove greening-specific elements
        this.clearGreeningElements();
        
        // Remove event listeners
        this.removeEventListeners();
        
        // Hide any open modals
        if (this.modalElement && this.modalElement.parentNode) {
            this.modalElement.parentNode.removeChild(this.modalElement);
            this.modalElement = null;
        }
        
        // Reset state
        this.goalType = null;
        this.goalValue = 0;
        this.selectedForDeletion = [];
        this.isActive = false;
        
        const editor = document.getElementById('editor');
        if (editor) {
            editor.classList.remove('greening-mode');
            editor.contentEditable = 'true';
        }
        
        console.log('Greening Mode deactivated');
    }

    calculateOriginalStats() {
        const editor = document.getElementById('editor');
        if (!editor) return;
        
        const text = editor.innerText || '';
        this.originalStats.wordCount = this.countWords(text);
        this.originalStats.charCount = text.length;
        this.originalStats.lineCount = Math.max(1, Math.round(this.originalStats.wordCount / 12)); // Approximate lines
    }

    countWords(text) {
        if (!text || text.trim().length === 0) return 0;
        return text.trim().split(/\s+/).length;
    }

    showGoalModal() {
        // Remove existing modal if any
        if (this.modalElement && this.modalElement.parentNode) {
            this.modalElement.parentNode.removeChild(this.modalElement);
        }

        // Create modal backdrop
        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'greening-modal-backdrop';
        modalBackdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'greening-modal';
        modal.style.cssText = `
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            width: 90%;
            max-width: 600px;
            max-height: 85vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        `;

        // Modal header
        const modalHeader = document.createElement('div');
        modalHeader.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 25px;
            border-bottom: 2px solid #f4ebfa;
            background-color: #fcf9ff;
        `;

        const title = document.createElement('h3');
        title.textContent = 'Set Greening Goal';
        title.style.cssText = `
            margin: 0;
            color: #57068c;
            font-size: 1.4rem;
            font-weight: 600;
        `;

        const closeButton = document.createElement('button');
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.style.cssText = `
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #666;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
        `;
        closeButton.addEventListener('click', () => this.hideGoalModal());

        modalHeader.appendChild(title);
        modalHeader.appendChild(closeButton);

        // Modal content
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            flex: 1;
            padding: 25px;
            overflow-y: auto;
            background-color: #fafafa;
        `;

        // Info section
        const infoSection = document.createElement('div');
        infoSection.style.cssText = `
            background-color: #f9f4ff;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
            border-left: 4px solid #57068c;
        `;
        infoSection.innerHTML = `
            <h4 style="margin-top: 0; color: #57068c;">About Greening</h4>
            <p style="margin-bottom: 0; font-size: 0.9rem; line-height: 1.4;">
                Based on John McPhee's editing practice: reduce your text to fit constraints while preserving voice, message, and tone. 
                Select words and phrases to cut by double-clicking or dragging. Marked text appears in green.
            </p>
        `;

        // Current stats
        const statsSection = document.createElement('div');
        statsSection.style.cssText = `
            margin-bottom: 20px;
        `;
        statsSection.innerHTML = `
            <strong>Current Document Stats:</strong><br>
            <span>${this.originalStats.wordCount} words, ${this.originalStats.lineCount} lines, ${this.originalStats.charCount} characters</span>
        `;

        // Goal options
        const goalSection = document.createElement('div');
        goalSection.innerHTML = `
            <div style="margin-bottom: 20px;">
                <strong>Choose your greening goal:</strong>
            </div>
            
            <div style="margin: 15px 0;">
                <label style="display: flex; align-items: center; margin-bottom: 10px;">
                    <input type="radio" name="goalType" value="percentage" style="margin-right: 8px;">
                    <span>Reduce by percentage</span>
                </label>
                <div id="percentage-input" style="margin-left: 25px; display: none;">
                    <label>Reduce by: 
                        <input type="number" id="percentage-value" min="1" max="50" value="10" style="width: 60px; margin-left: 5px;">%
                    </label>
                    <div style="font-size: 0.85rem; color: #666; margin-top: 5px;">
                        Target: <span id="percentage-target">${Math.round(this.originalStats.wordCount * 0.9)}</span> words
                    </div>
                </div>
            </div>
            
            <div style="margin: 15px 0;">
                <label style="display: flex; align-items: center; margin-bottom: 10px;">
                    <input type="radio" name="goalType" value="wordCount" style="margin-right: 8px;">
                    <span>Cut specific word count</span>
                </label>
                <div id="wordcount-input" style="margin-left: 25px; display: none;">
                    <label>Cut: 
                        <input type="number" id="wordcount-value" min="1" max="1000" value="50" style="width: 80px; margin-left: 5px;"> words
                    </label>
                </div>
            </div>
            
            <div style="margin: 15px 0;">
                <label style="display: flex; align-items: center; margin-bottom: 10px;">
                    <input type="radio" name="goalType" value="lineCount" style="margin-right: 8px;">
                    <span>Reduce line count (McPhee style)</span>
                </label>
                <div id="linecount-input" style="margin-left: 25px; display: none;">
                    <label>Green: 
                        <input type="number" id="linecount-value" min="1" max="20" value="5" style="width: 60px; margin-left: 5px;"> lines
                    </label>
                    <div style="font-size: 0.85rem; color: #666; margin-top: 5px;">
                        Current: <span>${this.originalStats.lineCount}</span> lines
                    </div>
                </div>
            </div>
        `;

        modalContent.appendChild(infoSection);
        modalContent.appendChild(statsSection);
        modalContent.appendChild(goalSection);

        // Modal footer
        const modalFooter = document.createElement('div');
        modalFooter.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 25px;
            border-top: 1px solid #f0f0f0;
            background-color: white;
        `;

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.cssText = `
            padding: 8px 16px;
            background-color: #f4ebfa;
            color: #57068c;
            border: 1px solid #57068c;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        `;
        cancelButton.addEventListener('click', () => this.hideGoalModal());

        const setButton = document.createElement('button');
        setButton.textContent = 'Start Greening';
        setButton.style.cssText = `
            padding: 8px 16px;
            background-color: #57068c;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        `;
        setButton.addEventListener('click', () => this.setGoalFromModal());

        modalFooter.appendChild(cancelButton);
        modalFooter.appendChild(setButton);

        // Assemble modal
        modal.appendChild(modalHeader);
        modal.appendChild(modalContent);
        modal.appendChild(modalFooter);
        modalBackdrop.appendChild(modal);

        // Add to document
        document.body.appendChild(modalBackdrop);
        this.modalElement = modalBackdrop;

        // Set up event listeners for radio buttons
        this.setupGoalModalEvents(modal);

        // Add escape key handler
        this.escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.hideGoalModal();
                e.preventDefault();
            }
        };
        document.addEventListener('keydown', this.escapeHandler);
    }

    setupGoalModalEvents(modal) {
        // Radio button handling
        const radios = modal.querySelectorAll('input[name="goalType"]');
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                // Hide all input sections
                modal.querySelectorAll('[id$="-input"]').forEach(section => {
                    section.style.display = 'none';
                });
                
                // Show selected input section
                const targetSection = modal.querySelector(`#${e.target.value}-input`);
                if (targetSection) {
                    targetSection.style.display = 'block';
                }
                
                // Update percentage target calculation
                if (e.target.value === 'percentage') {
                    this.updatePercentageTarget();
                }
            });
        });
        
        // Percentage input handling
        const percentageInput = modal.querySelector('#percentage-value');
        if (percentageInput) {
            percentageInput.addEventListener('input', () => this.updatePercentageTarget());
        }
    }

    updatePercentageTarget() {
        if (!this.modalElement) return;
        
        const percentageInput = this.modalElement.querySelector('#percentage-value');
        const targetEl = this.modalElement.querySelector('#percentage-target');
        
        if (percentageInput && targetEl) {
            const percentage = parseInt(percentageInput.value) || 0;
            const wordsToRemove = Math.round(this.originalStats.wordCount * percentage / 100);
            targetEl.textContent = `${this.originalStats.wordCount - wordsToRemove}`;
        }
    }

    setGoalFromModal() {
        if (!this.modalElement) return;
        
        const selectedRadio = this.modalElement.querySelector('input[name="goalType"]:checked');
        
        if (!selectedRadio) {
            alert('Please select a goal type');
            return;
        }
        
        this.goalType = selectedRadio.value;
        
        switch (this.goalType) {
            case 'percentage':
                const percentage = parseInt(this.modalElement.querySelector('#percentage-value').value) || 10;
                this.goalValue = Math.round(this.originalStats.wordCount * percentage / 100);
                break;
            case 'wordCount':
                this.goalValue = parseInt(this.modalElement.querySelector('#wordcount-value').value) || 50;
                break;
            case 'lineCount':
                this.goalValue = parseInt(this.modalElement.querySelector('#linecount-value').value) || 5;
                break;
        }
        
        // Validate goal
        if (this.goalValue <= 0) {
            alert('Goal value must be greater than 0');
            return;
        }
        
        if (this.goalType === 'wordCount' && this.goalValue >= this.originalStats.wordCount) {
            alert('Cannot cut more words than the document contains');
            return;
        }
        
        // Hide modal and start greening
        this.hideGoalModal();
        this.startGreening();
    }

    hideGoalModal() {
        if (this.modalElement && this.modalElement.parentNode) {
            this.modalElement.parentNode.removeChild(this.modalElement);
            this.modalElement = null;
        }

        // Remove escape key handler
        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
            this.escapeHandler = null;
        }
    }

    startGreening() {
        this.isActive = true;
        
        const editor = document.getElementById('editor');
        if (!editor) return;
        
        // Make editor non-editable during greening
        editor.contentEditable = 'false';
        
        // Add greening class to editor
        editor.classList.add('greening-mode');
        
        // Set up event listeners for text selection
        this.setupEventListeners();
        
        console.log(`Greening goal set: ${this.getGoalDescription()}. Double-click or drag to select text for removal.`);
    }

    setupEventListeners() {
        const editor = document.getElementById('editor');
        if (!editor) return;
        
        // Double-click selection
        this.doubleClickHandler = this.handleDoubleClick.bind(this);
        editor.addEventListener('dblclick', this.doubleClickHandler);
        
        // Drag selection
        this.mouseUpHandler = this.handleMouseUp.bind(this);
        editor.addEventListener('mouseup', this.mouseUpHandler);
        
        // Prevent text editing
        this.keyDownHandler = this.preventEditing.bind(this);
        editor.addEventListener('keydown', this.keyDownHandler);
    }

    removeEventListeners() {
        const editor = document.getElementById('editor');
        if (!editor) return;
        
        if (this.doubleClickHandler) {
            editor.removeEventListener('dblclick', this.doubleClickHandler);
        }
        if (this.mouseUpHandler) {
            editor.removeEventListener('mouseup', this.mouseUpHandler);
        }
        if (this.keyDownHandler) {
            editor.removeEventListener('keydown', this.keyDownHandler);
        }
    }

    preventEditing(e) {
        // Allow navigation keys but prevent text input
        const allowedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'];
        if (!allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
        }
    }

    handleDoubleClick(e) {
        e.preventDefault();
        
        // Get the word at click position
        const range = this.getWordAtPosition(e);
        if (range) {
            this.toggleSelection(range);
        }
    }

    handleMouseUp(e) {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        
        if (selectedText && selectedText.length > 0) {
            const range = selection.getRangeAt(0);
            this.toggleSelection(range);
        }
    }

    getWordAtPosition(e) {
        // Simplified word selection - in a real implementation you'd want more sophisticated logic
        const selection = window.getSelection();
        const range = document.createRange();
        
        // Use the browser's word selection
        selection.selectAllChildren(e.target);
        if (selection.rangeCount > 0) {
            return selection.getRangeAt(0);
        }
        
        return null;
    }

    toggleSelection(range) {
        const selectedText = range.toString().trim();
        if (!selectedText) return;
        
        // Check if this text is already selected
        const existingSelection = this.findExistingSelection(selectedText, range);
        
        if (existingSelection) {
            // Remove existing selection
            this.removeSelection(existingSelection);
        } else {
            // Add new selection
            this.addSelection(range);
        }
    }

    findExistingSelection(text, range) {
        return this.selectedForDeletion.find(selection => {
            return selection.text === text;
        });
    }

    addSelection(range) {
        const selectedText = range.toString().trim();
        const wordCount = this.countWords(selectedText);
        
        // Create unique ID for this selection
        const selectionId = `greening-selection-${++this.selectionCounter}`;
        
        // Create a span to mark the selection
        const span = document.createElement('span');
        span.className = 'greening-selected';
        span.id = selectionId;
        span.style.cssText = `
            background-color: rgba(76, 175, 80, 0.3);
            border-bottom: 2px solid #4caf50;
            cursor: pointer;
            padding: 1px 2px;
            border-radius: 2px;
        `;
        span.setAttribute('title', `Selected for deletion: "${selectedText}"`);
        
        // Surround the range with the span
        try {
            range.surroundContents(span);
            
            // Store selection data
            const selectionData = {
                id: selectionId,
                element: span,
                text: selectedText,
                wordCount: wordCount,
                range: range.cloneRange()
            };
            
            this.selectedForDeletion.push(selectionData);
            
            // Add click handler to remove selection
            span.addEventListener('click', () => {
                this.removeSelection(selectionData);
            });
            
        } catch (error) {
            console.error('Error adding selection:', error);
        }
    }

    removeSelection(selectionData) {
        // Remove from array
        const index = this.selectedForDeletion.indexOf(selectionData);
        if (index > -1) {
            this.selectedForDeletion.splice(index, 1);
        }
        
        // Remove from DOM
        if (selectionData.element && selectionData.element.parentNode) {
            const parent = selectionData.element.parentNode;
            while (selectionData.element.firstChild) {
                parent.insertBefore(selectionData.element.firstChild, selectionData.element);
            }
            parent.removeChild(selectionData.element);
            parent.normalize();
        }
    }

    clearAllSelections() {
        // Remove all selections
        const selections = [...this.selectedForDeletion]; // Copy array
        selections.forEach(selection => {
            this.removeSelection(selection);
        });
        
        this.selectedForDeletion = [];
        console.log('All greening selections cleared');
    }

    applyGreening() {
        if (this.selectedForDeletion.length === 0) {
            alert('No text selected for removal');
            return;
        }

        // Remove all selected elements
        this.selectedForDeletion.forEach(selection => {
            if (selection.element && selection.element.parentNode) {
                selection.element.parentNode.removeChild(selection.element);
            }
        });

        // Clear selections array
        this.selectedForDeletion = [];

        // Re-enable editing
        const editor = document.getElementById('editor');
        if (editor) {
            editor.contentEditable = 'true';
            editor.classList.remove('greening-mode');
        }

        // Remove event listeners
        this.removeEventListeners();

        console.log('Greening applied successfully!');
    }

    clearGreeningElements() {
        // Remove all greening selection spans
        const editor = document.getElementById('editor');
        if (editor) {
            const greeningSpans = editor.querySelectorAll('.greening-selected');
            greeningSpans.forEach(span => {
                const parent = span.parentNode;
                if (parent) {
                    while (span.firstChild) {
                        parent.insertBefore(span.firstChild, span);
                    }
                    parent.removeChild(span);
                }
            });
        }
    }

    getGoalDescription() {
        switch (this.goalType) {
            case 'percentage':
                const percentage = Math.round((this.goalValue / this.originalStats.wordCount) * 100);
                return `Reduce by ${percentage}% (${this.goalValue} words)`;
            case 'wordCount':
                return `Cut ${this.goalValue} words`;
            case 'lineCount':
                return `Green ${this.goalValue} lines`;
            default:
                return 'No goal set';
        }
    }

    calculateProgress() {
        const currentWordCount = this.selectedForDeletion.reduce((total, selection) => total + selection.wordCount, 0);
        
        switch (this.goalType) {
            case 'percentage':
            case 'wordCount':
                return Math.min((currentWordCount / this.goalValue) * 100, 100);
            case 'lineCount':
                const linesRemoved = Math.round(currentWordCount / 12);
                return Math.min((linesRemoved / this.goalValue) * 100, 100);
            default:
                return 0;
        }
    }

    isGoalMet() {
        return this.calculateProgress() >= 100;
    }

    getSelectedWordCount() {
        return this.selectedForDeletion.reduce((total, selection) => total + selection.wordCount, 0);
    }

    getGoalType() {
        return this.goalType;
    }

    getGoalValue() {
        return this.goalValue;
    }
}

// Export for use in writing_modes.js
if (typeof window !== 'undefined') {
    window.GreeningMode = GreeningMode;
}