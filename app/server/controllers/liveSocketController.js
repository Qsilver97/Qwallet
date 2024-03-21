const socketManager = require('../managers/socketManager');

module.exports = function (liveSocket) {
    let socket = socketManager.getIO();
    liveSocket.on('open', () => {
        console.log("Connected to the live socket");
    });

    liveSocket.on('error', (error) => {
        console.error(`WebSocket error: ${error}`);
    });

    liveSocket.onmessage = function (event) {
        socket.emit('live', event.data)
    }

    liveSocket.on('close', () => {
        console.log("Disconnected from the server");
    });
}
