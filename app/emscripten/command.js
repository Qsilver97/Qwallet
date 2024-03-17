const createModule = require('../public/a.out.js');
const io = require('socket.io-client');
const axios = require('axios');
const { PORT } = require('../utils/constants');

// Remove the first two elements (node, filename)
const args = process.argv.splice(2);

// Initialize the WebAssembly module
const Module = createModule();


const baseURL = `http://localhost:${PORT}`;

const api = axios.create({
    baseURL
});

// Connect to the WebSocket server
const socket = io(baseURL);

// Function to call the 'qwallet' function from the WebAssembly module
const callQwallet = async (req) => {
    const result = await Module.ccall('qwallet', 'string', ['string'], [req.command]);
    return { value: result, flag: req.flag };
};

// Event listener for 'qwallet'
socket.on('qwallet', async (req) => {
    const result = await callQwallet(req);
    socket.emit('broadcast', { command: 'result', message: result })
});

// Event listener for 'qwalletwithv1'
socket.on('qwalletwithv1', async (req) => {
    await callQwallet(req); // Process the command but no need to log or emit
});

async function v1request() {
    try {
        const result = await callQwallet({ command: "v1request", flag: "v1request" });
        const parsedResult = JSON.parse(result.value);
        if (parsedResult.result === 0) {
            socket.emit('broadcast', { command: 'liveSocketRequest', message: { data: parsedResult.display, flag: "v1request" } })
        } else {
        }
    } catch (error) {
    }
}

setInterval(() => {
    v1request();
}, 1000);

socket.on('wssRequest', async (msg) => {
    try {
        const result = await callQwallet({ command: `wss ${JSON.stringify(msg)}`, flag: "wss" });
        const parsedResult = JSON.parse(result.value);
        socket.emit('braodcast', { command: 'wssResponse', message: parsedResult })
    } catch {

    }
})
