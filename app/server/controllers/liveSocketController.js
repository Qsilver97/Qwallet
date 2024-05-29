const socketManager = require('../managers/socketManager');
const stateManager = require('../managers/stateManager');
const { setRemoteSubshash } = require('../managers/stateManager');
const wasmManager = require('../managers/wasmManager');
const { splitAtFirstSpace, socketSync } = require('../utils/helpers');

module.exports = function (liveSocketURL) {
    let liveSocket;
    let reconnectingStatus = false;

    const connect = () => {
        liveSocket = socketManager.initLiveSocket(liveSocketURL);

        liveSocket.on('open', () => {
            console.log("Connected to the live socket");
            const init = async () => {
                const userState = stateManager.getUserState();
                let realPassword = userState.password;
                listResult = await wasmManager.ccall({ command: `list ${realPassword}`, flag: 'login' });
                const addresses = listResult.value.display.addresses;
                await socketSync(addresses[0]);
                const hexResult = await wasmManager.ccall({ command: `logintx ${realPassword}`, flag: 'logintx' });
                await socketSync(hexResult.value.display);
                reconnectingStatus = false;
                for (idx = 1; idx < addresses.length; idx++) {
                    if (addresses[idx] && addresses[idx] != "") {
                        liveSocket.send(addresses[idx]);
                    }
                }
            }
            if (reconnectingStatus)
                init();
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
                if (data.command == "CurrentTickInfo") {
                    stateManager.setTick(data.tick);
                }
                socketManager.getIO().emit('live', data);
            } catch (error) {
                console.error(`Error processing message: ${error}`);
            }
        };

        liveSocket.on('close', () => {
            console.log("Disconnected from the server. Attempting to reconnect...");
            reconnectingStatus = true;
            setTimeout(connect, 1000); // Attempt to reconnect after 1 seconds
        });
    };

    connect();
};
