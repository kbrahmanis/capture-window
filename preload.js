const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getWindows: () => ipcRenderer.invoke('get-windows'),
  captureWindow: ({ displayId, savePath }) => ipcRenderer.invoke('capture-window', { displayId, savePath }),
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  selectFolder: () => ipcRenderer.invoke('select-folder')
});