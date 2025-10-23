// Google Drive integration JavaScript

// Export document to Google Drive
async function exportToGoogleDrive() {
    if (!DOCUMENT_ID) {
        showNotification('No document to export', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/drive/export/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({
                document_id: DOCUMENT_ID
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Document exported to Google Drive successfully!');
            updateDriveStatus('synced');
        } else {
            showNotification('Export failed: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Network error during export', 'error');
    }
}

// Import document from Google Drive
async function importFromGoogleDrive() {
    try {
        // First, get list of documents from Google Drive
        const response = await fetch('/api/drive/list/', {
            method: 'GET',
            headers: {
                'X-CSRFToken': csrftoken,
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showDriveDocumentsList(data.documents);
        } else {
            showNotification('Failed to access Google Drive: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('Import error:', error);
        showNotification('Network error accessing Google Drive', 'error');
    }
}

// Show Google Drive documents list modal
function showDriveDocumentsList(documents) {
    // Create modal dynamically
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <div class="modal-title">Import from Google Drive</div>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                ${documents.length > 0 ? `
                    <div style="max-height: 400px; overflow-y: auto;">
                        ${documents.map(doc => `
                            <div class="drive-document-item" style="padding: 10px; border: 1px solid #eee; margin-bottom: 10px; border-radius: 4px; cursor: pointer;" 
                                 onclick="importSpecificDocument('${doc.id}')">
                                <strong>${doc.name}</strong><br>
                                <small>Modified: ${new Date(doc.modifiedTime).toLocaleDateString()}</small>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p>No documents found in your Google Drive Writing Center folder.</p>'}
            </div>
            <div class="modal-footer">
                <button class="action-btn" onclick="this.closest('.modal').remove()">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Import specific document
async function importSpecificDocument(driveFileId) {
    try {
        const response = await fetch('/api/drive/import/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({
                drive_file_id: driveFileId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Document imported successfully!');
            // Close modal
            document.querySelector('.modal').remove();
            // Redirect to new document
            window.location.href = data.redirect_url;
        } else {
            showNotification('Import failed: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('Import error:', error);
        showNotification('Network error during import', 'error');
    }
}

// Update Drive sync status indicator
function updateDriveStatus(status) {
    // Add visual indicator for Google Drive sync status
    const statusBar = document.querySelector('.status-bar');
    if (statusBar) {
        let driveStatus = statusBar.querySelector('.drive-status');
        if (!driveStatus) {
            driveStatus = document.createElement('div');
            driveStatus.className = 'drive-status';
            statusBar.appendChild(driveStatus);
        }
        
        switch (status) {
            case 'synced':
                driveStatus.innerHTML = '<i class="fab fa-google-drive" style="color: green;"></i> Synced';
                break;
            case 'pending':
                driveStatus.innerHTML = '<i class="fab fa-google-drive" style="color: orange;"></i> Pending';
                break;
            case 'error':
                driveStatus.innerHTML = '<i class="fab fa-google-drive" style="color: red;"></i> Error';
                break;
            default:
                driveStatus.innerHTML = '';
        }
    }
}

// Add Google Drive buttons to toolbar
function addGoogleDriveButtons() {
    const toolbar = document.querySelector('.editor-toolbar');
    if (toolbar) {
        // Create Google Drive section
        const driveSection = document.createElement('div');
        driveSection.className = 'toolbar-group google-drive-buttons';
        driveSection.innerHTML = `
            <button class="toolbar-btn" onclick="exportToGoogleDrive()" title="Export to Google Drive" aria-label="Export to Google Drive">
                <i class="fab fa-google-drive" aria-hidden="true"></i> Export
            </button>
            <button class="toolbar-btn" onclick="importFromGoogleDrive()" title="Import from Google Drive" aria-label="Import from Google Drive">
                <i class="fab fa-google-drive" aria-hidden="true"></i> Import
            </button>
        `;
        
        // Add separator and insert before modes section
        const separator = document.createElement('div');
        separator.className = 'toolbar-separator';
        separator.setAttribute('aria-hidden', 'true');
        
        const modesSection = toolbar.querySelector('.modes-toggle-section');
        if (modesSection) {
            toolbar.insertBefore(separator, modesSection);
            toolbar.insertBefore(driveSection, modesSection);
        } else {
            toolbar.appendChild(separator);
            toolbar.appendChild(driveSection);
        }
        
        // Show the buttons after they're inserted to prevent flash
        setTimeout(() => {
            driveSection.classList.add('visible');
        }, 0);
    }
}

// Initialize Google Drive integration
function initializeGoogleDrive() {
    // Add Google Drive buttons to the toolbar
    addGoogleDriveButtons();
    
    // Check if current document is synced with Drive
    // This would require adding sync status to the template context
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeGoogleDrive);