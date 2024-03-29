const fs = require('fs').promises;
const path = require('path');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');
const { log } = require('./utils/helpers.js');

// Import custom modules and configurations
const router = require('./routes.js');
const socketManager = require('./managers/socketManager')
const wasmManager = require('./managers/wasmManager')
const stateManager = require('./managers/stateManager')
const { PORT, FRONTEND_URL } = require('./utils/constants');

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

exports.startServer = async () => {

    async function createDirectoryIfNotExists(directoryPath) {
        try {
            await fs.mkdir(directoryPath, { recursive: true });
        } catch (error) {
            log(`Error creating directory ${directoryPath}:${error}`);
        }
    }

    const keyDirectoryPath = path.join(__dirname, 'keys');
    log(keyDirectoryPath)
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

        console.log = (...args) => {
            const timestamp = new Date().toISOString();
            const message = args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
            ).join(" ");
            const logMessage = `[${timestamp}] ${message}`;
            if (message.startsWith('Socket sent') || message.startsWith('Socket recieved')) {
                io.emit('socketLog', logMessage);
            } else {
                io.emit('log', logMessage)
            }
            originalConsoleLog(logMessage);
        };

        console.error = (...args) => {
            const timestamp = new Date().toISOString();
            const message = args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
            ).join(" ");
            const errorMessage = `[${timestamp}] ${message}`;
            io.emit('log', errorMessage);
            originalConsoleError(errorMessage);
        };
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

}

if (require.main === module) {
    exports.startServer();
}