/**
 * Source Synthesis Mode Implementation
 * Track how sources interact throughout a document for better academic writing
 */

class SourceSynthesisMode {
    constructor() {
        this.isActive = false;
        this.sources = []; // Array of {name, terms, color} objects
        this.sourcesData = {}; // Store sources for each document ID
        this.integrationStats = {}; // Store statistics about source integration
        this.highlightedElements = [];
        this.modalElement = null;
    }

    activate(options = {}) {
        this.isActive = true;
        
        // Load saved data for current document if available
        if (window.DOCUMENT_ID && this.sourcesData[window.DOCUMENT_ID]) {
            this.sources = this.sourcesData[window.DOCUMENT_ID];
        }
        
        // Show the source synthesis panel
        this.showSourceSynthesisPanel();
        
        // Apply highlighting if there are already sources defined
        if (this.sources.length > 0) {
            this.applyHighlighting();
        }
        
        console.log('Source Synthesis Mode enabled - Define sources to track');
    }

    deactivate() {
        // Hide the panel if it's open
        this.hideSourceSynthesisPanel();
        
        // Remove all highlighting
        this.removeHighlighting();
        
        // Remove any highlight styles from the document
        const styleElements = document.querySelectorAll('style[data-source-synthesis-style]');
        styleElements.forEach(el => el.remove());
        
        // Make sure editor is editable
        const editor = document.getElementById('editor');
        if (editor) {
            editor.contentEditable = 'true';
        }
        
        this.isActive = false;
        console.log('Source Synthesis Mode disabled');
    }

    showSourceSynthesisPanel() {
        // Check if the panel already exists
        let panel = document.getElementById('source-synthesis-panel');
        
        if (!panel) {
            // Create panel
            panel = document.createElement('div');
            panel.id = 'source-synthesis-panel';
            panel.className = 'modal';
            panel.setAttribute('role', 'dialog');
            panel.setAttribute('aria-labelledby', 'source-synthesis-title');
            panel.style.cssText = `
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
            
            // Create panel content
            panel.innerHTML = `
                <div class="modal-content" style="background-color: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); width: 90%; max-width: 700px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px 25px; border-bottom: 2px solid #f4ebfa; background-color: #fcf9ff;">
                        <div id="source-synthesis-title" class="modal-title" style="margin: 0; color: #57068c; font-size: 1.4rem; font-weight: 600;">Source Synthesis</div>
                        <button class="modal-close" aria-label="Close panel" style="background: none; border: none; font-size: 1.5rem; color: #666; cursor: pointer; padding: 5px; border-radius: 50%;">&times;</button>
                    </div>
                    <div class="modal-body" style="flex: 1; padding: 25px; overflow-y: auto; background-color: #fafafa;">
                        <div class="source-synthesis-instructions" style="background-color: #f9f4ff; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #57068c;">
                            <p style="margin-top: 0;"><strong>Track your sources:</strong> Enter the name of each source (e.g., "Smith 2021", "Johnson") and list the key terms, phrases, or concepts associated with that source. Separate multiple terms with commas.</p>
                            <p><strong>Analyze integration:</strong> After highlighting, look for monochrome sections (single source) vs. multicolored sections (multiple sources in conversation).</p>
                            <p style="margin-bottom: 0;">Use <code>*</code> as a wildcard (e.g., <code>analy*</code> matches "analyze", "analysis", etc.)</p>
                        </div>
                        
                        <h4 style="color: #57068c; margin-bottom: 15px;">Sources</h4>
                        <div id="source-list" style="max-height: 300px; overflow-y: auto; margin-bottom: 20px;"></div>
                        
                        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                            <button id="add-source-btn" style="background-color: #57068c; color: white; border: none; border-radius: 6px; padding: 8px 16px; cursor: pointer; font-size: 14px;">
                                <i class="fas fa-plus"></i> Add Source
                            </button>
                            <button id="apply-sources-btn" style="background-color: #4caf50; color: white; border: none; border-radius: 6px; padding: 8px 16px; cursor: pointer; font-size: 14px;">
                                <i class="fas fa-highlighter"></i> Apply Highlighting
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(panel);
            this.modalElement = panel;
            
            // Add event listeners
            panel.querySelector('.modal-close').addEventListener('click', () => this.hideSourceSynthesisPanel());
            panel.querySelector('#apply-sources-btn').addEventListener('click', () => {
                this.collectSources();
                this.applyHighlighting();
                this.hideSourceSynthesisPanel();
            });
            panel.querySelector('#add-source-btn').addEventListener('click', () => this.addSourceRow());
            
            // Close on backdrop click
            panel.addEventListener('click', (e) => {
                if (e.target === panel) {
                    this.hideSourceSynthesisPanel();
                }
            });
        }
        
        // Clear existing source rows
        const sourcesList = panel.querySelector('#source-list');
        sourcesList.innerHTML = '';
        
        // Add a row for each existing source
        if (this.sources.length > 0) {
            this.sources.forEach((source, index) => {
                this.addSourceRow(source.name, source.terms.join(', '), source.color);
            });
        } else {
            // Add one empty row to start
            this.addSourceRow();
        }
        
        // Show the panel
        panel.style.display = 'flex';
    }

