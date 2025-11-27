const { app, BrowserWindow, ipcMain, protocol, net } = require('electron');
const path = require('path');
const url = require('url');
const { startServer, getServerPort } = require('./utils/videoServer');

// Register scheme privileges before app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'media', privileges: { secure: true, supportFetchAPI: true, bypassCSP: true, stream: true } }
]);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true // Keep security enabled
    }
  });

  // In development, load from Vite server
  // In production, load from built files
  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist-react/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  // Start local video server
  await startServer();

  // Register 'media' protocol to serve local files
  protocol.handle('media', (request) => {
    try {
      // Parse the URL properly
      const parsedUrl = new URL(request.url);
      let filePath = parsedUrl.pathname;
      
      // On Windows, pathname might start with a slash (e.g. /C:/...)
      // We need to remove it to get a valid file path
      if (process.platform === 'win32' && filePath.startsWith('/') && /^[a-zA-Z]:/.test(filePath.slice(1))) {
        filePath = filePath.slice(1);
      }
      
      const decodedPath = decodeURIComponent(filePath);
      console.log('Loading file:', decodedPath); // Debug log
      
      const fileUrl = url.pathToFileURL(decodedPath).toString();
      return net.fetch(fileUrl);
    } catch (error) {
      console.error('Failed to fetch file:', error);
      return new Response('File not found', { status: 404 });
    }
  });

  createWindow();
});

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

const { scanFiles } = require('./utils/fileScanner');
const { renameAndMoveFile } = require('./utils/fileHandler');
const { addToIgnore } = require('./utils/ignoreManager');
const { getVideoDir } = require('./utils/videoDir.js');

// IPC handlers
ipcMain.handle('get-next-file', () => {
  const files = scanFiles();
  return files.length > 0 ? files[0] : null;
});

ipcMain.handle('confirm-file', (event, { filename, date, lessonNo, lessonTag }) => {
  try {
    const newPath = renameAndMoveFile(filename, date, lessonNo, lessonTag);
    return { success: true, newPath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('skip-file', (event, filename) => {
  addToIgnore(filename);
  return true;
});

ipcMain.handle('get-video-path', (event, filename) => {
  const videoPath = path.join(getVideoDir(), filename);
  const port = getServerPort();
  return `http://localhost:${port}/video?path=${encodeURIComponent(videoPath)}`;
});
