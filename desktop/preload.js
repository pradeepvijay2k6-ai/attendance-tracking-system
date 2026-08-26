const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopApi', {
  isDesktop: true,
  platform: process.platform,
  version: '1.0.0',
  openExternal: (url) => ipcRenderer.send('open-external', url),
  sendNotification: (title, body) => ipcRenderer.send('notify', { title, body }),
  onMenuAction: (callback) => ipcRenderer.on('menu-action', (_event, action) => callback(action))
});
