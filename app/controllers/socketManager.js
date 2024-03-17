// This will be set up in your main server file and used in controllers
let io = null;

module.exports = {
    init: (httpServer) => {
        io = require('socket.io')(httpServer);
        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    }
};
