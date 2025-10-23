/**
 * Audience Perspective Mode Implementation
 * View writing through different reader personas and add targeted feedback
 */

class AudienceMode {
    constructor() {
        this.isActive = false;
        this.originalContent = null;
        this.annotationData = {}; // Store annotations for different reader perspectives
        this.currentPersona = 'expert'; // Default selected persona
        this.annotations = []; // Array of annotation objects
        this.annotationCounter = 0;
        this.annotationInterface = null;
        this.currentSelection = null;
    }

    activate(options = {}) {
        this.isActive = true;
        
        // Store the original content
        const editor = document.getElementById('editor');
        if (editor) {
            this.originalContent = editor.innerHTML;
        }
        
        // Load saved data if it exists for the current document
        this.loadSavedData();
        
        // Transform the document into Audience Perspective Mode view
        this.transformToAudienceView();
        
        // Make editor editable but with special handling
        if (editor) {
            editor.contentEditable = 'true';
            editor.classList.add('audience-mode');
        }
        
        // Set up event delegation for the mode interactions
        this.setupEventHandlers();
        
        console.log('Audience Perspective Mode enabled - Highlight text to add persona comments');
    }

    deactivate() {
        // Save current annotations before deactivating
        this.saveAnnotations();
        
        // Restore original content if needed
        const editor = document.getElementById('editor');
        if (editor) {
            // Remove audience-mode class
            editor.classList.remove('audience-mode');
            
            // Remove annotation popups
            this.removeAllAnnotationPopups();
            
            // Clean up highlights while preserving text
            this.cleanupHighlights();
        }
        
        // Remove event handlers
        this.removeEventHandlers();
        
        // Hide annotation interface if open
        this.hideAnnotationInterface();
        
        // Remove guidance panel
        this.removePersonaGuidance();
        
        this.isActive = false;
        console.log('Audience Perspective Mode disabled');
    }

    transformToAudienceView() {
        // Create the annotation interface container
        const annotationContainer = document.createElement('div');
        annotationContainer.className = 'audience-annotation-container';
        annotationContainer.id = 'audience-annotation-interface';
        annotationContainer.style.cssText = `
            position: absolute;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            width: 400px;
            max-width: 90vw;
            z-index: 1010;
            overflow: hidden;
            display: none;
        `;
        
        // Create annotation interface HTML
        annotationContainer.innerHTML = `
            <div class="audience-annotation-header" style="padding: 10px 15px; background-color: #f4f4f4; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;">
                <span id="audience-annotation-title" style="font-weight: 600; color: #333;">Add Comment</span>
                <button id="audience-annotation-close" class="audience-close-btn" style="background: none; border: none; color: #666; cursor: pointer; font-size: 16px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="audience-annotation-personas" style="display: flex; flex-wrap: wrap; padding: 10px; border-bottom: 1px solid #ddd; gap: 5px;">
                <div class="audience-persona-selector expert-persona" data-persona="expert" style="padding: 5px 10px; border-radius: 15px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 5px; color: #9b59b6; background-color: rgba(155, 89, 182, 0.1);">
                    <i class="fas fa-graduation-cap" style="font-size: 12px;"></i> Expert
                </div>
                <div class="audience-persona-selector novice-persona" data-persona="novice" style="padding: 5px 10px; border-radius: 15px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 5px; color: #3498db; background-color: rgba(52, 152, 219, 0.1);">
                    <i class="fas fa-book-open" style="font-size: 12px;"></i> Novice
                </div>
                <div class="audience-persona-selector skeptical-persona" data-persona="skeptical" style="padding: 5px 10px; border-radius: 15px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 5px; color: #e67e22; background-color: rgba(230, 126, 34, 0.1);">
                    <i class="fas fa-question-circle" style="font-size: 12px;"></i> Skeptical
                </div>
                <div class="audience-persona-selector timeconstrained-persona" data-persona="timeconstrained" style="padding: 5px 10px; border-radius: 15px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 5px; color: #2ecc71; background-color: rgba(46, 204, 113, 0.1);">
                    <i class="fas fa-clock" style="font-size: 12px;"></i> Time-Constrained
                </div>
                <div class="audience-persona-selector generous-persona" data-persona="generous" style="padding: 5px 10px; border-radius: 15px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 5px; color: #f1c40f; background-color: rgba(241, 196, 15, 0.1);">
                    <i class="fas fa-star" style="font-size: 12px;"></i> Generous
                </div>
            </div>
            <textarea id="audience-annotation-content" placeholder="Add your comment from this persona's perspective..." style="width: 100%; min-height: 100px; padding: 10px; border: none; border-bottom: 1px solid #ddd; resize: vertical; font-family: 'Open Sans', sans-serif; font-size: 14px; box-sizing: border-box;"></textarea>
            <div class="audience-annotation-footer" style="padding: 10px; display: flex; justify-content: flex-end; gap: 10px;">
                <button id="audience-annotation-cancel" style="padding: 8px 15px; border-radius: 4px; cursor: pointer; font-size: 14px; background-color: #f4f4f4; border: 1px solid #ddd; color: #333;">Cancel</button>
                <button id="audience-annotation-save" style="padding: 8px 15px; border-radius: 4px; cursor: pointer; font-size: 14px; background-color: #57068c; border: none; color: white;">Save</button>
            </div>
        `;
        
        document.body.appendChild(annotationContainer);
        this.annotationInterface = annotationContainer;
        
        // Set up annotation interface events
        this.setupAnnotationInterfaceEvents();
        
        // Render existing annotations
        this.renderExistingAnnotations();
    }

