/**
 * Key Terms Mode Implementation
 * Allows users to define and highlight key terms in their document
 */

class KeyTermsMode {
    constructor() {
        this.isActive = false;
        this.terms = []; // Will hold objects like {terms: ["example", "test*"], color: "#ff0000"}
        this.termsData = {}; // Will store terms for each document ID
        this.modalElement = null;
    }

    activate(options = {}) {
        this.isActive = true;

        // Load terms for current document
        this.loadTermsForCurrentDocument();

        // Reset terms if options provided to reset
        if (options && options.resetTerms) {
            this.terms = [];
        }

        // Show the key terms panel
        this.showKeyTermsPanel();

        // Apply highlighting if there are already terms defined
        if (this.terms.length > 0) {
            this.applyHighlighting();
        }

        console.log('Key Terms Mode activated - Define terms to highlight');
    }

    deactivate() {
        this.isActive = false;

        // Save current terms before deactivating
        this.saveTermsForCurrentDocument();

        // Hide the key terms panel if it's open
        this.hideKeyTermsPanel();

        // Remove all highlighting
        this.removeHighlighting();

        // Remove any highlight styles from the document
        const styleElements = document.querySelectorAll('style[data-key-terms-style]');
        styleElements.forEach(el => el.remove());

        // Make sure editor is editable
        const editor = document.getElementById('editor');
        if (editor) {
            editor.contentEditable = 'true';
        }

        console.log('Key Terms Mode deactivated');
    }

    loadTermsForCurrentDocument() {
        // Get current document ID
        const documentId = this.getDocumentId();
        
        if (documentId) {
            // Load terms from termsData or localStorage
            const saved = localStorage.getItem(`key_terms_${documentId}`);
            if (saved) {
                try {
                    this.terms = JSON.parse(saved);
                } catch (e) {
                    console.error('Error loading key terms:', e);
                    this.terms = [];
                }
            } else {
                this.terms = this.termsData[documentId] || [];
            }
        } else {
            this.terms = [];
        }
    }

    saveTermsForCurrentDocument() {
        const documentId = this.getDocumentId();
        
        if (documentId) {
            // Store in termsData object
            this.termsData[documentId] = this.terms;

            // Save to localStorage
            try {
                localStorage.setItem(`key_terms_${documentId}`, JSON.stringify(this.terms));
            } catch (e) {
                console.error('Error saving key terms:', e);
            }
        }
    }

