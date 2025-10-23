/**
 * Fire Mode Implementation
 * Helps users identify and position their most important sentences
 */

class FireMode {
    constructor() {
        this.isActive = false;
        this.stage = 'selection'; // 'selection' or 'restructuring'
        this.selectedSentences = [];
        this.sentenceElements = {};
        this.originalContent = '';
    }

    activate(options = {}) {
        this.isActive = true;
        this.stage = 'selection';
        this.selectedSentences = [];
        this.sentenceElements = {};

        const editor = document.getElementById('editor');
        if (!editor) return;

        // Store original content
        this.originalContent = editor.innerHTML;

        // Add Fire mode class
        editor.classList.add('fire-mode');

        // Add fire background
        this.addFireBackground();

        // Convert to selectable sentences
        this.convertToBlock();
        this.makeSentencesSelectable();

        console.log('Fire Mode activated - Stage 1: Select key sentences');
    }

    deactivate() {
        this.isActive = false;

        const editor = document.getElementById('editor');
        if (!editor) return;

        // Remove Fire mode class
        editor.classList.remove('fire-mode', 'fire-restructuring');

        // Remove fire background
        this.removeFireBackground();

        // Restore original content
        if (this.originalContent) {
            editor.innerHTML = this.originalContent;
        }

        // Reset state
        this.selectedSentences = [];
        this.sentenceElements = {};
        this.stage = 'selection';

        console.log('Fire Mode deactivated');
    }

    addFireBackground() {
        const editor = document.getElementById('editor');
        if (!editor) return;

        // Remove existing fire background
        this.removeFireBackground();

        // Add fire background element
        const fireBackground = document.createElement('div');
        fireBackground.className = 'fire-background';
        editor.style.position = 'relative';
        editor.appendChild(fireBackground);
    }

    removeFireBackground() {
        const editor = document.getElementById('editor');
        if (!editor) return;

        const fireBackground = editor.querySelector('.fire-background');
        if (fireBackground) {
            fireBackground.remove();
        }
    }

    convertToBlock() {
        const editor = document.getElementById('editor');
        if (!editor) return;

        const content = editor.innerText;

        // Create a new paragraph to hold the selectable sentences
        const newPara = document.createElement('p');

        // Detect sentences
        const sentences = this.detectSentences(content);

        // Reset sentence elements
        this.sentenceElements = {};

        // Create spans for each detected sentence
        sentences.forEach((sentence, sentenceId) => {
            // Create a span for the sentence
            const sentenceSpan = document.createElement('span');
            sentenceSpan.className = 'fire-sentence';
            sentenceSpan.textContent = sentence;
            sentenceSpan.dataset.sentenceId = sentenceId;

            // Store reference to the element
            this.sentenceElements[sentenceId] = sentenceSpan;

            // Add click handler for selection
            sentenceSpan.addEventListener('click', (e) => {
                if (this.stage === 'selection') {
                    this.toggleSentenceSelection(e.target);
                }
            });

            // Check if this sentence was previously selected
            if (this.selectedSentences.includes(sentenceId.toString())) {
                sentenceSpan.classList.add('fire-selected');
            }

            // Add space between sentences
            if (sentenceId > 0) {
                newPara.appendChild(document.createTextNode(' '));
            }

            // Add the sentence span
            newPara.appendChild(sentenceSpan);
        });

        // Replace editor content
        editor.innerHTML = '';
        editor.appendChild(newPara);

        // Re-add fire background
        this.addFireBackground();
    }

    detectSentences(text) {
        // Improved sentence detection
        const sentences = [];
        
        // Split by sentence-ending punctuation, but be careful about abbreviations
        const rawSentences = text.split(/(?<=[.!?])\s+(?=[A-Z])/);
        
        rawSentences.forEach(sentence => {
            const trimmed = sentence.trim();
            if (trimmed.length > 0) {
                sentences.push(trimmed);
            }
        });

        return sentences;
    }