    setupAnnotationInterfaceEvents() {
        if (!this.annotationInterface) return;
        
        // Close button
        const closeBtn = this.annotationInterface.querySelector('#audience-annotation-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideAnnotationInterface());
        }
        
        // Cancel button
        const cancelBtn = this.annotationInterface.querySelector('#audience-annotation-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideAnnotationInterface());
        }
        
        // Save button
        const saveBtn = this.annotationInterface.querySelector('#audience-annotation-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveCurrentAnnotation());
        }
        
        // Persona selectors
        const personaSelectors = this.annotationInterface.querySelectorAll('.audience-persona-selector');
        personaSelectors.forEach(selector => {
            selector.addEventListener('click', (e) => {
                // Remove active class from all selectors
                personaSelectors.forEach(s => s.classList.remove('active'));
                
                // Add active class to clicked selector
                selector.classList.add('active');
                
                // Update current persona
                this.currentPersona = selector.dataset.persona;
                
                // Update the styling
                this.updatePersonaSelectorStyles();
            });
        });
        
        // Set initial persona
        const defaultPersona = this.annotationInterface.querySelector(`[data-persona="${this.currentPersona}"]`);
        if (defaultPersona) {
            defaultPersona.classList.add('active');
            this.updatePersonaSelectorStyles();
        }
    }

    updatePersonaSelectorStyles() {
        const personaSelectors = this.annotationInterface.querySelectorAll('.audience-persona-selector');
        personaSelectors.forEach(selector => {
            const persona = selector.dataset.persona;
            const isActive = selector.classList.contains('active');
            
            if (isActive) {
                selector.style.fontWeight = '600';
                switch (persona) {
                    case 'expert':
                        selector.style.backgroundColor = 'rgba(155, 89, 182, 0.2)';
                        selector.style.boxShadow = '0 0 0 1px #9b59b6';
                        break;
                    case 'novice':
                        selector.style.backgroundColor = 'rgba(52, 152, 219, 0.2)';
                        selector.style.boxShadow = '0 0 0 1px #3498db';
                        break;
                    case 'skeptical':
                        selector.style.backgroundColor = 'rgba(230, 126, 34, 0.2)';
                        selector.style.boxShadow = '0 0 0 1px #e67e22';
                        break;
                    case 'timeconstrained':
                        selector.style.backgroundColor = 'rgba(46, 204, 113, 0.2)';
                        selector.style.boxShadow = '0 0 0 1px #2ecc71';
                        break;
                    case 'generous':
                        selector.style.backgroundColor = 'rgba(241, 196, 15, 0.2)';
                        selector.style.boxShadow = '0 0 0 1px #f1c40f';
                        break;
                }
            } else {
                selector.style.fontWeight = 'normal';
                selector.style.boxShadow = 'none';
                switch (persona) {
                    case 'expert':
                        selector.style.backgroundColor = 'rgba(155, 89, 182, 0.1)';
                        break;
                    case 'novice':
                        selector.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
                        break;
                    case 'skeptical':
                        selector.style.backgroundColor = 'rgba(230, 126, 34, 0.1)';
                        break;
                    case 'timeconstrained':
                        selector.style.backgroundColor = 'rgba(46, 204, 113, 0.1)';
                        break;
                    case 'generous':
                        selector.style.backgroundColor = 'rgba(241, 196, 15, 0.1)';
                        break;
                }
            }
        });
    }

