const { app, BrowserWindow, Menu, shell, ipcMain, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

let mainWindow = null;
let localServer = null;

function startLocalServer(distDir, callback) {
  localServer = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || !reqPath) reqPath = '/index.html';
    const filePath = path.join(distDir, reqPath);

    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      const indexPath = path.join(distDir, 'index.html');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(indexPath).pipe(res);
    }
  });

  localServer.listen(0, '127.0.0.1', () => {
    const port = localServer.address().port;
    callback(port);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    title: 'SSN College of Engineering - IT Attendance System',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  const isDev = process.argv.includes('--dev');
  const distDir = path.join(__dirname, '../frontend/dist');
  const standalonePath = path.join(__dirname, '../standalone-portal.html');

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      startLocalServer(distDir, (port) => {
        mainWindow.loadURL(`http://127.0.0.1:${port}`);
      });
    });
  } else {
    if (fs.existsSync(path.join(distDir, 'index.html'))) {
      startLocalServer(distDir, (port) => {
        mainWindow.loadURL(`http://127.0.0.1:${port}`);
      });
    } else {
      mainWindow.loadFile(standalonePath);
    }
  }

  createAppMenu();

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (localServer) {
      localServer.close();
      localServer = null;
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function createAppMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac
      ? [{
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
          ]
        }]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Live Google Sheet',
          accelerator: 'CmdOrCtrl+G',
          click: () => {
            shell.openExternal('https://docs.google.com/spreadsheets/d/1hr6niV60fj67sidkYEj7ausv6aoGUndR1wcakoVmRjo/edit');
          }
        },
        {
          label: 'Open Standalone Offline Portal',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            const standalonePath = path.join(__dirname, '../standalone-portal.html');
            if (mainWindow && fs.existsSync(standalonePath)) {
              mainWindow.loadFile(standalonePath);
            }
          }
        },
        {
          label: 'Return to Main App',
          accelerator: 'CmdOrCtrl+H',
          click: () => {
            const distPath = path.join(__dirname, '../frontend/dist/index.html');
            if (mainWindow && fs.existsSync(distPath)) {
              mainWindow.loadFile(distPath);
            }
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Portals',
      submenu: [
        {
          label: '👨‍🏫 Teacher Dashboard',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('menu-action', 'nav-teacher');
          }
        },
        {
          label: '🛡️ Admin Console',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('menu-action', 'nav-admin');
          }
        },
        {
          label: '🎓 Student Portal',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('menu-action', 'nav-student');
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [
              { type: 'separator' },
              { role: 'front' },
              { type: 'separator' },
              { role: 'window' }
            ]
          : [{ role: 'close' }])
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'SSN College of Engineering Website',
          click: () => shell.openExternal('https://www.ssn.edu.in')
        },
        {
          label: 'GitHub Repository',
          click: () => shell.openExternal('https://github.com/pradeepvijay2k6-ai/attendance-tracking-system')
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.on('open-external', (_event, url) => {
  shell.openExternal(url);
});

ipcMain.on('notify', (_event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title: title || 'SSN Attendance', body: body || '' }).show();
  }
});

// App Lifecycle
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

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
}
