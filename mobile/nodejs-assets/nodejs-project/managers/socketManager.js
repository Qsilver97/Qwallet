let liveSocketClient = null;
const WebSocket = require('ws');

module.exports = {
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
