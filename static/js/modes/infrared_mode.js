/**
 * Infrared Mode Implementation
 * Reveals hidden language patterns by highlighting jargon words, nuance markers, and other stylistic elements
 */

class InfraredMode {
    constructor() {
        this.isActive = false;
        this.activePattern = null; // 'jargon' or 'nuance'
        this.highlightedElements = []; // Track highlighted spans for cleanup
        
        // Pattern definitions
        this.patterns = {
            jargon: {
                name: 'Jargon Words (Latinate)',
                color: '#8B0000', // Dark red (infrared-like)
                description: 'Highlights complex Latinate words that may have simpler alternatives',
                words: [
                    // Common Latinate words with simpler alternatives
                    'accommodate', 'acquisition', 'advantageous', 'anticipate', 'approximately',
                    'ascertain', 'assistance', 'commence', 'communicate', 'component',
                    'comprehend', 'concerning', 'consequently', 'consideration', 'constitute',
                    'demonstrate', 'designation', 'determination', 'documentation', 'facilitate',
                    'fundamental', 'implement', 'indication', 'individuals', 'information',
                    'initiate', 'institution', 'intention', 'investigate', 'knowledge',
                    'legislation', 'maintenance', 'methodology', 'modification', 'necessity',
                    'notification', 'objective', 'observation', 'operation', 'opportunity',
                    'participate', 'particular', 'percentage', 'performance', 'permission',
                    'personnel', 'population', 'position', 'possession', 'possibility',
                    'preparation', 'presentation', 'previously', 'priority', 'procedure',
                    'profession', 'provision', 'publication', 'purchase', 'receive',
                    'recommendation', 'registration', 'regulation', 'relationship', 'represent',
                    'requirement', 'reservation', 'resolution', 'responsibility', 'situation',
                    'specification', 'sufficient', 'terminate', 'transportation', 'utilization',
                    'vocation', 'occupation', 'employment', 'residence', 'substantial',
                    'eliminate', 'establish', 'examine', 'exercise', 'explanation',
                    'expression', 'extension', 'extraordinary', 'identification', 'illustration',
                    'imagination', 'immediately', 'importance', 'improvement', 'including',
                    'incredible', 'independent', 'inevitable', 'influence', 'initial',
                    'installation', 'intelligence', 'interesting', 'introduction', 'magnificent',
                    'majority', 'maximum', 'minimum', 'negative', 'obviously',
                    'organization', 'original', 'particularly', 'positive', 'practical',
                    'principle', 'probably', 'recognize', 'relatively', 'significance',
                    'similar', 'specific', 'superior', 'temporary', 'traditional'
                ]
            },
            
            nuance: {
                name: 'Nuance Words',
                color: '#B22222', // Fire brick red (infrared variant)
                description: 'Highlights words that signal complexity, qualification, or nuanced thinking',
                words: [
                    // Core contrast and qualification words
                    'but', 'despite', 'although', 'yet', 'though', 'however', 'nevertheless', 
                    'nonetheless', 'notwithstanding', 'regardless', 'while', 'whereas', 
                    'conversely', 'alternatively', 'instead', 'rather', 'albeit', 'except', 
                    'still', 'granted', 'admittedly', 'even', 'if',
                    
                    // Contrast phrases and expressions
                    'in spite of', 'on the one hand', 'on the other hand', 'in contrast', 
                    'even though', 'provided that', 'unless', 'contrary to', 'paradoxically', 
                    'ironically', 'unexpectedly', 'surprisingly', 'at the same time', 
                    'all the same', 'be that as it may', 'in any case', 'in any event', 
                    'even so', 'even if', 'then again', 'for all that', 'as much as', 
                    'by contrast', 'on the contrary',
                    
                    // Initial appearance and theory
                    'at first glance', 'initially', 'on the surface', 'at the outset', 'ostensibly', 'apparently', 
                    'in theory', 'hypothetically', 'ideally', 'nominally', 'officially', 
                    'outwardly', 'seemingly', 'supposedly', 'allegedly', 'purportedly', 
                    'reportedly', 'reputedly', 'at first blush','apparently', 'prima facie', 'superficially',
                    'notwithstanding appearances', 'despite appearances',
                    
                    // Against expectations
                    'by comparison', 'against expectations', 'counter-intuitively', 'counterintuitively',
                    'in defiance of', 'in the face of', 'against all odds', 'despite the odds', 
                    'in spite of the odds', 'all the odds',
                    
                    // Equal conditions and normal circumstances
                    'all things being equal', 'all other things being equal', 
                    'assuming all else is equal', 'ceteris paribus', 'other things being equal', 
                    'under normal circumstances', 'ordinarily', 'usually', 'typically', 
                    'generally', 'in general', 'as a rule', 'for the most part', 
                    'more often than not', 'oft-times', 'oftentimes',
                    
                    // Figurative and approximate language
                    'so to speak', 'as it were', 'in a manner of speaking', 'so to say', 
                    'strictly speaking', 'technically speaking', 'in a sense', 'in one sense', 
                    'in some sense', 'in a way', 'in some respects', 'in some ways',
                    
                    // Degree and extent qualifiers
                    'almost', 'somewhat', 'kind of', 'sort of', 'sorta', 'mildly', 'nearly', 'verging on',
                    'to some degree', 'to some extent', 'to an extent', 'to a degree', 'to a certain degree','to a certain extent', 'to a limited extent', 
                    'to a limited degree', 'up to a point', 'up to a certain point', 'within limits', 'relatively', 
                    'comparatively', 'moderately', 'rather', 'fairly', 'reasonably', 
                    'pretty', 'slightly', 'a bit', 'a little', 'a little bit', 'faintly', 
                    'just', 'only just', 'barely', 'scarcely', 'hardly', 'to a certain extent',
                    
                    // Minimal degree markers
                    'no more than', 'not much', 'almost not', 'nearly not', 
                    'close to', 'bordering on', 'verging on not', 'nearing',
                    
                    // Uncertainty and hedging
                    'arguably', 'perhaps', 'possibly', 'probably', 'likely', 'unlikely', 
                    'conceivably', 'presumably', 'may', 'might', 'could', 'would', 'should', 
                    'potentially', 'supposedly', 'theoretically', 'speculatively', 
                    'tentatively', 'provisionally', 'conditionally', 'debatably', 
                    'questionably', 'doubtfully', 'dubiously',
                    
                    // Verbal hedges
                    'appears', 'seems','tends', 'inclines', 'resembles', 'hints', 'alludes'
                ]
            }
        };
    }

