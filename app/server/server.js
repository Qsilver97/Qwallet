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
http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
