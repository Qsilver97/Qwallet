let io = null;
let liveSocketClient = null;
// const liveSocketURL = 'wss://qsilver.org:5555';
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
            return false;
        }
        return io;
    },
    initLiveSocket: (liveSocketURL) => {
        liveSocketClient = new WebSocket(liveSocketURL);
        return liveSocketClient;
    },
    getLiveSocket: () => {
        if (!liveSocketClient) {
            return false;
        }
        return liveSocketClient;
    }
};
