module.exports = function (io) {
    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('test', (msg) => {
            console.log(msg)
            socket.emit('test', msg)
        });

        socket.on('disconnect', () => {

        });
    });
};
