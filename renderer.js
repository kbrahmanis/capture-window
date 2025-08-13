// DOM elements
const refreshBtn = document.getElementById('refreshBtn');
const windowSelect = document.getElementById('windowSelect');
const captureBtn = document.getElementById('captureBtn');
const pathBtn = document.getElementById('pathBtn');
const pathDisplay = document.getElementById('pathDisplay');
const status = document.getElementById('status');
const recentCaptures = document.getElementById('recentCaptures');
const capturesList = document.getElementById('capturesList');

let selectedWindowId = null;
let selectedPath = null;
let captures = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    refreshWindows();
    
    refreshBtn.addEventListener('click', refreshWindows);
    windowSelect.addEventListener('change', onWindowSelected);
    captureBtn.addEventListener('click', captureScreenshot);
    pathBtn.addEventListener('click', selectSaveFolder);
});

// Refresh available windows/displays
async function refreshWindows() {
    updateStatus('Loading available windows...', 'loading');
    refreshBtn.disabled = true;
    
    try {
        const windows = await window.electronAPI.getWindows();
        populateWindowSelect(windows);
        updateStatus('Windows loaded successfully', 'success');
    } catch (error) {
        updateStatus(`Error loading windows: ${error.message}`, 'error');
        console.error('Error refreshing windows:', error);
    } finally {
        refreshBtn.disabled = false;
    }
}

// Populate window selection dropdown
function populateWindowSelect(windows) {
    windowSelect.innerHTML = '<option value="">Select a display/window...</option>';
    
    if (windows.length === 0) {
        windowSelect.innerHTML = '<option value="">No windows available</option>';
        return;
    }
    
    // Group by type
    const displays = windows.filter(w => w.isDisplay);
    const appWindows = windows.filter(w => !w.isDisplay);
    
    // Add displays first
    if (displays.length > 0) {
        const displayGroup = document.createElement('optgroup');
        displayGroup.label = 'Displays/Monitors';
        displays.forEach(display => {
            const option = document.createElement('option');
            option.value = display.id;
            option.textContent = display.name;
            displayGroup.appendChild(option);
        });
        windowSelect.appendChild(displayGroup);
    }
    
    // Add application windows
    if (appWindows.length > 0) {
        const windowGroup = document.createElement('optgroup');
        windowGroup.label = 'Application Windows';
        appWindows.forEach(window => {
            const option = document.createElement('option');
            option.value = window.id;
            option.textContent = `${window.name} - ${window.processName}`;
            windowGroup.appendChild(option);
        });
        windowSelect.appendChild(windowGroup);
    }
}

// Handle window selection
function onWindowSelected() {
    selectedWindowId = windowSelect.value;
    
    if (selectedWindowId) {
        captureBtn.disabled = false;
        updateStatus(`Selected: ${windowSelect.options[windowSelect.selectedIndex].text}`, 'success');
    } else {
        captureBtn.disabled = true;
        updateStatus('Please select a window to capture', '');
    }
}

// Capture screenshot
async function captureScreenshot() {
    if (!selectedWindowId) {
        updateStatus('Please select a window first', 'error');
        return;
    }
    
    captureBtn.disabled = true;
    updateStatus('Capturing screenshot...', 'loading');
    
    try {
        const result = await window.electronAPI.captureWindow({ displayId: selectedWindowId, savePath: selectedPath });
        
        if (result.success) {
            updateStatus(`Screenshot saved: ${result.filename}`, 'success');
            addToRecentCaptures(result.filename, result.filepath);
        } else {
            updateStatus(`Failed to capture: ${result.error}`, 'error');
        }
    } catch (error) {
        updateStatus(`Error capturing screenshot: ${error.message}`, 'error');
        console.error('Capture error:', error);
    } finally {
        captureBtn.disabled = false;
    }
}

// Select and update the save folder
async function selectSaveFolder() {
    try {
        const folderPath = await window.electronAPI.selectFolder();
        if (folderPath) {
            selectedPath = folderPath;
            pathDisplay.textContent = `Save Location: ${folderPath}`;
            pathDisplay.title = folderPath; // Show full path on hover
            updateStatus('Save location updated.', 'success');
        }
    } catch (error) {
        updateStatus(`Error selecting folder: ${error.message}`, 'error');
        console.error('Folder selection error:', error);
    }
}

// Update status message
function updateStatus(message, type = '') {
    status.textContent = message;
    status.className = `status ${type}`;
}

// Add capture to recent list
function addToRecentCaptures(filename, filepath) {
    const capture = {
        filename,
        filepath,
        timestamp: new Date().toLocaleString()
    };
    
    captures.unshift(capture);
    
    // Keep only last 5 captures
    if (captures.length > 5) {
        captures = captures.slice(0, 5);
    }
    
    updateRecentCapturesList();
    recentCaptures.style.display = 'block';
}

// Update recent captures display
function updateRecentCapturesList() {
    capturesList.innerHTML = '';
    
    captures.forEach(capture => {
        const item = document.createElement('div');
        item.className = 'capture-item';
        item.innerHTML = `
            <div>
                <span>${capture.filename}</span>
                <br>
                <small>${capture.timestamp}</small>
            </div>
        `;
        capturesList.appendChild(item);
    });
}