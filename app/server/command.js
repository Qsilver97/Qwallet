const createModule = require('./utils/a.out.js');
const io = require('socket.io-client');

const baseURL = `http://127.0.0.1:3000`;

const socket = io(baseURL);

const Module = createModule();

// Function to call the 'qwallet' function from the WebAssembly module
const callQwallet = async (req) => {
    const result = await Module.ccall('qwallet', 'string', ['string'], [req.command]);
    return { value: result, flag: req.flag };
};

// Event listener for 'qwallet'
socket.on('qwallet', async (req) => {
    const result = await callQwallet(req);
    socket.emit('broadcast', { command: 'result', value: result });
});
