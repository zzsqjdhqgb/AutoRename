const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  // Open DevTools in development
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
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
  return `file://${videoPath}`;
});
