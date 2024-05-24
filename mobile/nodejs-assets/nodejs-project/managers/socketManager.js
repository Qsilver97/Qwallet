let liveSocketClient = null;
const liveSocketURL = 'wss://websocket.qsilver.org';
const WebSocket = require('ws');

module.exports = {
    initLiveSocket: () => {
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
