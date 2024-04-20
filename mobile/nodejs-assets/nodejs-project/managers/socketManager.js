let liveSocketClient = null;
const liveSocketURL = 'wss://qsilver.org:5555';
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
