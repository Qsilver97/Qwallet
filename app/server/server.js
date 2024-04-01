const { app: electronApp, BrowserWindow } = require('electron');
const path = require('path');
const { startServer } = require('./main');
function createWindow() {
    // Create the browser window.
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const mainWindow = new BrowserWindow({
        width,
        height: Math.round(height * 0.8),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Load your Express app
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.maximize();
    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electronApp.whenReady().then(async () => {
    await startServer()
    createWindow();

    electronApp.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electronApp.on('window-all-closed', function () {
    if (process.platform !== 'darwin') electronApp.quit();
});