    activate(options = {}) {
        this.isActive = true;
        
        // Set default pattern if none specified
        this.activePattern = options?.pattern || 'jargon';
        
        // Clear any existing highlights
        this.removeHighlighting();
        
        // Apply initial highlighting
        this.applyHighlighting();
        
        console.log(`Infrared Mode activated - Highlighting ${this.patterns[this.activePattern].name}`);
    }

    deactivate() {
        this.isActive = false;
        
        // Remove all highlighting
        this.removeHighlighting();
        
        // Reset state
        this.activePattern = null;
        this.highlightedElements = [];
        
        // Ensure editor is editable
        const editor = document.getElementById('editor');
        if (editor) {
            editor.contentEditable = 'true';
        }
        
        console.log('Infrared Mode deactivated');
    }

    setPattern(pattern) {
        if (this.patterns[pattern]) {
            this.activePattern = pattern;
            this.applyHighlighting();
        }
    }

    getOptions() {
        return {
            activePattern: this.activePattern,
            highlightCount: this.highlightedElements.length,
            availablePatterns: Object.keys(this.patterns)
        };
    }

    applyHighlighting() {
        if (!this.activePattern) return;
        
        // Remove existing highlighting first
        this.removeHighlighting();
        
        const pattern = this.patterns[this.activePattern];
        if (!pattern) return;
        
        const editor = document.getElementById('editor');
        if (!editor) return;
        
        // Make editor temporarily non-editable
        const wasEditable = editor.contentEditable;
        editor.contentEditable = 'false';
        
        // Create a set for faster lookup
        const wordsToHighlight = new Set(pattern.words.map(word => word.toLowerCase()));
        
        // Walk through the DOM and highlight matching words
        this.walkDOMAndHighlight(editor, wordsToHighlight, pattern);
        
        // Restore editability
        editor.contentEditable = wasEditable;
    }

