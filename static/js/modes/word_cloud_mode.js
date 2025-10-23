/**
 * Word Cloud Mode Implementation
 * Generate visual word clouds to analyze word frequency patterns
 */

class WordCloudMode {
    constructor() {
        this.isActive = false;
        this.modalElement = null;
        this.canvas = null;
        this.ctx = null;
        this.settings = {
            maxWords: 50,
            minFontSize: 12,
            maxFontSize: 48,
            colorScheme: 'frequency',
            backgroundColor: '#ffffff',
            textColor: '#333333',
            excludeNumbers: true,
            minWordLength: 3,
            fontFamily: 'Arial, sans-serif',
            maxRotation: 90,
            rotationSteps: 2
        };
        this.wordFrequency = {};
        this.placedWords = []; // Track placed words for collision detection
        
        // Common stop words to exclude
        this.stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
            'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
            'above', 'below', 'between', 'among', 'until', 'while', 'within', 'since',
            'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
            'having', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can',
            'may', 'might', 'must', 'shall', 'this', 'that', 'these', 'those', 'i',
            'you', 'he', 'she', 'it', 'we', 'they', 'them', 'their', 'what', 'which',
            'who', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few',
            'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
            'same', 'so', 'than', 'too', 'very', 'just', 'now', 'also'
        ]);
    }

    activate(options = {}) {
        this.isActive = true;
        
        // Parse text from editor
        this.parseText();
        
        // Create and show modal
        this.createModal();
        
        // Generate initial word cloud
        setTimeout(() => {
            this.generateWordCloud();
        }, 100);
        
        console.log('Word Cloud Mode enabled - Analyzing word frequency');
    }

    deactivate() {
        // Remove the modal if it exists
        if (this.modalElement) {
            document.body.removeChild(this.modalElement);
            this.modalElement = null;
        }
        
        // Clear canvas references
        this.canvas = null;
        this.ctx = null;
        this.placedWords = [];
        
        this.isActive = false;
        console.log('Word Cloud Mode disabled');
    }

    createModal() {
        // Create modal backdrop
        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'word-cloud-modal-backdrop';
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
            backdrop-filter: blur(2px);
        `;

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'word-cloud-modal';
        modal.style.cssText = `
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            width: 90%;
            max-width: 1000px;
            height: 90vh;
            max-height: 800px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            animation: slideIn 0.3s ease-out;
        `;

        // Modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'word-cloud-modal-header';
        modalHeader.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 25px;
            border-bottom: 2px solid #f4ebfa;
            background-color: #fcf9ff;
        `;

        const modalTitle = document.createElement('h3');
        modalTitle.textContent = 'Word Cloud Analysis';
        modalTitle.style.cssText = `
            margin: 0;
            color: #57068c;
            font-size: 1.4rem;
            font-weight: 600;
        `;

        const closeButton = document.createElement('button');
        closeButton.className = 'word-cloud-modal-close';
        closeButton.innerHTML = '&times;';
        closeButton.style.cssText = `
            background: none;
            border: none;
            font-size: 2rem;
            color: #666;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s ease;
        `;
        closeButton.setAttribute('aria-label', 'Close Word Cloud');
        closeButton.addEventListener('click', () => {
            this.deactivate();
        });

        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeButton);

        // Modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'word-cloud-content';
        modalContent.style.cssText = `
            flex: 1;
            display: flex;
            overflow: hidden;
        `;

        // Sidebar with settings
        const sidebar = document.createElement('div');
        sidebar.className = 'word-cloud-sidebar';
        sidebar.style.cssText = `
            width: 300px;
            background-color: #f8f9fa;
            border-right: 1px solid #e9ecef;
            overflow-y: auto;
            padding: 20px;
        `;
        sidebar.innerHTML = this.createSettingsHTML();

        // Main area with canvas
        const mainArea = document.createElement('div');
        mainArea.className = 'word-cloud-main';
        mainArea.style.cssText = `
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background-color: white;
        `;

        const canvas = document.createElement('canvas');
        canvas.className = 'word-cloud-canvas';
        canvas.width = 700;
        canvas.height = 500;
        canvas.style.cssText = `
            border: 1px solid #e9ecef;
            border-radius: 4px;
            max-width: 100%;
            max-height: 100%;
        `;

        mainArea.appendChild(canvas);
        modalContent.appendChild(sidebar);
        modalContent.appendChild(mainArea);

        // Assemble modal
        modal.appendChild(modalHeader);
        modal.appendChild(modalContent);
        modalBackdrop.appendChild(modal);

        // Add to document
        document.body.appendChild(modalBackdrop);
        this.modalElement = modalBackdrop;

        // Store canvas reference
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Set up event listeners
        this.setupEventListeners(modal);

        // Close on backdrop click
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) {
                this.deactivate();
            }
        });
    }

    createSettingsHTML() {
        return `
            <div class="word-cloud-settings">
                <h4 style="margin-top: 0; color: #57068c; font-size: 1.2rem;">Word Cloud Settings</h4>
                
                <div class="word-cloud-setting" style="margin-bottom: 20px;">
                    <label for="max-words" style="display: block; margin-bottom: 5px; font-weight: 500;">Maximum Words</label>
                    <input type="range" id="max-words" min="10" max="100" value="${this.settings.maxWords}" style="width: 100%;">
                    <div class="range-display" style="text-align: center; font-size: 0.9rem; color: #666;">${this.settings.maxWords} words</div>
                </div>
                
                <div class="word-cloud-setting" style="margin-bottom: 20px;">
                    <label for="min-font-size" style="display: block; margin-bottom: 5px; font-weight: 500;">Minimum Font Size</label>
                    <input type="range" id="min-font-size" min="8" max="24" value="${this.settings.minFontSize}" style="width: 100%;">
                    <div class="range-display" style="text-align: center; font-size: 0.9rem; color: #666;">${this.settings.minFontSize}px</div>
                </div>
                
                <div class="word-cloud-setting" style="margin-bottom: 20px;">
                    <label for="max-font-size" style="display: block; margin-bottom: 5px; font-weight: 500;">Maximum Font Size</label>
                    <input type="range" id="max-font-size" min="24" max="72" value="${this.settings.maxFontSize}" style="width: 100%;">
                    <div class="range-display" style="text-align: center; font-size: 0.9rem; color: #666;">${this.settings.maxFontSize}px</div>
                </div>
                
                <div class="word-cloud-setting" style="margin-bottom: 20px;">
                    <label for="min-word-length" style="display: block; margin-bottom: 5px; font-weight: 500;">Minimum Word Length</label>
                    <input type="range" id="min-word-length" min="1" max="8" value="${this.settings.minWordLength}" style="width: 100%;">
                    <div class="range-display" style="text-align: center; font-size: 0.9rem; color: #666;">${this.settings.minWordLength} characters</div>
                </div>
                
                <div class="word-cloud-setting" style="margin-bottom: 20px;">
                    <label for="color-scheme" style="display: block; margin-bottom: 5px; font-weight: 500;">Color Scheme</label>
                    <select id="color-scheme" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="frequency">Frequency-based</option>
                        <option value="rainbow">Rainbow</option>
                        <option value="monochrome">Monochrome</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>
                
                <div class="word-cloud-setting" style="margin-bottom: 20px;">
                    <label for="font-family" style="display: block; margin-bottom: 5px; font-weight: 500;">Font Family</label>
                    <select id="font-family" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="'Times New Roman', serif">Times New Roman</option>
                        <option value="'Courier New', monospace">Courier New</option>
                        <option value="Impact, sans-serif">Impact</option>
                    </select>
                </div>
                
                <div class="word-cloud-setting" style="margin-bottom: 20px;">
                    <label for="background-color" style="display: block; margin-bottom: 5px; font-weight: 500;">Background Color</label>
                    <input type="color" id="background-color" value="${this.settings.backgroundColor}" style="width: 100%; height: 40px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">
                </div>
                
                <div class="word-cloud-setting" style="margin-bottom: 20px;">
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" id="exclude-numbers" ${this.settings.excludeNumbers ? 'checked' : ''} style="margin-right: 8px;">
                        <span>Exclude Numbers</span>
                    </label>
                </div>
                
                <div class="word-cloud-buttons" style="display: flex; flex-direction: column; gap: 10px;">
                    <button id="regenerate-cloud" style="padding: 10px; background-color: #57068c; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                        <i class="fas fa-sync"></i> Regenerate
                    </button>
                    <button id="export-image" style="padding: 10px; background-color: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                        <i class="fas fa-download"></i> Export as Image
                    </button>
                    <button id="export-data" style="padding: 10px; background-color: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                        <i class="fas fa-file-export"></i> Export Word Data
                    </button>
                </div>
                
                <div class="word-cloud-stats" style="margin-top: 20px; padding: 15px; background-color: white; border-radius: 4px; border: 1px solid #e9ecef;">
                    <h5 style="margin-top: 0; color: #57068c;">Document Statistics</h5>
                    <div id="word-stats" style="font-size: 0.9rem; line-height: 1.4;">
                        <div>Total words: <span id="total-words">0</span></div>
                        <div>Unique words: <span id="unique-words">0</span></div>
                        <div>Displayed words: <span id="displayed-words">0</span></div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners(modal) {
        // Range inputs with live update
        const ranges = ['max-words', 'min-font-size', 'max-font-size', 'min-word-length'];
        ranges.forEach(rangeId => {
            const range = modal.querySelector(`#${rangeId}`);
            const display = range.nextElementSibling;
            
            range.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                const settingKey = rangeId.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                this.settings[settingKey] = value;
                
                // Update display
                const unit = rangeId.includes('font-size') ? 'px' : 
                            rangeId === 'max-words' ? ' words' : ' characters';
                display.textContent = value + unit;
                
                // Regenerate cloud with debounce
                clearTimeout(this.regenerateTimeout);
                this.regenerateTimeout = setTimeout(() => {
                    this.generateWordCloud();
                }, 300);
            });
        });
        
        // Color scheme selector
        modal.querySelector('#color-scheme').addEventListener('change', (e) => {
            this.settings.colorScheme = e.target.value;
            this.generateWordCloud();
        });
        
        // Font family selector
        modal.querySelector('#font-family').addEventListener('change', (e) => {
            this.settings.fontFamily = e.target.value;
            this.generateWordCloud();
        });
        
        // Background color
        modal.querySelector('#background-color').addEventListener('change', (e) => {
            this.settings.backgroundColor = e.target.value;
            this.generateWordCloud();
        });
        
        // Checkbox
        modal.querySelector('#exclude-numbers').addEventListener('change', (e) => {
            this.settings.excludeNumbers = e.target.checked;
            this.parseText();
            this.generateWordCloud();
        });
        
        // Buttons
        modal.querySelector('#regenerate-cloud').addEventListener('click', () => {
            this.regenerateCloud();
        });
        
        modal.querySelector('#export-image').addEventListener('click', () => {
            this.exportImage();
        });
        
        modal.querySelector('#export-data').addEventListener('click', () => {
            this.exportWordData();
        });
    }

    regenerateCloud() {
        console.log('Regenerating word cloud...');
        this.parseText();
        this.generateWordCloud();
        console.log('Word cloud regenerated');
    }

    parseText() {
        // Get text from editor
        const editor = document.getElementById('editor');
        const text = editor ? (editor.innerText || '') : '';
        
        // Reset word frequency
        this.wordFrequency = {};
        
        // Split into words and clean
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
            .split(/\s+/)
            .filter(word => {
                // Filter out empty strings, stop words, and numbers if specified
                if (!word || this.stopWords.has(word)) return false;
                if (word.length < this.settings.minWordLength) return false;
                if (this.settings.excludeNumbers && /^\d+$/.test(word)) return false;
                return true;
            });
        
        // Count frequency
        words.forEach(word => {
            this.wordFrequency[word] = (this.wordFrequency[word] || 0) + 1;
        });
        
        // Update stats
        this.updateStats(text.split(/\s+/).length);
    }

    updateStats(totalWords) {
        if (!this.modalElement) return;
        
        const uniqueWords = Object.keys(this.wordFrequency).length;
        const displayedWords = Math.min(uniqueWords, this.settings.maxWords);
        
        const totalEl = this.modalElement.querySelector('#total-words');
        const uniqueEl = this.modalElement.querySelector('#unique-words');
        const displayedEl = this.modalElement.querySelector('#displayed-words');
        
        if (totalEl) totalEl.textContent = totalWords;
        if (uniqueEl) uniqueEl.textContent = uniqueWords;
        if (displayedEl) displayedEl.textContent = displayedWords;
    }

    generateWordCloud() {
        if (!this.ctx) return;
        
        console.log('Generating word cloud with', Object.keys(this.wordFrequency).length, 'unique words');
        
        // Clear canvas
        this.ctx.fillStyle = this.settings.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reset placed words
        this.placedWords = [];
        
        // Get sorted words by frequency
        const sortedWords = Object.entries(this.wordFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, this.settings.maxWords);
        
        if (sortedWords.length === 0) {
            this.ctx.fillStyle = '#666';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('No words to display', this.canvas.width / 2, this.canvas.height / 2);
            return;
        }
        
        const maxFreq = sortedWords[0][1];
        const minFreq = sortedWords[sortedWords.length - 1][1];
        
        // Calculate center point
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Place words starting from center
        sortedWords.forEach(([word, frequency], index) => {
            const relativeFreq = (frequency - minFreq) / (maxFreq - minFreq);
            const fontSize = this.settings.minFontSize + 
                           (this.settings.maxFontSize - this.settings.minFontSize) * relativeFreq;
            
            // Set font
            this.ctx.font = `${fontSize}px ${this.settings.fontFamily}`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Get color
            const color = this.getWordColor(index, relativeFreq, sortedWords.length);
            this.ctx.fillStyle = color;
            
            // Try to place word
            const position = this.findWordPosition(word, fontSize, centerX, centerY);
            if (position) {
                this.ctx.fillText(word, position.x, position.y);
                this.placedWords.push({
                    word,
                    x: position.x,
                    y: position.y,
                    width: position.width,
                    height: position.height
                });
            }
        });
        
        // Update displayed words count
        this.updateStats(Object.values(this.wordFrequency).reduce((a, b) => a + b, 0));
    }

    findWordPosition(word, fontSize, centerX, centerY) {
        const metrics = this.ctx.measureText(word);
        const width = metrics.width;
        const height = fontSize;
        
        // Try center first
        if (this.canPlaceWord(centerX, centerY, width, height)) {
            return { x: centerX, y: centerY, width, height };
        }
        
        // Spiral outward from center
        const maxRadius = Math.min(this.canvas.width, this.canvas.height) / 2;
        const angleStep = Math.PI / 8; // 22.5 degrees
        
        for (let radius = 20; radius < maxRadius; radius += 10) {
            for (let angle = 0; angle < 2 * Math.PI; angle += angleStep) {
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                if (this.canPlaceWord(x, y, width, height)) {
                    return { x, y, width, height };
                }
            }
        }
        
        return null; // Couldn't place word
    }

    canPlaceWord(x, y, width, height) {
        const padding = 5;
        const left = x - width / 2 - padding;
        const right = x + width / 2 + padding;
        const top = y - height / 2 - padding;
        const bottom = y + height / 2 + padding;
        
        // Check canvas bounds
        if (left < 0 || right > this.canvas.width || top < 0 || bottom > this.canvas.height) {
            return false;
        }
        
        // Check collision with placed words
        for (const placed of this.placedWords) {
            const placedLeft = placed.x - placed.width / 2 - padding;
            const placedRight = placed.x + placed.width / 2 + padding;
            const placedTop = placed.y - placed.height / 2 - padding;
            const placedBottom = placed.y + placed.height / 2 + padding;
            
            if (!(right < placedLeft || left > placedRight || bottom < placedTop || top > placedBottom)) {
                return false; // Collision detected
            }
        }
        
        return true;
    }

    getWordColor(index, relativeFreq, totalWords) {
        switch (this.settings.colorScheme) {
            case 'frequency':
                // Red to blue based on frequency
                const r = Math.floor(255 * relativeFreq);
                const b = Math.floor(255 * (1 - relativeFreq));
                return `rgb(${r}, 100, ${b})`;
                
            case 'rainbow':
                const hue = (index / totalWords) * 360;
                return `hsl(${hue}, 70%, 50%)`;
                
            case 'monochrome':
                const lightness = 20 + (relativeFreq * 60);
                return `hsl(240, 50%, ${lightness}%)`;
                
            case 'custom':
                return this.settings.textColor;
                
            default:
                return '#333333';
        }
    }

    exportImage() {
        if (!this.canvas) return;
        
        // Create download link
        const link = document.createElement('a');
        link.download = `word-cloud-${new Date().toISOString().split('T')[0]}.png`;
        link.href = this.canvas.toDataURL();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Word cloud image exported');
    }

    exportWordData() {
        const data = {
            documentTitle: document.querySelector('.toolbar-title')?.textContent || 'Untitled Document',
            wordFrequency: this.wordFrequency,
            settings: this.settings,
            timestamp: new Date().toISOString(),
            statistics: {
                totalWords: Object.values(this.wordFrequency).reduce((a, b) => a + b, 0),
                uniqueWords: Object.keys(this.wordFrequency).length,
                displayedWords: Math.min(Object.keys(this.wordFrequency).length, this.settings.maxWords)
            }
        };
        
        const dataText = this.formatWordDataReport(data);
        
        // Create and download file
        const blob = new Blob([dataText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `word-frequency-analysis-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Word frequency data exported');
    }

    formatWordDataReport(data) {
        const sortedWords = Object.entries(data.wordFrequency)
            .sort((a, b) => b[1] - a[1]);
        
        return `Word Frequency Analysis Report
====================================

Document: ${data.documentTitle}
Generated: ${new Date(data.timestamp).toLocaleDateString()}

Statistics:
- Total words: ${data.statistics.totalWords}
- Unique words: ${data.statistics.uniqueWords}
- Words displayed in cloud: ${data.statistics.displayedWords}

Settings Used:
- Maximum words: ${data.settings.maxWords}
- Font size range: ${data.settings.minFontSize}px - ${data.settings.maxFontSize}px
- Minimum word length: ${data.settings.minWordLength} characters
- Color scheme: ${data.settings.colorScheme}
- Exclude numbers: ${data.settings.excludeNumbers ? 'Yes' : 'No'}

Word Frequency (Top ${Math.min(50, sortedWords.length)} words):
${sortedWords.slice(0, 50).map((word, i) => 
    `${i + 1}. ${word[0]} (${word[1]} occurrence${word[1] !== 1 ? 's' : ''})`
).join('\n')}

${sortedWords.length > 50 ? `... and ${sortedWords.length - 50} more words` : ''}
`;
    }

    getWordCount() {
        return Object.keys(this.wordFrequency).length;
    }

    getMaxFrequency() {
        return Math.max(...Object.values(this.wordFrequency), 0);
    }
}

// Export for use in writing_modes.js
if (typeof window !== 'undefined') {
    window.WordCloudMode = WordCloudMode;
}