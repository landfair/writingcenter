/**
 * Textris Mode Implementation
 * Allows users to drag and rearrange paragraphs or sentences
 */

class TextrisMode {
    constructor() {
        this.isActive = false;
        this.level = 'paragraph'; // 'paragraph' or 'sentence'
        this.draggedElement = null;
        this.history = {
            undoStack: [],
            redoStack: [],
            maxStackSize: 20
        };
    }

    activate(options = {}) {
        this.isActive = true;
        this.level = options.level || 'paragraph';
        
        const editor = document.getElementById('editor');
        if (!editor) return;

        // Add Textris mode class and disable contenteditable
        editor.classList.add('textris-mode');
        editor.contentEditable = 'false';

        // Apply the current mode
        this.applyMode();
        
        // Save initial state
        setTimeout(() => this.saveState(), 100);
        
        console.log(`Textris Mode activated - ${this.level} level`);
    }

    deactivate() {
        this.isActive = false;
        
        const editor = document.getElementById('editor');
        if (!editor) return;

        // Remove Textris mode class and re-enable contenteditable
        editor.classList.remove('textris-mode');
        editor.contentEditable = 'true';

        // Clean up Textris elements
        this.removeTextrisElements();
        
        // Reset history
        this.resetHistory();
        
        console.log('Textris Mode deactivated');
    }

    applyMode() {
        const editor = document.getElementById('editor');
        if (!editor) return;

        // Remove any existing Textris elements first
        this.removeTextrisElements();

        if (this.level === 'paragraph') {
            this.setupParagraphDragging();
        } else {
            this.setupSentenceDragging();
        }
    }

    removeTextrisElements() {
        const editor = document.getElementById('editor');
        if (!editor) return;

        // Remove any sentence spans
        const sentenceSpans = editor.querySelectorAll('.textris-sentence');
        sentenceSpans.forEach(span => {
            const parent = span.parentNode;
            if (parent) {
                while (span.firstChild) {
                    parent.insertBefore(span.firstChild, span);
                }
                parent.removeChild(span);
            }
        });

        // Remove drag-related classes
        const dragElements = editor.querySelectorAll('.dragging, .drag-target, .sentence-drag-target');
        dragElements.forEach(el => {
            el.classList.remove('dragging', 'drag-target', 'sentence-drag-target');
        });

        // Remove draggable attributes and event listeners
        const elements = editor.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6');
        elements.forEach(el => {
            el.removeAttribute('draggable');
            el.removeAttribute('tabindex');
            el.removeAttribute('role');
            el.removeAttribute('aria-label');
            
            // Clone to remove event listeners
            const clone = el.cloneNode(true);
            el.parentNode.replaceChild(clone, el);
        });
    }

    setupParagraphDragging() {
        const editor = document.getElementById('editor');
        const paragraphs = editor.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6');

        paragraphs.forEach(p => {
            // Skip empty paragraphs
            if (!p.textContent.trim()) return;

            // Set up drag events
            p.setAttribute('draggable', 'true');
            p.setAttribute('role', 'region');
            p.setAttribute('aria-label', 'Draggable paragraph');
            p.setAttribute('tabindex', '0');

            // Add visual styling
            p.style.cursor = 'grab';
            p.style.border = '1px dashed transparent';
            p.style.padding = '5px';
            p.style.margin = '2px 0';

            // Mouse events
            p.addEventListener('dragstart', (e) => this.handleDragStart(e));
            p.addEventListener('dragover', (e) => this.handleDragOver(e));
            p.addEventListener('drop', (e) => this.handleDrop(e));
            p.addEventListener('dragend', (e) => this.handleDragEnd(e));

            // Keyboard support
            p.addEventListener('keydown', (e) => this.handleKeyDown(e));

            // Visual feedback
            p.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            p.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        });
    }