    setupEventHandlers() {
        const editor = document.getElementById('editor');
        if (!editor) return;
        
        // Handle text selection for creating annotations
        this.mouseUpHandler = (e) => this.handleTextSelection(e);
        editor.addEventListener('mouseup', this.mouseUpHandler);
        
        // Handle clicks on existing annotations
        this.clickHandler = (e) => this.handleAnnotationClick(e);
        editor.addEventListener('click', this.clickHandler);
    }

    removeEventHandlers() {
        const editor = document.getElementById('editor');
        if (!editor) return;
        
        if (this.mouseUpHandler) {
            editor.removeEventListener('mouseup', this.mouseUpHandler);
        }
        if (this.clickHandler) {
            editor.removeEventListener('click', this.clickHandler);
        }
    }

    handleTextSelection(e) {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        
        if (selectedText && selectedText.length > 0) {
            const range = selection.getRangeAt(0);
            this.currentSelection = {
                text: selectedText,
                range: range.cloneRange()
            };
            
            // Show annotation interface
            this.showAnnotationInterface(e);
        }
    }

    showAnnotationInterface(e) {
        if (!this.annotationInterface || !this.currentSelection) return;
        
        // Position the interface near the selection
        const rect = this.currentSelection.range.getBoundingClientRect();
        const interfaceRect = this.annotationInterface.getBoundingClientRect();
        
        let top = rect.bottom + window.scrollY + 10;
        let left = rect.left + window.scrollX;
        
        // Adjust if interface would go off screen
        if (left + 400 > window.innerWidth) {
            left = window.innerWidth - 420;
        }
        if (left < 10) {
            left = 10;
        }
        
        this.annotationInterface.style.top = top + 'px';
        this.annotationInterface.style.left = left + 'px';
        this.annotationInterface.style.display = 'block';
        
        // Clear previous content
        const textarea = this.annotationInterface.querySelector('#audience-annotation-content');
        if (textarea) {
            textarea.value = '';
            textarea.focus();
        }
    }

    hideAnnotationInterface() {
        if (this.annotationInterface) {
            this.annotationInterface.style.display = 'none';
        }
        this.currentSelection = null;
        
        // Clear any current selection
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
    }

    saveCurrentAnnotation() {
        if (!this.currentSelection) return;
        
        const textarea = this.annotationInterface.querySelector('#audience-annotation-content');
        const comment = textarea ? textarea.value.trim() : '';
        
        if (!comment) {
            alert('Please enter a comment before saving.');
            return;
        }
        
        // Create annotation object
        const annotation = {
            id: ++this.annotationCounter,
            text: this.currentSelection.text,
            comment: comment,
            persona: this.currentPersona,
            timestamp: new Date().toISOString()
        };
        
        // Add to annotations array
        this.annotations.push(annotation);
        
        // Create highlight in the document
        this.createHighlight(this.currentSelection.range, annotation);
        
        // Hide interface
        this.hideAnnotationInterface();
        
        // Save data
        this.saveAnnotations();
        
        console.log('Annotation saved:', annotation);
    }

