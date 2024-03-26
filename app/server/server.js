const { app: electronApp, BrowserWindow } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');

// Import custom modules and configurations
const router = require('./routes.js');
const socketManager = require('./managers/socketManager')
const wasmManager = require('./managers/wasmManager')
const stateManager = require('./managers/stateManager')
const { PORT, FRONTEND_URL } = require('./utils/constants');

async function createDirectoryIfNotExists(directoryPath) {
    try {
        await fs.mkdir(directoryPath, { recursive: true });
    } catch (error) {
        console.error(`Error creating directory ${directoryPath}:`, error);
    }
}

const keyDirectoryPath = path.join(__dirname, 'keys');
createDirectoryIfNotExists(keyDirectoryPath);

async function init() {
    // Initialize WebSocket communication, WASM manager and UserState manager
    const io = await socketManager.init(http);
    // const liveSocket = await socketManager.initLiveSocket();
    wasmManager.init();
    stateManager.init();

    // Import and use socket controller with initialized WebSocket (io)
    require('./controllers/socketController')(io)
    // require('./controllers/liveSocketController')(liveSocket)
}

init()

// Middleware to enable CORS with dynamic origin support
app.use(cors({ origin: FRONTEND_URL }))

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, '/dist')));

// Use built-in middleware for parsing JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define routes
app.use('/api', router)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
});

// Start the HTTP server listening on the specified port
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
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
electronApp.whenReady().then(() => {
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