    hideSourceSynthesisPanel() {
        const panel = document.getElementById('source-synthesis-panel');
        if (panel) {
            panel.style.display = 'none';
            panel.remove();
            this.modalElement = null;
        }
    }

    addSourceRow(sourceName = '', terms = '', color = '') {
        const sourcesList = document.querySelector('#source-list');
        if (!sourcesList) return;
        
        // Generate a random color if none provided
        if (!color) {
            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
            color = colors[Math.floor(Math.random() * colors.length)];
        }
        
        const row = document.createElement('div');
        row.className = 'source-row';
        row.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
            padding: 10px;
            background-color: white;
            border-radius: 6px;
            border: 1px solid #ddd;
        `;
        
        row.innerHTML = `
            <input type="text" placeholder="Source name (e.g., Smith 2021)" value="${sourceName}" 
                   style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
            <input type="text" placeholder="Terms/concepts (comma separated)" value="${terms}" 
                   style="flex: 2; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
            <input type="color" value="${color}" title="Source color" 
                   style="width: 40px; height: 38px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">
            <button type="button" title="Remove source" 
                    style="background-color: #dc3545; color: white; border: none; border-radius: 4px; width: 38px; height: 38px; cursor: pointer; font-size: 14px;">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        // Add remove functionality
        row.querySelector('button').addEventListener('click', () => {
            row.remove();
        });
        
        sourcesList.appendChild(row);
    }

    collectSources() {
        const sourceRows = document.querySelectorAll('#source-list .source-row');
        this.sources = [];
        
        sourceRows.forEach(row => {
            const nameInput = row.querySelector('input[type="text"]:first-of-type');
            const termsInput = row.querySelector('input[type="text"]:last-of-type');
            const colorInput = row.querySelector('input[type="color"]');
            
            const name = nameInput.value.trim();
            const termsText = termsInput.value.trim();
            const color = colorInput.value;
            
            if (name && termsText) {
                const terms = termsText.split(',').map(term => term.trim()).filter(term => term);
                if (terms.length > 0) {
                    this.sources.push({
                        name: name,
                        terms: terms,
                        color: color
                    });
                }
            }
        });
        
        // Save sources data for current document
        if (window.DOCUMENT_ID) {
            this.sourcesData[window.DOCUMENT_ID] = this.sources;
        }
    }

    applyHighlighting() {
        // First, remove any existing highlighting
        this.removeHighlighting();
        
        if (this.sources.length === 0) {
            console.log('No sources defined for highlighting');
            return;
        }
        
        const editor = document.getElementById('editor');
        if (!editor) return;
        
        // Make editor temporarily not editable to apply highlighting
        const wasEditable = editor.contentEditable;
        editor.contentEditable = 'false';
        
        // Create an object to store highlight styles
        const highlightStyles = {};
        
        // Process each source to prepare regex patterns
        const sourcePatterns = this.sources.map(source => {
            const patterns = source.terms.map(term => {
                // Handle wildcard terms
                if (term.includes('*')) {
                    return term.replace(/\*/g, '\\w*');
                } else {
                    // Escape special regex characters
                    return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                }
            });
            
            const combinedPattern = `\\b(${patterns.join('|')})\\b`;
            
            return {
                source: source,
                regex: new RegExp(combinedPattern, 'gi'),
                className: `source-${source.name.replace(/\s+/g, '-').toLowerCase()}`
            };
        });
        
        // Walk through the DOM and highlight matching terms
        this.walkDOMAndHighlight(editor, sourcePatterns);
        
        // Create and inject CSS for highlighting
        this.createHighlightStyles();
        
        // Restore editability
        editor.contentEditable = wasEditable;
        
        // Calculate integration statistics
        this.calculateIntegrationStats();
        
        console.log('Source highlighting applied');
    }

