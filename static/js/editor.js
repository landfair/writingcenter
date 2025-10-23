// Editor-specific JavaScript functionality

function initializeEditor() {
    const editor = document.getElementById('editor');
    if (!editor) return;
    
    // Set up editor event listeners
    editor.addEventListener('paste', handlePaste);
    editor.addEventListener('keydown', handleKeyDown);
    
    // Focus editor on load
    editor.focus();
}

function handlePaste(e) {
    // Clean pasted content to avoid formatting issues
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
    updateWordCount();
    markUnsaved();
}

function handleKeyDown(e) {
    // Handle special key combinations in editor
    if (e.key === 'Tab') {
        e.preventDefault();
        document.execCommand('insertText', false, '    '); // Insert 4 spaces
    }
}

// Download functionality
function downloadDocument() {
    const editor = document.getElementById('editor');
    const title = document.getElementById('document-title').textContent || 'document';
    
    if (!editor) return;
    
    const content = editor.innerHTML;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}