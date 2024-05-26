const socketManager = require('../managers/socketManager');
const stateManager = require('../managers/stateManager');
const { setRemoteSubshash } = require('../managers/stateManager');
const wasmManager = require('../managers/wasmManager');
const { splitAtFirstSpace } = require('../utils/helpers');

module.exports = function (liveSocketURL) {
    let liveSocket;

    const connect = () => {
        liveSocket = socketManager.initLiveSocket(liveSocketURL);

        liveSocket.on('open', () => {
            console.log("Connected to the live socket");
        });

        liveSocket.on('error', (error) => {
            console.error(`WebSocket error: ${error}`);
        });

        liveSocket.onmessage = (event) => {
            console.log(`Socket received: ${event.data}`);
            try {
                let flag, data;
                if (event.data.startsWith('#')) {
                    [flag, data] = splitAtFirstSpace(event.data);
                } else {
                    data = JSON.parse(event.data);
                }
                if (data.subshash) {
                    setRemoteSubshash(data.subshash);
                }
                if (data.wasm == 1) {
                    console.log(`Socket received: Wasm call - wss ${JSON.stringify(data)}`);
                    wasmManager.ccall({ command: `wss ${JSON.stringify(data)}`, flag: 'wss' });
                }
                if (flag) {
                    stateManager.updateSocketState(flag.slice(1), data);
                }
                socketManager.getIO().emit('live', data);
            } catch (error) {
                console.error(`Error processing message: ${error}`);
            }
        };

        liveSocket.on('close', () => {
            console.log("Disconnected from the server. Attempting to reconnect...");
            setTimeout(connect, 1000); // Attempt to reconnect after 1 seconds
        });
    };

    connect();
};
