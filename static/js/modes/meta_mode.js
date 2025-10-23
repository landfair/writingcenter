/**
 * Meta Mode Implementation
 * Analyzes what each paragraph says (content) and does (function)
 */

class MetaMode {
    constructor() {
        this.isActive = false;
        this.paragraphs = [];
        this.currentParagraphIndex = 0;
        this.paragraphData = {};
        this.modalElement = null;
    }

    activate(options = {}) {
        this.isActive = true;
        this.currentParagraphIndex = 0;
        this.paragraphData = {};

        const editor = document.getElementById('editor');
        if (!editor) return;

        // Parse paragraphs from the document
        this.parseParagraphs();

        // Load any saved meta analysis data
        this.loadSavedData();

        // Create and show the Meta Mode modal
        this.createMetaModal();

        // Add escape key handler
        this.escapeHandler = (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.deactivate();
                e.preventDefault();
            }
        };
        document.addEventListener('keydown', this.escapeHandler);

        console.log('Meta Mode activated - Analyze what each paragraph says and does');
    }

    deactivate() {
        this.isActive = false;

        // Save current meta analysis before deactivating
        this.saveMetaAnalysis();

        // Remove modal
        if (this.modalElement && this.modalElement.parentNode) {
            this.modalElement.parentNode.removeChild(this.modalElement);
        }

        // Remove escape key handler
        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
            this.escapeHandler = null;
        }

        // Reset state
        this.modalElement = null;
        this.currentParagraphIndex = 0;
        this.paragraphs = [];
        this.paragraphData = {};

        console.log('Meta Mode deactivated');
    }

    parseParagraphs() {
        const editor = document.getElementById('editor');
        if (!editor) return;

        this.paragraphs = [];

        // Get all paragraph-like elements
        const paragraphElements = editor.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6');
        
        paragraphElements.forEach(element => {
            const text = element.textContent.trim();
            if (text.length > 0) {
                this.paragraphs.push(text);
            }
        });

        console.log(`Parsed ${this.paragraphs.length} paragraphs for Meta Mode`);
    }

    createMetaModal() {
        // Create modal backdrop
        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'meta-modal-backdrop';
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
        modal.className = 'meta-modal';
        modal.style.cssText = `
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            width: 95%;
            max-width: 1000px;
            height: 85vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        `;

        // Modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'meta-modal-header';
        modalHeader.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 25px;
            border-bottom: 2px solid #f4ebfa;
            background-color: #fcf9ff;
        `;

        const title = document.createElement('h3');
        title.textContent = 'Meta Mode - Says & Does Analysis';
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
        closeButton.addEventListener('click', () => this.deactivate());

        modalHeader.appendChild(title);
        modalHeader.appendChild(closeButton);

        // Modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'meta-modal-content';
        modalContent.style.cssText = `
            flex: 1;
            padding: 25px;
            overflow-y: auto;
            background-color: #fafafa;
        `;

        // Create the analysis container
        this.createAnalysisContainer(modalContent);

        // Modal footer
        const modalFooter = document.createElement('div');
        modalFooter.className = 'meta-modal-footer';
        modalFooter.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 25px;
            border-top: 1px solid #f0f0f0;
            background-color: white;
        `;

        // Navigation
        const navigation = document.createElement('div');
        navigation.style.cssText = `
            display: flex;
            gap: 10px;
            align-items: center;
        `;

        const prevButton = document.createElement('button');
        prevButton.id = 'meta-prev-button';
        prevButton.innerHTML = '<i class="fas fa-arrow-left"></i> Previous';
        prevButton.style.cssText = `
            padding: 8px 16px;
            background-color: #57068c;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        `;
        prevButton.addEventListener('click', () => this.navigateToPrevious());

        const nextButton = document.createElement('button');
        nextButton.id = 'meta-next-button';
        nextButton.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
        nextButton.style.cssText = `
            padding: 8px 16px;
            background-color: #57068c;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        `;
        nextButton.addEventListener('click', () => this.navigateToNext());

        const statusText = document.createElement('div');
        statusText.id = 'meta-status-text';
        statusText.style.cssText = `
            font-size: 14px;
            color: #666;
            font-weight: 500;
        `;

        navigation.appendChild(prevButton);
        navigation.appendChild(statusText);
        navigation.appendChild(nextButton);

        // Export button
        const exportButton = document.createElement('button');
        exportButton.textContent = 'Export Analysis';
        exportButton.style.cssText = `
            padding: 8px 16px;
            background-color: #f4ebfa;
            color: #57068c;
            border: 1px solid #57068c;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        `;
        exportButton.addEventListener('click', () => this.exportAnalysis());

        modalFooter.appendChild(navigation);
        modalFooter.appendChild(exportButton);

        // Assemble modal
        modal.appendChild(modalHeader);
        modal.appendChild(modalContent);
        modal.appendChild(modalFooter);
        modalBackdrop.appendChild(modal);

        // Add to document
        document.body.appendChild(modalBackdrop);
        this.modalElement = modalBackdrop;

        // Update content for first paragraph
        this.updateModalContent();
    }

    createAnalysisContainer(parent) {
        // Main container
        const container = document.createElement('div');
        container.className = 'meta-paragraph-container';
        container.style.cssText = `
            display: grid;
            grid-template-columns: 1fr 2fr 1fr;
            gap: 15px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid #eee;
            position: relative;
        `;

        // Paragraph counter
        const counter = document.createElement('div');
        counter.id = 'meta-paragraph-counter';
        counter.style.cssText = `
            position: absolute;
            top: -12px;
            left: 20px;
            background-color: #57068c;
            color: white;
            border-radius: 12px;
            padding: 3px 12px;
            font-weight: 500;
            font-size: 12px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        `;

        // Says column
        const saysColumn = document.createElement('div');
        saysColumn.className = 'meta-says-column';
        saysColumn.style.cssText = `
            padding: 15px;
            background-color: rgba(87, 6, 140, 0.03);
            border-radius: 8px;
            border-left: 3px solid #57068c;
            display: flex;
            flex-direction: column;
        `;

        const saysHeading = document.createElement('div');
        saysHeading.className = 'meta-column-heading';
        saysHeading.innerHTML = '<i class="fas fa-quote-left"></i> Says (Content)';
        saysHeading.style.cssText = `
            font-weight: 600;
            font-size: 0.9rem;
            color: #57068c;
            margin-bottom: 10px;
        `;

        const saysTextarea = document.createElement('textarea');
        saysTextarea.id = 'meta-says-textarea';
        saysTextarea.className = 'meta-textarea';
        saysTextarea.placeholder = 'What is the main content or meaning?';
        saysTextarea.style.cssText = `
            flex: 1;
            width: 100%;
            min-height: 200px;
            padding: 12px;
            border: 2px solid #e6e6e6;
            border-radius: 8px;
            font-family: 'Open Sans', sans-serif;
            font-size: 14px;
            line-height: 1.5;
            resize: vertical;
            transition: all 0.2s ease;
            background-color: #fafafa;
        `;

        saysTextarea.addEventListener('input', () => this.saveCurrentParagraphData());

        saysColumn.appendChild(saysHeading);
        saysColumn.appendChild(saysTextarea);

        // Paragraph column
        const paragraphColumn = document.createElement('div');
        paragraphColumn.className = 'meta-paragraph-column';
        paragraphColumn.style.cssText = `
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 8px;
            max-height: 300px;
            overflow-y: auto;
        `;

        const paragraphHeading = document.createElement('div');
        paragraphHeading.className = 'meta-column-heading';
        paragraphHeading.innerHTML = '<i class="fas fa-paragraph"></i> Paragraph';
        paragraphHeading.style.cssText = `
            font-weight: 600;
            font-size: 0.9rem;
            color: #57068c;
            margin-bottom: 10px;
        `;

        const paragraphContent = document.createElement('div');
        paragraphContent.id = 'meta-paragraph-content';
        paragraphContent.style.cssText = `
            font-size: 16px;
            line-height: 1.6;
            color: #333;
        `;

        paragraphColumn.appendChild(paragraphHeading);
        paragraphColumn.appendChild(paragraphContent);

        // Does column
        const doesColumn = document.createElement('div');
        doesColumn.className = 'meta-does-column';
        doesColumn.style.cssText = `
            padding: 15px;
            background-color: rgba(87, 6, 140, 0.03);
            border-radius: 8px;
            border-right: 3px solid #57068c;
            display: flex;
            flex-direction: column;
        `;

        const doesHeading = document.createElement('div');
        doesHeading.className = 'meta-column-heading';
        doesHeading.innerHTML = '<i class="fas fa-cogs"></i> Does (Function)';
        doesHeading.style.cssText = `
            font-weight: 600;
            font-size: 0.9rem;
            color: #57068c;
            margin-bottom: 10px;
        `;

        const doesTextarea = document.createElement('textarea');
        doesTextarea.id = 'meta-does-textarea';
        doesTextarea.className = 'meta-textarea';
        doesTextarea.placeholder = 'What function does this serve?';
        doesTextarea.style.cssText = `
            flex: 1;
            width: 100%;
            min-height: 200px;
            padding: 12px;
            border: 2px solid #e6e6e6;
            border-radius: 8px;
            font-family: 'Open Sans', sans-serif;
            font-size: 14px;
            line-height: 1.5;
            resize: vertical;
            transition: all 0.2s ease;
            background-color: #fafafa;
        `;

        doesTextarea.addEventListener('input', () => this.saveCurrentParagraphData());

        doesColumn.appendChild(doesHeading);
        doesColumn.appendChild(doesTextarea);

        // Assemble container
        container.appendChild(counter);
        container.appendChild(saysColumn);
        container.appendChild(paragraphColumn);
        container.appendChild(doesColumn);

        parent.appendChild(container);
    }

    updateModalContent() {
        // Update paragraph counter
        const counter = document.getElementById('meta-paragraph-counter');
        if (counter) {
            counter.textContent = `Paragraph ${this.currentParagraphIndex + 1} of ${this.paragraphs.length}`;
        }

        // Update paragraph content
        const paragraphContent = document.getElementById('meta-paragraph-content');
        if (paragraphContent && this.paragraphs[this.currentParagraphIndex]) {
            paragraphContent.textContent = this.paragraphs[this.currentParagraphIndex];
        }

        // Update textareas with saved data
        const saysTextarea = document.getElementById('meta-says-textarea');
        const doesTextarea = document.getElementById('meta-does-textarea');

        if (saysTextarea) {
            saysTextarea.value = this.paragraphData[this.currentParagraphIndex]?.says || '';
        }

        if (doesTextarea) {
            doesTextarea.value = this.paragraphData[this.currentParagraphIndex]?.does || '';
        }

        // Update navigation buttons
        const prevButton = document.getElementById('meta-prev-button');
        const nextButton = document.getElementById('meta-next-button');
        const statusText = document.getElementById('meta-status-text');

        if (prevButton) {
            prevButton.disabled = this.currentParagraphIndex === 0;
            prevButton.style.opacity = this.currentParagraphIndex === 0 ? '0.5' : '1';
        }

        if (nextButton) {
            nextButton.disabled = this.currentParagraphIndex >= this.paragraphs.length - 1;
            nextButton.style.opacity = this.currentParagraphIndex >= this.paragraphs.length - 1 ? '0.5' : '1';
        }

        if (statusText) {
            statusText.textContent = `${this.currentParagraphIndex + 1} / ${this.paragraphs.length}`;
        }

        // Focus on says textarea
        setTimeout(() => {
            if (saysTextarea) {
                saysTextarea.focus();
            }
        }, 100);
    }

    navigateToPrevious() {
        if (this.currentParagraphIndex > 0) {
            this.saveCurrentParagraphData();
            this.currentParagraphIndex--;
            this.updateModalContent();
        }
    }

    navigateToNext() {
        if (this.currentParagraphIndex < this.paragraphs.length - 1) {
            this.saveCurrentParagraphData();
            this.currentParagraphIndex++;
            this.updateModalContent();
        }
    }

    saveCurrentParagraphData() {
        const saysTextarea = document.getElementById('meta-says-textarea');
        const doesTextarea = document.getElementById('meta-does-textarea');

        if (saysTextarea && doesTextarea) {
            if (!this.paragraphData[this.currentParagraphIndex]) {
                this.paragraphData[this.currentParagraphIndex] = {};
            }
            this.paragraphData[this.currentParagraphIndex].says = saysTextarea.value;
            this.paragraphData[this.currentParagraphIndex].does = doesTextarea.value;
        }
    }

    loadSavedData() {
        // Load from localStorage
        const documentId = this.getDocumentId();
        if (documentId) {
            const saved = localStorage.getItem(`meta_analysis_${documentId}`);
            if (saved) {
                try {
                    this.paragraphData = JSON.parse(saved);
                } catch (e) {
                    console.error('Error loading meta analysis:', e);
                    this.paragraphData = {};
                }
            }
        }
    }

    saveMetaAnalysis() {
        // Save current paragraph data first
        this.saveCurrentParagraphData();

        // Save to localStorage
        const documentId = this.getDocumentId();
        if (documentId) {
            try {
                localStorage.setItem(`meta_analysis_${documentId}`, JSON.stringify(this.paragraphData));
            } catch (e) {
                console.error('Error saving meta analysis:', e);
            }
        }
    }

    exportAnalysis() {
        // Create a text export of the analysis
        let exportText = 'Says/Does Analysis\n';
        exportText += '==================\n\n';

        for (let i = 0; i < this.paragraphs.length; i++) {
            exportText += `Paragraph ${i + 1}:\n`;
            exportText += `${this.paragraphs[i]}\n\n`;
            
            if (this.paragraphData[i]) {
                exportText += `Says: ${this.paragraphData[i].says || 'Not analyzed'}\n\n`;
                exportText += `Does: ${this.paragraphData[i].does || 'Not analyzed'}\n\n`;
            } else {
                exportText += `Says: Not analyzed\n\n`;
                exportText += `Does: Not analyzed\n\n`;
            }
            
            exportText += '---\n\n';
        }

        // Create and download the file
        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'says-does-analysis.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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

    getCurrentParagraphIndex() {
        return this.currentParagraphIndex;
    }

    getParagraphCount() {
        return this.paragraphs.length;
    }
}

// Export for use in writing_modes.js
if (typeof window !== 'undefined') {
    window.MetaMode = MetaMode;
}