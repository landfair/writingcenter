// Core JavaScript functionality for Writing Center

// Global variables
let currentDocument = null;
let hasUnsavedChanges = false;

// CSRF token for Django requests
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

// API functions
async function saveDocument() {
    const editor = document.getElementById('editor');
    const titleElement = document.getElementById('document-title');
    
    if (!DOCUMENT_ID || !editor) return;
    
    try {
        const response = await fetch('/api/save-document/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({
                document_id: DOCUMENT_ID,
                content: editor.innerHTML,
                title: titleElement.textContent || 'Untitled Document'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            hasUnsavedChanges = false;
            showNotification('Document saved successfully!');
            updateLastSaved(new Date());
        } else {
            showNotification('Error saving document: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('Save error:', error);
        showNotification('Network error while saving', 'error');
    }
}

async function createNewDocument() {
    const title = prompt('Enter document title:', 'Untitled Document');
    if (!title) return;
    
    try {
        const response = await fetch('/api/create-document/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({
                title: title,
                content: ''
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            window.location.href = data.redirect_url;
        } else {
            showNotification('Error creating document: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('Create error:', error);
        showNotification('Network error while creating document', 'error');
    }
}

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notification-message');
    
    if (notification && messageElement) {
        messageElement.textContent = message;
        notification.className = `notification show ${type}`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Update last saved time
function updateLastSaved(date) {
    const lastSavedElement = document.getElementById('last-saved');
    if (lastSavedElement) {
        const timeString = date.toLocaleTimeString();
        lastSavedElement.textContent = `Last saved: ${timeString}`;
    }
}

// Word count functionality
function updateWordCount() {
    const editor = document.getElementById('editor');
    const wordCountElement = document.getElementById('word-count');
    
    if (editor && wordCountElement) {
        const text = editor.innerText || editor.textContent || '';
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        wordCountElement.textContent = `Words: ${words.length}`;
    }
}

// Document list functionality
function setupDocumentList() {
    const documentItems = document.querySelectorAll('.document-item[data-document-id]');
    
    documentItems.forEach(item => {
        item.addEventListener('click', () => {
            const documentId = item.getAttribute('data-document-id');
            if (documentId) {
                window.location.href = `/editor/${documentId}/`;
            }
        });
    });
}

// Text formatting functions
function formatText(command) {
    // Ensure editor is focused
    const editor = document.getElementById('editor');
    if (editor) {
        editor.focus();
        
        // Handle heading commands specially
        if (command === 'h1' || command === 'h2' || command === 'h3') {
            document.execCommand('formatBlock', false, `<${command.toUpperCase()}>`);
        } else {
            document.execCommand(command, false, null);
        }
    }
    updateWordCount();
    markUnsaved();
}

function markUnsaved() {
    hasUnsavedChanges = true;
}

// Auto-save functionality
let autoSaveTimeout;
function scheduleAutoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        if (hasUnsavedChanges) {
            saveDocument();
        }
    }, 5000); // Auto-save after 5 seconds of inactivity
}

// Initialize core functionality
function initializeCore() {
    setupDocumentList();
    
    // Setup auto-save
    const editor = document.getElementById('editor');
    if (editor) {
        editor.addEventListener('input', () => {
            updateWordCount();
            markUnsaved();
            scheduleAutoSave();
        });
    }
    
    // Setup keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    saveDocument();
                    break;
                case 'n':
                    e.preventDefault();
                    createNewDocument();
                    break;
            }
        }
    });
    
    // Setup new document button
    const newDocBtn = document.getElementById('new-document-btn');
    if (newDocBtn) {
        newDocBtn.addEventListener('click', createNewDocument);
    }
    
    // Setup save confirmation on page unload
    window.addEventListener('beforeunload', (e) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeCore);