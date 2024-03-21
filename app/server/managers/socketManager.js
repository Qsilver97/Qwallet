let io = null;
let liveSocketClient = null;
const liveSocketURL = 'wss://qsilver.org:5555';
const WebSocket = require('ws');

module.exports = {
    init: async (httpServer) => {
        io = await require('socket.io')(httpServer, {
            cors: {
                origin: '*',
            }
        });
        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    },
    initLiveSocket: async () => {
        liveSocketClient = await new WebSocket(liveSocketURL);
        return liveSocketClient;
    },
    getLiveSocket: () => {
        if (!liveSocketClient) {
            throw new Error('Live socket not initialized!');
        }
        return liveSocketClient;
    }
};