    showKeyTermsPanel() {
        // Check if the panel already exists
        if (this.modalElement && this.modalElement.parentNode) {
            this.modalElement.parentNode.removeChild(this.modalElement);
        }

        // Create modal backdrop
        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'key-terms-modal-backdrop';
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
        modal.className = 'key-terms-modal';
        modal.style.cssText = `
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            width: 90%;
            max-width: 700px;
            max-height: 85vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        `;

        // Modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'key-terms-modal-header';
        modalHeader.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 25px;
            border-bottom: 2px solid #f4ebfa;
            background-color: #fcf9ff;
        `;

        const title = document.createElement('h3');
        title.textContent = 'Key Terms Mode';
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
            transition: all 0.2s ease;
        `;
        closeButton.addEventListener('click', () => this.hideKeyTermsPanel());

        modalHeader.appendChild(title);
        modalHeader.appendChild(closeButton);

        // Modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'key-terms-modal-content';
        modalContent.style.cssText = `
            flex: 1;
            padding: 25px;
            overflow-y: auto;
            background-color: #fafafa;
        `;

        // Instructions
        const instructions = document.createElement('p');
        instructions.textContent = 'Define terms to highlight in your document. Separate multiple terms with commas. Use * as a wildcard (e.g., "writ*" will match "write", "writing", etc.).';
        instructions.style.cssText = `
            margin-bottom: 20px;
            color: #666;
            line-height: 1.5;
        `;

        // Terms list container
        const termsList = document.createElement('div');
        termsList.id = 'key-terms-list';
        termsList.style.cssText = `
            margin-bottom: 20px;
        `;

        // Add term button
        const addTermBtn = document.createElement('button');
        addTermBtn.innerHTML = '<i class="fas fa-plus"></i> Add Term Group';
        addTermBtn.style.cssText = `
            background-color: #57068c;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 10px 20px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        addTermBtn.addEventListener('click', () => this.addTermRow());

        modalContent.appendChild(instructions);
        modalContent.appendChild(termsList);
        modalContent.appendChild(addTermBtn);

        // Modal footer
        const modalFooter = document.createElement('div');
        modalFooter.className = 'key-terms-modal-footer';
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
        cancelButton.addEventListener('click', () => this.hideKeyTermsPanel());

        const applyButton = document.createElement('button');
        applyButton.textContent = 'Apply Highlighting';
        applyButton.style.cssText = `
            padding: 8px 16px;
            background-color: #57068c;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        `;
        applyButton.addEventListener('click', () => {
            this.saveTerms();
            this.applyHighlighting();
            this.hideKeyTermsPanel();
        });

        modalFooter.appendChild(cancelButton);
        modalFooter.appendChild(applyButton);

        // Assemble modal
        modal.appendChild(modalHeader);
        modal.appendChild(modalContent);
        modal.appendChild(modalFooter);
        modalBackdrop.appendChild(modal);

        // Add to document
        document.body.appendChild(modalBackdrop);
        this.modalElement = modalBackdrop;

        // Add existing terms or one empty row
        if (this.terms.length > 0) {
            this.terms.forEach((term) => {
                this.addTermRow(term.terms.join(', '), term.color);
            });
        } else {
            this.addTermRow();
        }

        // Add escape key handler
        this.escapeHandler = (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.hideKeyTermsPanel();
                e.preventDefault();
            }
        };
        document.addEventListener('keydown', this.escapeHandler);
    }

    hideKeyTermsPanel() {
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

    addTermRow(termsValue = '', colorValue = '#ffff00') {
        const termsList = document.getElementById('key-terms-list');
        if (!termsList) return;

        const row = document.createElement('div');
        row.className = 'key-terms-row';
        row.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            gap: 10px;
        `;

        // Terms input
        const termsInput = document.createElement('input');
        termsInput.type = 'text';
        termsInput.className = 'key-terms-input';
        termsInput.placeholder = 'Enter terms separated by commas';
        termsInput.value = termsValue;
        termsInput.style.cssText = `
            flex-grow: 1;
            padding: 8px 12px;
            border: 2px solid #e6e6e6;
            border-radius: 6px;
            font-size: 14px;
        `;

        // Color selector
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.className = 'key-terms-color';
        colorInput.value = colorValue;
        colorInput.style.cssText = `
            width: 40px;
            height: 40px;
            padding: 0;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
        `;

        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
        removeBtn.style.cssText = `
            background-color: #dc3545;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px;
            cursor: pointer;
            font-size: 14px;
        `;
        removeBtn.addEventListener('click', () => {
            row.remove();
        });

        // Assemble row
        row.appendChild(termsInput);
        row.appendChild(colorInput);
        row.appendChild(removeBtn);

        // Add to list
        termsList.appendChild(row);

        // Focus the new input
        termsInput.focus();
    }

    saveTerms() {
        const termsList = document.getElementById('key-terms-list');
        if (!termsList) return;

        // Clear existing terms
        this.terms = [];

        // Get all term rows
        const rows = termsList.querySelectorAll('.key-terms-row');

        rows.forEach(row => {
            const termsInput = row.querySelector('.key-terms-input');
            const colorInput = row.querySelector('.key-terms-color');

            if (termsInput && colorInput && termsInput.value.trim()) {
                // Split by comma and trim each term
                const termsList = termsInput.value.split(',').map(term => term.trim()).filter(term => term);

                if (termsList.length > 0) {
                    this.terms.push({
                        terms: termsList,
                        color: colorInput.value
                    });
                }
            }
        });

        // Save terms for the current document
        this.saveTermsForCurrentDocument();
    }

    applyHighlighting() {
        // First, remove any existing highlighting
        this.removeHighlighting();

        if (this.terms.length === 0) {
            return;
        }

        const editor = document.getElementById('editor');
        if (!editor) return;

        // Make editor temporarily not editable to apply highlighting
        const wasEditable = editor.contentEditable;
        editor.contentEditable = 'false';

        // Create dynamic CSS for highlight styles
        let css = '';
        this.terms.forEach((termGroup, index) => {
            const className = `key-term-highlight-${index}`;
            css += `.${className} { background-color: ${termGroup.color}; padding: 1px 2px; border-radius: 2px; box-decoration-break: clone; -webkit-box-decoration-break: clone; }\n`;
        });

        // Add CSS to document
        let styleElement = document.querySelector('style[data-key-terms-style]');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.setAttribute('data-key-terms-style', 'true');
            document.head.appendChild(styleElement);
        }
        styleElement.textContent = css;

        // Apply highlighting to each term group
        this.terms.forEach((termGroup, groupIndex) => {
            termGroup.terms.forEach(term => {
                this.highlightTerm(term, `key-term-highlight-${groupIndex}`);
            });
        });

        // Restore editor state
        editor.contentEditable = wasEditable;
    }

    highlightTerm(searchTerm, className) {
        const editor = document.getElementById('editor');
        if (!editor) return;

        const walker = document.createTreeWalker(
            editor,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            // Skip already highlighted nodes
            if (node.parentElement && node.parentElement.classList.contains('key-term-highlight')) {
                continue;
            }
            textNodes.push(node);
        }

        textNodes.forEach(textNode => {
            const text = textNode.textContent;
            let regex;

            if (searchTerm.includes('*')) {
                // Handle wildcard
                const regexPattern = searchTerm.replace(/\*/g, '\\w*');
                regex = new RegExp(`\\b${regexPattern}\\b`, 'gi');
            } else {
                // Exact word match
                regex = new RegExp(`\\b${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            }

            if (regex.test(text)) {
                this.highlightTextNode(textNode, regex, className);
            }
        });
    }

    highlightTextNode(textNode, regex, className) {
        const text = textNode.textContent;
        const parent = textNode.parentNode;
        const fragment = document.createDocumentFragment();

        let lastIndex = 0;
        let match;

        regex.lastIndex = 0; // Reset regex

        while ((match = regex.exec(text)) !== null) {
            // Add text before match
            if (match.index > lastIndex) {
                fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
            }

            // Create highlighted span
            const span = document.createElement('span');
            span.className = `key-term-highlight ${className}`;
            span.textContent = match[0];
            fragment.appendChild(span);

            lastIndex = match.index + match[0].length;

            // Prevent infinite loop
            if (regex.lastIndex === match.index) {
                regex.lastIndex++;
            }
        }

        // Add remaining text
        if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
        }

        // Replace original text node
        parent.insertBefore(fragment, textNode);
        parent.removeChild(textNode);
    }

    removeHighlighting() {
        const editor = document.getElementById('editor');
        if (!editor) return;

        // Find all highlighted spans
        const highlights = editor.querySelectorAll('.key-term-highlight');
        
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            // Replace span with its text content
            while (highlight.firstChild) {
                parent.insertBefore(highlight.firstChild, highlight);
            }
            parent.removeChild(highlight);
        });

        // Normalize text nodes
        editor.normalize();

        // Remove style element
        const styleElement = document.querySelector('style[data-key-terms-style]');
        if (styleElement) {
            styleElement.remove();
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

    getTermsCount() {
        return this.terms.length;
    }

    getTermsData() {
        return this.terms;
    }
}

// Export for use in writing_modes.js
if (typeof window !== 'undefined') {
    window.KeyTermsMode = KeyTermsMode;
}