    setupSentenceDragging() {
        const editor = document.getElementById('editor');
        const paragraphs = editor.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6');

        paragraphs.forEach(p => {
            // Skip if already processed or empty
            if (p.querySelector('.textris-sentence') || !p.innerHTML.trim()) {
                return;
            }

            // Split content into sentences
            this.wrapSentencesInSpans(p);
        });

        // Set up dragging for sentences
        const sentences = editor.querySelectorAll('.textris-sentence');
        sentences.forEach(sentence => {
            sentence.setAttribute('draggable', 'true');
            sentence.setAttribute('role', 'region');
            sentence.setAttribute('aria-label', 'Draggable sentence');
            sentence.setAttribute('tabindex', '0');

            // Add visual styling
            sentence.style.cursor = 'grab';
            sentence.style.border = '1px dashed transparent';
            sentence.style.padding = '2px';
            sentence.style.margin = '1px';
            sentence.style.display = 'inline-block';

            // Mouse events
            sentence.addEventListener('dragstart', (e) => this.handleDragStart(e));
            sentence.addEventListener('dragover', (e) => this.handleDragOver(e));
            sentence.addEventListener('drop', (e) => this.handleDrop(e));
            sentence.addEventListener('dragend', (e) => this.handleDragEnd(e));

            // Keyboard support
            sentence.addEventListener('keydown', (e) => this.handleKeyDown(e));

            // Visual feedback
            sentence.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            sentence.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        });
    }