    makeSentencesSelectable() {
        const editor = document.getElementById('editor');
        if (!editor) return;

        // Add selectable mode
        editor.classList.remove('fire-restructuring');
        
        // Enable selection for all fire sentences
        const sentences = editor.querySelectorAll('.fire-sentence');
        sentences.forEach(sentence => {
            sentence.style.cursor = 'pointer';
        });
    }

    toggleSentenceSelection(sentenceElement) {
        if (this.stage !== 'selection') return;

        const sentenceId = sentenceElement.dataset.sentenceId;

        if (sentenceElement.classList.contains('fire-selected')) {
            // Deselect the sentence
            sentenceElement.classList.remove('fire-selected');

            // Remove from selectedSentences array
            const index = this.selectedSentences.indexOf(sentenceId);
            if (index !== -1) {
                this.selectedSentences.splice(index, 1);
            }
        } else {
            // Select the sentence
            sentenceElement.classList.add('fire-selected');

            // Add to selectedSentences array
            if (!this.selectedSentences.includes(sentenceId)) {
                this.selectedSentences.push(sentenceId);
            }
        }

        // Update the counter
        this.updateSelectionCounter();
    }

    updateSelectionCounter() {
        const counter = document.getElementById('fire-selection-counter');
        if (counter) {
            counter.textContent = `${this.selectedSentences.length} sentences selected`;
        }
    }

    proceedToRestructuring() {
        if (this.selectedSentences.length === 0) {
            alert('Please select at least one key sentence before proceeding.');
            return;
        }

        this.stage = 'restructuring';

        // Restore paragraph structure while keeping sentences highlighted
        this.restoreParagraphs();

        // Update editor class
        const editor = document.getElementById('editor');
        if (editor) {
            editor.classList.add('fire-restructuring');
        }

        console.log('Fire Mode - Stage 2: Restructuring');
    }

    restoreParagraphs() {
        const editor = document.getElementById('editor');
        if (!editor || !this.originalContent) return;

        // Store the texts of selected sentences for later highlighting
        const selectedSentenceTexts = this.selectedSentences.map(id => 
            this.sentenceElements[id] ? this.sentenceElements[id].textContent.trim() : ''
        ).filter(text => text.length > 0);

        // Restore original content
        editor.innerHTML = this.originalContent;

        // Re-add fire background
        this.addFireBackground();

        // Highlight selected sentences in the restored content
        this.highlightSelectedSentences(selectedSentenceTexts);
    }

    highlightSelectedSentences(selectedTexts) {
        const editor = document.getElementById('editor');
        if (!editor) return;

        // Find and highlight selected sentences
        const walker = document.createTreeWalker(
            editor,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        textNodes.forEach(textNode => {
            let text = textNode.textContent;
            let modified = false;

            selectedTexts.forEach(selectedText => {
                if (text.includes(selectedText)) {
                    // Replace with highlighted version
                    const regex = new RegExp(this.escapeRegex(selectedText), 'gi');
                    text = text.replace(regex, `<span class="fire-sentence fire-selected fire-target-position">${selectedText}</span>`);
                    modified = true;
                }
            });

            if (modified) {
                // Replace text node with HTML
                const parent = textNode.parentNode;
                const fragment = document.createRange().createContextualFragment(text);
                parent.replaceChild(fragment, textNode);
            }
        });
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    returnToSelection() {
        this.stage = 'selection';

        // Convert back to block format
        this.convertToBlock();
        this.makeSentencesSelectable();

        // Remove restructuring class
        const editor = document.getElementById('editor');
        if (editor) {
            editor.classList.remove('fire-restructuring');
        }

        console.log('Fire Mode - Returned to Stage 1: Selection');
    }

    getSelectedCount() {
        return this.selectedSentences.length;
    }

    getStage() {
        return this.stage;
    }
}

// Export for use in writing_modes.js
if (typeof window !== 'undefined') {
    window.FireMode = FireMode;
}