    walkDOMAndHighlight(node, wordsToHighlight, pattern) {
        // Skip already highlighted elements
        if (node.classList && node.classList.contains('infrared-highlight')) {
            return;
        }
        
        // Process text nodes
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            this.processTextNode(node, wordsToHighlight, pattern);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Skip script and style elements
            if (node.tagName && (node.tagName.toLowerCase() === 'script' || node.tagName.toLowerCase() === 'style')) {
                return;
            }
            
            // Process child nodes (make a copy as the list might change)
            Array.from(node.childNodes).forEach(child => {
                this.walkDOMAndHighlight(child, wordsToHighlight, pattern);
            });
        }
    }

    processTextNode(textNode, wordsToHighlight, pattern) {
        const text = textNode.textContent;
        const words = [];
        let currentWord = '';
        let currentNonWord = '';
        
        // Split text into word and non-word segments
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (/\w/.test(char)) {
                if (currentNonWord) {
                    words.push({ type: 'nonword', text: currentNonWord });
                    currentNonWord = '';
                }
                currentWord += char;
            } else {
                if (currentWord) {
                    words.push({ type: 'word', text: currentWord });
                    currentWord = '';
                }
                currentNonWord += char;
            }
        }
        
        // Add any remaining segments
        if (currentWord) words.push({ type: 'word', text: currentWord });
        if (currentNonWord) words.push({ type: 'nonword', text: currentNonWord });
        
        // Check if any words need highlighting
        const hasMatches = words.some(segment => 
            segment.type === 'word' && this.shouldHighlightWord(segment.text, wordsToHighlight)
        );
        
        if (hasMatches) {
            // Create document fragment with highlighted words
            const fragment = document.createDocumentFragment();
            
            words.forEach(segment => {
                if (segment.type === 'word' && this.shouldHighlightWord(segment.text, wordsToHighlight)) {
                    // Create highlighted span
                    const span = document.createElement('span');
                    span.className = 'infrared-highlight';
                    span.textContent = segment.text;
                    span.style.backgroundColor = pattern.color;
                    span.style.color = 'white';
                    span.style.padding = '1px 2px';
                    span.style.borderRadius = '2px';
                    span.style.fontWeight = '500';
                    span.setAttribute('title', `${pattern.name}: ${segment.text}`);
                    
                    // Track this element for cleanup
                    this.highlightedElements.push(span);
                    
                    fragment.appendChild(span);
                } else {
                    // Regular text node
                    fragment.appendChild(document.createTextNode(segment.text));
                }
            });
            
            // Replace the original text node
            textNode.parentNode.insertBefore(fragment, textNode);
            textNode.parentNode.removeChild(textNode);
        }
    }

    shouldHighlightWord(word, wordsToHighlight) {
        const lowerWord = word.toLowerCase();
        
        // Check exact matches first
        if (wordsToHighlight.has(lowerWord)) {
            return true;
        }
        
        // Check for phrase matches (for multi-word terms)
        for (const phrase of this.patterns[this.activePattern].words) {
            if (phrase.includes(' ') && lowerWord === phrase.split(' ')[0]) {
                // This is the first word of a potential phrase - we'd need more sophisticated matching
                // For now, just match single words
                continue;
            }
        }
        
        return false;
    }

    removeHighlighting() {
        // Remove all highlighted spans
        this.highlightedElements.forEach(span => {
            if (span.parentNode) {
                const parent = span.parentNode;
                // Replace span with its text content
                while (span.firstChild) {
                    parent.insertBefore(span.firstChild, span);
                }
                parent.removeChild(span);
            }
        });
        
        // Clear the tracking array
        this.highlightedElements = [];
        
        // Normalize text nodes in the editor
        const editor = document.getElementById('editor');
        if (editor) {
            editor.normalize();
        }
    }

    exportAnalysis() {
        if (!this.activePattern || this.highlightedElements.length === 0) {
            return;
        }
        
        const pattern = this.patterns[this.activePattern];
        const highlightedWords = this.highlightedElements.map(el => el.textContent);
        const uniqueWords = [...new Set(highlightedWords)];
        
        let exportText = `Infrared Analysis: ${pattern.name}\n`;
        exportText += `==========================================\n\n`;
        exportText += `Pattern: ${pattern.name}\n`;
        exportText += `Description: ${pattern.description}\n`;
        exportText += `Total matches found: ${this.highlightedElements.length}\n`;
        exportText += `Unique words found: ${uniqueWords.length}\n\n`;
        exportText += `Highlighted words:\n`;
        exportText += `------------------\n`;
        
        // Count occurrences of each word
        const wordCounts = {};
        highlightedWords.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });
        
        // Sort by frequency
        const sortedWords = Object.entries(wordCounts)
            .sort(([,a], [,b]) => b - a)
            .map(([word, count]) => `${word} (${count})`);
        
        exportText += sortedWords.join('\n');
        exportText += `\n\nGenerated by Writing Center Infrared Mode\n`;
        
        // Create and download the file
        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `infrared-analysis-${this.activePattern}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    getHighlightCount() {
        return this.highlightedElements.length;
    }

    getActivePatternName() {
        return this.activePattern ? this.patterns[this.activePattern].name : '';
    }

    getPatternDescription() {
        return this.activePattern ? this.patterns[this.activePattern].description : '';
    }
}

// Export for use in writing_modes.js
if (typeof window !== 'undefined') {
    window.InfraredMode = InfraredMode;
}