    walkDOMAndHighlight(node, sourcePatterns) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            let hasMatches = false;
            let fragments = [{text: text, matches: []}];
            
            // Check each source pattern
            sourcePatterns.forEach(pattern => {
                const newFragments = [];
                
                fragments.forEach(fragment => {
                    if (fragment.matches.length > 0) {
                        // Already has highlighting, keep as is
                        newFragments.push(fragment);
                        return;
                    }
                    
                    const matches = [];
                    let match;
                    pattern.regex.lastIndex = 0;
                    
                    while ((match = pattern.regex.exec(fragment.text)) !== null) {
                        matches.push({
                            start: match.index,
                            end: match.index + match[0].length,
                            source: pattern.source,
                            className: pattern.className
                        });
                        hasMatches = true;
                    }
                    
                    if (matches.length > 0) {
                        // Split fragment based on matches
                        let lastIndex = 0;
                        matches.forEach(match => {
                            // Add text before match
                            if (lastIndex < match.start) {
                                newFragments.push({
                                    text: fragment.text.substring(lastIndex, match.start),
                                    matches: []
                                });
                            }
                            // Add matched text
                            newFragments.push({
                                text: fragment.text.substring(match.start, match.end),
                                matches: [match]
                            });
                            lastIndex = match.end;
                        });
                        // Add remaining text
                        if (lastIndex < fragment.text.length) {
                            newFragments.push({
                                text: fragment.text.substring(lastIndex),
                                matches: []
                            });
                        }
                    } else {
                        newFragments.push(fragment);
                    }
                });
                
                fragments = newFragments;
            });
            
