const wasmManager = require('../managers/wasmManager')

module.exports = function (io) {
    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('test', (msg) => {
            console.log(msg)
            socket.emit('test', msg)
        });

        socket.on('passwordAvail', async (msg) => {
            const resultFor22words = await wasmManager.ccall(msg)
            const resultFor55chars = await wasmManager.ccall({...msg, command: msg.command.replace('checkavail ', 'checkavail Q')})
            socket.emit('passwordAvail', resultFor22words.value.result == 0 && resultFor55chars.value.result == 0)
        })

        socket.on('disconnect', () => {

        });
    });
};