    wrapSentencesInSpans(element) {
        // Simple sentence splitting regex
        const sentenceRegex = /([^.!?]+[.!?]+)/g;
        
        const processTextNode = (textNode) => {
            const text = textNode.textContent;
            const sentences = text.match(sentenceRegex);
            
            if (!sentences || sentences.length <= 1) return;
            
            const parent = textNode.parentNode;
            const fragment = document.createDocumentFragment();
            
            sentences.forEach(sentence => {
                if (sentence.trim()) {
                    const span = document.createElement('span');
                    span.className = 'textris-sentence';
                    span.textContent = sentence;
                    fragment.appendChild(span);
                }
            });
            
            parent.replaceChild(fragment, textNode);
        };

        // Process all text nodes
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.trim()) {
                textNodes.push(node);
            }
        }

        textNodes.forEach(processTextNode);
    }

    handleDragStart(e) {
        this.draggedElement = e.target;
        e.target.classList.add('dragging');
        e.target.style.opacity = '0.5';
        
        // Save state before drag operation
        this.saveState();
        
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(e) {
        if (e.target !== this.draggedElement && this.isValidDropTarget(e.target)) {
            e.target.classList.add('drag-target');
        }
    }

    handleDragLeave(e) {
        e.target.classList.remove('drag-target');
    }

    handleDrop(e) {
        e.preventDefault();
        
        if (!this.draggedElement || e.target === this.draggedElement) return;
        
        const dropTarget = this.findValidDropTarget(e.target);
        if (!dropTarget) return;

        // Perform the move
        if (this.level === 'paragraph') {
            this.moveParagraph(this.draggedElement, dropTarget);
        } else {
            this.moveSentence(this.draggedElement, dropTarget);
        }
        
        // Mark as changed
        if (window.markAsChanged) {
            window.markAsChanged();
        }
    }

    handleDragEnd(e) {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
            this.draggedElement.style.opacity = '';
            this.draggedElement = null;
        }

        // Remove all drag-related classes
        const editor = document.getElementById('editor');
        const dragElements = editor.querySelectorAll('.dragging, .drag-target');
        dragElements.forEach(el => {
            el.classList.remove('dragging', 'drag-target');
        });
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            
            if (this.draggedElement === e.target) {
                // Deselect
                e.target.classList.remove('dragging');
                this.draggedElement = null;
            } else {
                // Select for dragging
                if (this.draggedElement) {
                    this.draggedElement.classList.remove('dragging');
                }
                this.draggedElement = e.target;
                e.target.classList.add('dragging');
                this.saveState();
            }
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            if (this.draggedElement === e.target) {
                e.preventDefault();
                this.moveElementWithKeyboard(e.target, e.key === 'ArrowUp' ? 'up' : 'down');
            }
        }
    }

    isValidDropTarget(element) {
        if (this.level === 'paragraph') {
            return element.matches('p, div, h1, h2, h3, h4, h5, h6');
        } else {
            return element.classList.contains('textris-sentence') || 
                   element.matches('p, div, h1, h2, h3, h4, h5, h6');
        }
    }

    findValidDropTarget(element) {
        if (this.isValidDropTarget(element)) {
            return element;
        }
        return element.closest('p, div, h1, h2, h3, h4, h5, h6, .textris-sentence');
    }

    moveParagraph(draggedElement, dropTarget) {
        const parent = draggedElement.parentNode;
        
        // Determine where to insert
        const draggedRect = draggedElement.getBoundingClientRect();
        const targetRect = dropTarget.getBoundingClientRect();
        
        if (draggedRect.top < targetRect.top) {
            // Insert after target
            parent.insertBefore(draggedElement, dropTarget.nextSibling);
        } else {
            // Insert before target
            parent.insertBefore(draggedElement, dropTarget);
        }
    }

    moveSentence(draggedElement, dropTarget) {
        const parent = draggedElement.parentNode;
        
        if (dropTarget.classList.contains('textris-sentence')) {
            // Moving between sentences
            const targetParent = dropTarget.parentNode;
            
            if (parent === targetParent) {
                // Same paragraph
                const draggedRect = draggedElement.getBoundingClientRect();
                const targetRect = dropTarget.getBoundingClientRect();
                
                if (draggedRect.left < targetRect.left) {
                    targetParent.insertBefore(draggedElement, dropTarget.nextSibling);
                } else {
                    targetParent.insertBefore(draggedElement, dropTarget);
                }
            } else {
                // Different paragraph
                targetParent.appendChild(draggedElement);
            }
        } else {
            // Moving to a paragraph
            dropTarget.appendChild(draggedElement);
        }
    }

    moveElementWithKeyboard(element, direction) {
        const sibling = direction === 'up' ? element.previousElementSibling : element.nextElementSibling;
        
        if (sibling) {
            const parent = element.parentNode;
            
            if (direction === 'up') {
                parent.insertBefore(element, sibling);
            } else {
                parent.insertBefore(element, sibling.nextSibling);
            }
            
            // Mark as changed
            if (window.markAsChanged) {
                window.markAsChanged();
            }
            
            // Focus the element
            element.focus();
        }
    }

    // History management
    saveState() {
        if (!this.isActive) return;
        
        const editor = document.getElementById('editor');
        if (!editor) return;
        
        // Clear redo stack when new action is performed
        this.history.redoStack = [];
        
        // Push current state to undo stack
        const currentState = editor.innerHTML;
        this.history.undoStack.push(currentState);
        
        // Limit stack size
        if (this.history.undoStack.length > this.history.maxStackSize) {
            this.history.undoStack.shift();
        }
    }

    undo() {
        if (this.history.undoStack.length === 0) return;
        
        const editor = document.getElementById('editor');
        if (!editor) return;
        
        // Save current state to redo stack
        const currentState = editor.innerHTML;
        this.history.redoStack.push(currentState);
        
        // Restore previous state
        const previousState = this.history.undoStack.pop();
        editor.innerHTML = previousState;
        
        // Re-apply Textris mode
        this.applyMode();
    }

    redo() {
        if (this.history.redoStack.length === 0) return;
        
        const editor = document.getElementById('editor');
        if (!editor) return;
        
        // Save current state to undo stack
        const currentState = editor.innerHTML;
        this.history.undoStack.push(currentState);
        
        // Restore next state
        const nextState = this.history.redoStack.pop();
        editor.innerHTML = nextState;
        
        // Re-apply Textris mode
        this.applyMode();
    }

    resetHistory() {
        this.history.undoStack = [];
        this.history.redoStack = [];
    }

    // Change level (paragraph/sentence)
    setLevel(level) {
        this.level = level;
        if (this.isActive) {
            this.applyMode();
        }
    }
}

// Export for use in writing_modes.js
if (typeof window !== 'undefined') {
    window.TextrisMode = TextrisMode;
}