            if (hasMatches) {
                const parent = node.parentNode;
                const docFragment = document.createDocumentFragment();
                
                fragments.forEach(fragment => {
                    if (fragment.matches.length > 0) {
                        const span = document.createElement('span');
                        span.className = 'source-highlight ' + fragment.matches[0].className;
                        span.textContent = fragment.text;
                        span.style.backgroundColor = fragment.matches[0].source.color;
                        span.style.padding = '1px 2px';
                        span.style.borderRadius = '2px';
                        span.setAttribute('title', `Source: ${fragment.matches[0].source.name}`);
                        
                        this.highlightedElements.push(span);
                        docFragment.appendChild(span);
                    } else {
                        docFragment.appendChild(document.createTextNode(fragment.text));
                    }
                });
                
                parent.replaceChild(docFragment, node);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
            // Process child nodes (make a copy since we'll modify the DOM)
            const children = Array.from(node.childNodes);
            children.forEach(child => this.walkDOMAndHighlight(child, sourcePatterns));
        }
    }

    createHighlightStyles() {
        // Remove existing styles
        const existingStyle = document.querySelector('style[data-source-synthesis-style]');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // Create new styles
        const style = document.createElement('style');
        style.setAttribute('data-source-synthesis-style', 'true');
        
        let css = `
            .source-highlight {
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
            }
            
            .source-highlight:hover {
                filter: brightness(0.9);
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
        `;
        
        style.textContent = css;
        document.head.appendChild(style);
    }

    removeHighlighting() {
        // Find all highlight spans
        const highlightSpans = document.querySelectorAll('.source-highlight');
        
        if (highlightSpans.length === 0) return;
        
        const editor = document.getElementById('editor');
        if (!editor) return;
        
        // Make editor temporarily not editable
        const wasEditable = editor.contentEditable;
        editor.contentEditable = 'false';
        
        // Remove each highlight span while preserving its content
        highlightSpans.forEach(span => {
            const parent = span.parentNode;
            if (parent) {
                // Replace the span with its text content
                const text = document.createTextNode(span.textContent);
                parent.replaceChild(text, span);
            }
        });
        
        // Normalize the text nodes
        editor.normalize();
        
        // Clear tracking array
        this.highlightedElements = [];
        
        // Restore editability
        editor.contentEditable = wasEditable;
        
        console.log('Source highlighting removed');
    }

    calculateIntegrationStats() {
        const editor = document.getElementById('editor');
        if (!editor) return;
        
        const paragraphs = editor.querySelectorAll('p, div');
        let totalParagraphs = 0;
        let singleSourceParagraphs = 0;
        let multiSourceParagraphs = 0;
        let noSourceParagraphs = 0;
        
        paragraphs.forEach(paragraph => {
            const highlights = paragraph.querySelectorAll('.source-highlight');
            if (highlights.length === 0) {
                noSourceParagraphs++;
            } else {
                const sources = new Set();
                highlights.forEach(highlight => {
                    const sourceTitle = highlight.getAttribute('title');
                    if (sourceTitle) {
                        sources.add(sourceTitle);
                    }
                });
                
                if (sources.size === 1) {
                    singleSourceParagraphs++;
                } else if (sources.size > 1) {
                    multiSourceParagraphs++;
                }
            }
            totalParagraphs++;
        });
        
        this.integrationStats = {
            totalParagraphs,
            singleSourceParagraphs,
            multiSourceParagraphs,
            noSourceParagraphs,
            integrationRatio: totalParagraphs > 0 ? multiSourceParagraphs / totalParagraphs : 0
        };
    }

    exportIntegrationAnalysis() {
        this.calculateIntegrationStats();
        
        const analysis = {
            documentTitle: document.querySelector('.toolbar-title')?.textContent || 'Untitled Document',
            sources: this.sources,
            integrationStats: this.integrationStats,
            timestamp: new Date().toISOString()
        };
        
        const analysisText = this.formatAnalysisReport(analysis);
        
        // Create and download file
        const blob = new Blob([analysisText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `source-synthesis-analysis-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Source synthesis analysis exported');
    }

    formatAnalysisReport(analysis) {
        return `Source Synthesis Analysis Report
=====================================

Document: ${analysis.documentTitle}
Generated: ${new Date(analysis.timestamp).toLocaleDateString()}

Sources Tracked (${analysis.sources.length}):
${analysis.sources.map((source, i) => 
    `${i + 1}. ${source.name}
   Terms: ${source.terms.join(', ')}`
).join('\n')}

Integration Statistics:
- Total paragraphs analyzed: ${analysis.integrationStats.totalParagraphs}
- Single-source paragraphs: ${analysis.integrationStats.singleSourceParagraphs} (${Math.round((analysis.integrationStats.singleSourceParagraphs / analysis.integrationStats.totalParagraphs) * 100)}%)
- Multi-source paragraphs: ${analysis.integrationStats.multiSourceParagraphs} (${Math.round((analysis.integrationStats.multiSourceParagraphs / analysis.integrationStats.totalParagraphs) * 100)}%)
- No source paragraphs: ${analysis.integrationStats.noSourceParagraphs} (${Math.round((analysis.integrationStats.noSourceParagraphs / analysis.integrationStats.totalParagraphs) * 100)}%)
- Integration ratio: ${Math.round(analysis.integrationStats.integrationRatio * 100)}%

Analysis:
${analysis.integrationStats.integrationRatio > 0.3 ? 
    '✓ Good source integration - Multiple sources are in conversation with each other.' :
    '⚠ Low source integration - Consider bringing sources into dialogue rather than treating them separately.'}

${analysis.integrationStats.noSourceParagraphs > analysis.integrationStats.totalParagraphs * 0.5 ?
    '⚠ Many paragraphs have no source attribution - Consider citing sources more frequently.' :
    '✓ Good source coverage throughout the document.'}
`;
    }

    getSourcesCount() {
        return this.sources.length;
    }

    getIntegrationStats() {
        return this.integrationStats;
    }

    getHighlightCount() {
        return this.highlightedElements.length;
    }
}

// Export for use in writing_modes.js
if (typeof window !== 'undefined') {
    window.SourceSynthesisMode = SourceSynthesisMode;
}