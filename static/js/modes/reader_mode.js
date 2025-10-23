/**
 * Reader Mode Implementation
 * Presents writing one sentence at a time for reflection
 */

class ReaderMode {
    constructor() {
        this.isActive = false;
        this.sentences = [];
        this.currentSentenceIndex = 0;
        this.reflections = {};
        this.modalElement = null;
    }

    activate(options = {}) {
        this.isActive = true;
        this.currentSentenceIndex = 0;
        this.reflections = {};

        const editor = document.getElementById('editor');
        if (!editor) return;

        // Parse sentences from the document
        this.parseSentences();

        // Load any saved reflections for this document
        this.loadReflections();

        // Create and show the Reader Mode modal
        this.createReaderModal();

        // Add body class for global styling
        document.body.classList.add('reader-mode-active');

        // Add escape key handler
        this.escapeHandler = (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.deactivate();
                e.preventDefault();
            }
        };
        document.addEventListener('keydown', this.escapeHandler);

        console.log('Reader Mode activated - Reflect as you reveal each sentence');
    }

    deactivate() {
        this.isActive = false;

        // Save reflections first
        try {
            this.saveReflections();
        } catch (e) {
            console.error('Error saving reflections:', e);
        }

        // Remove modal
        if (this.modalElement && this.modalElement.parentNode) {
            this.modalElement.parentNode.removeChild(this.modalElement);
        }

        // Remove body class
        document.body.classList.remove('reader-mode-active');

        // Remove escape key handler
        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
            this.escapeHandler = null;
        }

        // Reset state
        this.modalElement = null;
        this.currentSentenceIndex = 0;
        this.sentences = [];
        this.reflections = {};

        console.log('Reader Mode deactivated');
    }

    parseSentences() {
        const editor = document.getElementById('editor');
        if (!editor) return;

        const text = editor.innerText;
        this.sentences = [];

        // Split by sentence-ending punctuation
        const rawSentences = text.split(/(?<=[.!?])\s+(?=[A-Z])/);
        
        rawSentences.forEach(sentence => {
            const trimmed = sentence.trim();
            if (trimmed.length > 0) {
                this.sentences.push(trimmed);
            }
        });

        console.log(`Parsed ${this.sentences.length} sentences for Reader Mode`);
    }

    createReaderModal() {
        // Create modal backdrop
        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'reader-modal-backdrop';

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'reader-modal';

        // Modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'reader-modal-header';

        const title = document.createElement('h3');
        title.textContent = 'Reader Mode - Sentence by Sentence';

        const closeButton = document.createElement('button');
        closeButton.className = 'reader-modal-close';
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.addEventListener('click', () => this.deactivate());

        modalHeader.appendChild(title);
        modalHeader.appendChild(closeButton);

        // Modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'reader-modal-content';

        // Create container for sentences
        const container = document.createElement('div');
        container.id = 'reader-mode-container';
        container.className = 'reader-mode-integrated-container';

        modalContent.appendChild(container);

        // Modal footer
        const modalFooter = document.createElement('div');
        modalFooter.className = 'reader-modal-footer';

        const statusText = document.createElement('div');
        statusText.className = 'reader-status-text';
        statusText.id = 'reader-sentence-counter';
        statusText.textContent = `Sentence ${this.currentSentenceIndex + 1} of ${this.sentences.length}`;

        const footerButtons = document.createElement('div');
        footerButtons.className = 'reader-footer-buttons';

        const exitButton = document.createElement('button');
        exitButton.className = 'reader-footer-button secondary';
        exitButton.textContent = 'Exit Reader Mode';
        exitButton.addEventListener('click', () => this.deactivate());

        const revealAllButton = document.createElement('button');
        revealAllButton.className = 'reader-footer-button secondary';
        revealAllButton.textContent = 'Reveal All';
        revealAllButton.addEventListener('click', () => this.revealAllSentences());

        footerButtons.appendChild(exitButton);
        footerButtons.appendChild(revealAllButton);

        modalFooter.appendChild(statusText);
        modalFooter.appendChild(footerButtons);

        // Assemble modal
        modal.appendChild(modalHeader);
        modal.appendChild(modalContent);
        modal.appendChild(modalFooter);
        modalBackdrop.appendChild(modal);

        // Add to document
        document.body.appendChild(modalBackdrop);
        this.modalElement = modalBackdrop;

        // Show first sentence
        this.showNextSentence();
    }

    showNextSentence() {
        const container = document.getElementById('reader-mode-container');
        if (!container || this.currentSentenceIndex >= this.sentences.length) return;

        this.addSentenceWithReflection(container, this.currentSentenceIndex);
        this.updateSentenceCounter();
    }

    addSentenceWithReflection(container, sentenceIndex) {
        const sentence = this.sentences[sentenceIndex];
        if (!sentence) return;

        // Create sentence block
        const block = document.createElement('div');
        block.className = 'reader-sentence-block';
        block.dataset.index = sentenceIndex;

        // Sentence display
        const sentenceDisplay = document.createElement('div');
        sentenceDisplay.className = 'reader-sentence';
        sentenceDisplay.textContent = sentence;

        // Reflection area
        const reflectionArea = document.createElement('div');
        reflectionArea.className = 'reader-reflection-area';

        const reflectionPrompt = document.createElement('div');
        reflectionPrompt.className = 'reader-reflection-prompt';
        reflectionPrompt.textContent = 'What does this sentence do for your reader?';

        const reflectionInput = document.createElement('textarea');
        reflectionInput.className = 'reader-reflection-input';
        reflectionInput.placeholder = 'Type your reflection here...';
        reflectionInput.value = this.reflections[sentenceIndex] || '';

        // Save reflection on input
        reflectionInput.addEventListener('input', (e) => {
            this.reflections[sentenceIndex] = e.target.value;
        });

        // Reveal next button (only show if not the last sentence)
        if (sentenceIndex < this.sentences.length - 1) {
            const revealButton = document.createElement('button');
            revealButton.className = 'reader-reveal-button';
            revealButton.textContent = 'Reveal Next Sentence';
            revealButton.addEventListener('click', () => {
                this.currentSentenceIndex++;
                this.showNextSentence();
                revealButton.style.display = 'none';
            });

            reflectionArea.appendChild(reflectionPrompt);
            reflectionArea.appendChild(reflectionInput);
            reflectionArea.appendChild(revealButton);
        } else {
            reflectionArea.appendChild(reflectionPrompt);
            reflectionArea.appendChild(reflectionInput);
        }

        // Assemble block
        block.appendChild(sentenceDisplay);
        block.appendChild(reflectionArea);

        // Add to container
        container.appendChild(block);

        // Focus on the reflection input
        setTimeout(() => {
            reflectionInput.focus();
        }, 100);
    }

    revealAllSentences() {
        const container = document.getElementById('reader-mode-container');
        if (!container) return;

        // Clear the container
        container.innerHTML = '';

        // Add all sentences at once
        for (let i = 0; i < this.sentences.length; i++) {
            this.addSentenceWithReflection(container, i);

            // Hide reveal buttons since we're showing everything
            const block = container.querySelector(`.reader-sentence-block[data-index="${i}"]`);
            const revealButton = block ? block.querySelector('.reader-reveal-button') : null;
            if (revealButton) {
                revealButton.style.display = 'none';
            }
        }

        // Update current index
        this.currentSentenceIndex = this.sentences.length - 1;
        this.updateSentenceCounter();
    }

    updateSentenceCounter() {
        const counter = document.getElementById('reader-sentence-counter');
        if (counter) {
            const revealed = Math.min(this.currentSentenceIndex + 1, this.sentences.length);
            counter.textContent = `Sentence ${revealed} of ${this.sentences.length}`;
        }
    }

    loadReflections() {
        // Load reflections from localStorage
        const documentId = this.getDocumentId();
        if (documentId) {
            const saved = localStorage.getItem(`reader_reflections_${documentId}`);
            if (saved) {
                try {
                    this.reflections = JSON.parse(saved);
                } catch (e) {
                    console.error('Error loading reflections:', e);
                    this.reflections = {};
                }
            }
        }
    }

    saveReflections() {
        // Save reflections to localStorage
        const documentId = this.getDocumentId();
        if (documentId) {
            try {
                localStorage.setItem(`reader_reflections_${documentId}`, JSON.stringify(this.reflections));
            } catch (e) {
                console.error('Error saving reflections:', e);
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

    getCurrentSentenceIndex() {
        return this.currentSentenceIndex;
    }

    getSentenceCount() {
        return this.sentences.length;
    }
}

// Export for use in writing_modes.js
if (typeof window !== 'undefined') {
    window.ReaderMode = ReaderMode;
}