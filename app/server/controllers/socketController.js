module.exports = function (io) {
    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('test', (msg) => {
            console.log(msg)
        });

        socket.on('disconnect', () => {

        });
    });
};