    createHighlight(range, annotation) {
        try {
            const span = document.createElement('span');
            span.className = `audience-highlight ${annotation.persona}-highlight`;
            span.dataset.annotationId = annotation.id;
            span.style.cssText = this.getPersonaHighlightStyle(annotation.persona);
            span.setAttribute('title', `${this.getPersonaTitle(annotation.persona)}: ${annotation.comment}`);
            
            // Surround the range with the span
            range.surroundContents(span);
            
            // Add click handler for showing annotation popup
            span.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showAnnotationPopup(annotation, span);
            });
            
        } catch (error) {
            console.error('Error creating highlight:', error);
        }
    }

    getPersonaHighlightStyle(persona) {
        const styles = {
            expert: 'background-color: rgba(155, 89, 182, 0.15); border-bottom: 2px solid #9b59b6; display: inline; position: relative; border-radius: 2px; cursor: pointer; transition: background-color 0.2s ease;',
            novice: 'background-color: rgba(52, 152, 219, 0.15); border-bottom: 2px solid #3498db; display: inline; position: relative; border-radius: 2px; cursor: pointer; transition: background-color 0.2s ease;',
            skeptical: 'background-color: rgba(230, 126, 34, 0.15); border-bottom: 2px solid #e67e22; display: inline; position: relative; border-radius: 2px; cursor: pointer; transition: background-color 0.2s ease;',
            timeconstrained: 'background-color: rgba(46, 204, 113, 0.15); border-bottom: 2px solid #2ecc71; display: inline; position: relative; border-radius: 2px; cursor: pointer; transition: background-color 0.2s ease;',
            generous: 'background-color: rgba(241, 196, 15, 0.15); border-bottom: 2px solid #f1c40f; display: inline; position: relative; border-radius: 2px; cursor: pointer; transition: background-color 0.2s ease;'
        };
        return styles[persona] || styles.expert;
    }

    getPersonaTitle(persona) {
        const titles = {
            expert: 'Expert Reader',
            novice: 'Novice Reader',
            skeptical: 'Skeptical Reader',
            timeconstrained: 'Time-Constrained Reader',
            generous: 'Generous Reader'
        };
        return titles[persona] || 'Reader';
    }

    showAnnotationPopup(annotation, element) {
        // Remove any existing popups
        this.removeAllAnnotationPopups();
        
        const popup = document.createElement('div');
        popup.className = `audience-annotation-popup ${annotation.persona}-annotation`;
        popup.style.cssText = `
            position: absolute;
            margin: 8px 0;
            border-radius: 8px;
            box-shadow: 0 3px 15px rgba(0, 0, 0, 0.2);
            width: 300px;
            max-width: 90vw;
            font-size: 14px;
            overflow: hidden;
            z-index: 1500;
            background-color: white;
            animation: fadeIn 0.2s ease;
        `;
        
        popup.innerHTML = `
            <div class="audience-annotation-header" style="padding: 8px 10px; display: flex; align-items: center; gap: 8px; font-size: 13px; ${this.getPersonaHeaderStyle(annotation.persona)}">
                <i class="${this.getPersonaIcon(annotation.persona)}"></i>
                <span>${this.getPersonaTitle(annotation.persona)}</span>
                <div class="audience-popup-actions" style="margin-left: auto; display: flex; gap: 5px;">
                    <button class="audience-annotation-delete" data-annotation-id="${annotation.id}" style="background: none; border: none; color: #999; cursor: pointer; padding: 0; font-size: 12px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="audience-popup-close" style="background: none; border: none; color: #999; cursor: pointer; padding: 0; font-size: 12px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="audience-annotation-content" style="padding: 10px; background-color: white;">
                ${annotation.comment}
            </div>
        `;
        
        // Position popup
        const rect = element.getBoundingClientRect();
        popup.style.top = (rect.bottom + window.scrollY + 5) + 'px';
        popup.style.left = (rect.left + window.scrollX) + 'px';
        
        // Add event listeners
        popup.querySelector('.audience-popup-close').addEventListener('click', () => {
            popup.remove();
        });
        
        popup.querySelector('.audience-annotation-delete').addEventListener('click', () => {
            this.deleteAnnotation(annotation.id);
            popup.remove();
        });
        
        document.body.appendChild(popup);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (popup.parentNode) {
                popup.remove();
            }
        }, 5000);
    }

    getPersonaHeaderStyle(persona) {
        const styles = {
            expert: 'background-color: rgba(155, 89, 182, 0.1); color: #9b59b6;',
            novice: 'background-color: rgba(52, 152, 219, 0.1); color: #3498db;',
            skeptical: 'background-color: rgba(230, 126, 34, 0.1); color: #e67e22;',
            timeconstrained: 'background-color: rgba(46, 204, 113, 0.1); color: #2ecc71;',
            generous: 'background-color: rgba(241, 196, 15, 0.1); color: #f1c40f;'
        };
        return styles[persona] || styles.expert;
    }

    getPersonaIcon(persona) {
        const icons = {
            expert: 'fas fa-graduation-cap',
            novice: 'fas fa-book-open',
            skeptical: 'fas fa-question-circle',
            timeconstrained: 'fas fa-clock',
            generous: 'fas fa-star'
        };
        return icons[persona] || icons.expert;
    }

    removeAllAnnotationPopups() {
        const popups = document.querySelectorAll('.audience-annotation-popup');
        popups.forEach(popup => popup.remove());
    }

    deleteAnnotation(annotationId) {
        // Remove from annotations array
        this.annotations = this.annotations.filter(ann => ann.id !== annotationId);
        
        // Remove highlight from document
        const highlight = document.querySelector(`[data-annotation-id="${annotationId}"]`);
        if (highlight) {
            const parent = highlight.parentNode;
            if (parent) {
                // Replace highlight with text content
                const textNode = document.createTextNode(highlight.textContent);
                parent.replaceChild(textNode, highlight);
                parent.normalize();
            }
        }
        
        // Save updated data
        this.saveAnnotations();
    }

    cleanupHighlights() {
        const highlights = document.querySelectorAll('.audience-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            if (parent) {
                const textNode = document.createTextNode(highlight.textContent);
                parent.replaceChild(textNode, highlight);
            }
        });
        
        // Normalize text nodes
        const editor = document.getElementById('editor');
        if (editor) {
            editor.normalize();
        }
    }

    renderExistingAnnotations() {
        // This would restore annotations from saved data
        // For now, this is a placeholder for future implementation
    }

    loadSavedData() {
        // Load annotations for current document
        if (window.DOCUMENT_ID && this.annotationData[window.DOCUMENT_ID]) {
            this.annotations = this.annotationData[window.DOCUMENT_ID];
        }
    }

    saveAnnotations() {
        // Save annotations for current document
        if (window.DOCUMENT_ID) {
            this.annotationData[window.DOCUMENT_ID] = this.annotations;
        }
    }

    removePersonaGuidance() {
        const guidanceContainer = document.getElementById('audience-persona-guidance');
        if (guidanceContainer) {
            guidanceContainer.remove();
        }
    }

    exportAnnotations() {
        const exportData = {
            documentTitle: document.querySelector('.toolbar-title')?.textContent || 'Untitled Document',
            annotations: this.annotations,
            personas: this.getPersonaStats(),
            timestamp: new Date().toISOString()
        };
        
        const exportText = this.formatAnnotationsReport(exportData);
        
        // Create and download file
        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audience-annotations-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Audience annotations exported');
    }

    formatAnnotationsReport(data) {
        return `Audience Perspective Analysis Report
======================================

Document: ${data.documentTitle}
Generated: ${new Date(data.timestamp).toLocaleDateString()}

Summary:
- Total annotations: ${data.annotations.length}
- Personas used: ${Object.keys(data.personas).join(', ')}

Annotations by Persona:
${Object.entries(data.personas).map(([persona, count]) => 
    `- ${this.getPersonaTitle(persona)}: ${count} comment${count !== 1 ? 's' : ''}`
).join('\n')}

Detailed Annotations:
${data.annotations.map((ann, i) => 
    `${i + 1}. [${this.getPersonaTitle(ann.persona)}] "${ann.text}"
   Comment: ${ann.comment}
   Date: ${new Date(ann.timestamp).toLocaleDateString()}
`
).join('\n')}

Analysis:
This document has been reviewed from ${Object.keys(data.personas).length} different reader perspective${Object.keys(data.personas).length !== 1 ? 's' : ''}.
Consider addressing the feedback to make your writing more accessible to diverse audiences.
`;
    }

    getPersonaStats() {
        const stats = {};
        this.annotations.forEach(annotation => {
            stats[annotation.persona] = (stats[annotation.persona] || 0) + 1;
        });
        return stats;
    }

    getAnnotationCount() {
        return this.annotations.length;
    }

    clearAllAnnotations() {
        if (confirm('Are you sure you want to clear all annotations? This action cannot be undone.')) {
            this.annotations = [];
            this.cleanupHighlights();
            this.removeAllAnnotationPopups();
            this.saveAnnotations();
            console.log('All annotations cleared');
        }
    }
}

// Export for use in writing_modes.js
if (typeof window !== 'undefined') {
    window.AudienceMode = AudienceMode;
}