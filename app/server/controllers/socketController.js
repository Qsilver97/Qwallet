const socketManager = require('../managers/socketManager');
const wasmManager = require('../managers/wasmManager')

module.exports = function (io) {
    io.on('connection', (socket) => {
        console.log('A user connected');
        socket.on('test', (msg) => {
            console.log(msg)
            socket.emit('test', msg)
        });

        socket.on('passwordAvail', async (msg) => {
            const resultFor24words = await wasmManager.ccall(msg)
            const resultFor55chars = await wasmManager.ccall({ ...msg, command: msg.command.replace('checkavail ', 'checkavail Q') })
            socket.emit('passwordAvail', resultFor24words.value.result == 0 && resultFor55chars.value.result == 0)
        })

        socket.on('send', (msg) => {
            const liveSocket = socketManager.getLiveSocket();
            liveSocket.send(msg);
        })

        socket.on('disconnect', () => {

        });
    });
};
