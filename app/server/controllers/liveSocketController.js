const socketManager = require('../managers/socketManager');
const { setRemoteSubshash } = require('../managers/stateManager');

module.exports = function (liveSocket) {
    let socket = socketManager.getIO();
    liveSocket.on('open', () => {
        console.log("Connected to the live socket");
    });

    liveSocket.on('error', (error) => {
        console.error(`WebSocket error: ${error}`);
    });

    liveSocket.onmessage = (event) => {
        console.log(`Socket recieved: ${event.data}`);
        try {
            const data = JSON.parse(event.data)
            if (data.subshash) {
                setRemoteSubshash(data.subshash);
            }
            socket.emit('live', data);
        } catch (error) {

        }
    };

    liveSocket.on('close', () => {
        console.log("Disconnected from the server");
    });
}
