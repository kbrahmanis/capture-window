const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');
const screenshot = require('screenshot-desktop');
const fs = require('fs');
const { windowManager } = require('node-window-manager');
const sharp = require('sharp');

// Disable hardware acceleration to prevent common GPU crashes.
app.disableHardwareAcceleration();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'icon.ico')
  });

  mainWindow.loadFile('index.html');
  
  // Open DevTools in development
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Get list of windows
ipcMain.handle('get-windows', async () => {
  try {
    const windows = windowManager.getWindows();
    
    // Filter out windows that are not visible or don't have titles
    const visibleWindows = windows.filter(window => {
      const title = window.getTitle();
      return title && 
             title.trim() !== '' && 
             window.isVisible() && 
             !title.includes('Program Manager') &&
             !title.includes('Desktop Window Manager') &&
             title !== 'Window Screenshot App'; // Don't capture our own window
    });
    
    // Map to a format our frontend expects
    const windowList = visibleWindows.map(window => ({
      id: window.id,
      name: window.getTitle(),
      processName: window.path || window.getPath() || 'Unknown Process',
      bounds: window.getBounds()
    }));
    
    // Also add display options
    const displays = await screenshot.listDisplays();
    const displayList = displays.map((display, index) => ({
      id: `display_${display.id || index}`,
      name: `Display ${index + 1} (${display.name || 'Primary'})`,
      processName: 'Full Display',
      isDisplay: true
    }));
    
    return [...displayList, ...windowList];
  } catch (error) {
    console.error('Error getting windows:', error);
    // Fallback to displays only
    try {
      const displays = await screenshot.listDisplays();
      return displays.map((display, index) => ({
        id: `display_${display.id || index}`,
        name: `Display ${index + 1}`,
        processName: 'Full Display',
        isDisplay: true
      }));
    } catch (displayError) {
      console.error('Error getting displays:', displayError);
      return [];
    }
  }
});

// Handle request to select a folder
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  if (result.canceled) {
    return null; // User cancelled the dialog
  } else {
    return result.filePaths[0]; // Return the selected folder path
  }
});

// Capture screenshot of specific window
ipcMain.handle('capture-window', async (event, { displayId, savePath }) => {
  try {
    let img;
    
    // Check if it's a display or a specific window
    if (displayId.startsWith('display_')) {
      // Capture full display
      const id = displayId.replace('display_', '');
      img = await screenshot({ 
        screen: id,
        format: 'png'
      });
    } else {
      // Reworked window capture logic
      const win = windowManager.getWindows().find(w => w.id == displayId);
      if (!win) {
        return { success: false, error: 'Window not found' };
      }
      
      win.bringToTop();
      await new Promise(resolve => setTimeout(resolve, 250));
      
      const windowBounds = win.getBounds();
      
      const targetDisplay = screen.getDisplayMatching(windowBounds);
      const allDisplaysForScreenshot = await screenshot.listDisplays();
      const screenshotDisplay = allDisplaysForScreenshot.find(d =>
          d.left === targetDisplay.bounds.x &&
          d.top === targetDisplay.bounds.y &&
          d.right === targetDisplay.bounds.x + targetDisplay.bounds.width &&
          d.bottom === targetDisplay.bounds.y + targetDisplay.bounds.height
      );

      if (!screenshotDisplay) {
          throw new Error('Could not find a matching display for the screenshot library.');
      }

      const displayImg = await screenshot({ screen: screenshotDisplay.id, format: 'png' });
      
      const cropLeft = Math.floor(windowBounds.x - targetDisplay.bounds.x);
      const cropTop = Math.floor(windowBounds.y - targetDisplay.bounds.y);
      const cropWidth = Math.floor(windowBounds.width);
      const cropHeight = Math.floor(windowBounds.height);
      
      const metadata = await sharp(displayImg).metadata();
      if (cropLeft < 0 || cropTop < 0 || cropLeft + cropWidth > metadata.width || cropTop + cropHeight > metadata.height) {
          throw new Error('Window bounds are outside the display. Cannot capture.');
      }
      
      if (cropWidth <= 0 || cropHeight <= 0) {
        throw new Error('Invalid crop area: Window has zero or negative size.');
      }
      
      img = await sharp(displayImg)
        .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
        .toBuffer();
    }
    
    // Use the provided save path, or default to the Downloads folder if none is given.
    const finalSavePath = savePath || app.getPath('downloads');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `window-screenshot-${timestamp}.png`;
    const filepath = path.join(finalSavePath, filename);
    
    fs.writeFileSync(filepath, img);
    
    return {
      success: true,
      filepath: filepath,
      filename: filename
    };
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Show save dialog (remains for any future use, but not currently wired up)
ipcMain.handle('show-save-dialog', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: `window-screenshot-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
    filters: [
      { name: 'PNG Images', extensions: ['png'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  return result;
});