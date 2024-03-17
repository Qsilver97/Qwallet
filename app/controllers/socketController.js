const { spawn } = require('child_process');

module.exports = function (io) {
    io.on('connection', (socket) => {
        console.log('A user connected');
        let mainChild = null;
        let v1Child = null;
        let liveSocketChild = null;

        const killChildProcesses = () => {
            if (mainChild) {
                console.log("1======================================================================")
                mainChild.kill();
                mainChild = null;
            }
            if (v1Child) {
                console.log("2======================================================================")
                v1Child.kill();
                v1Child = null;
            }
            if (liveSocketChild) {
                console.log("3======================================================================")
                liveSocketChild.kill();
                liveSocketChild = null;
            }
        };

        socket.on('start', (msg) => {
            killChildProcesses();
            console.log("Restart server!")
            mainChild = spawn('node', ['./emscripten/command.js']);
            v1Child = spawn('node', ['./emscripten/v1request.js']);
            liveSocketChild = spawn('node', ['./emscripten/livesocket.js'])

            mainChild.stdout.on('data', (data) => {
                socket.emit('log', { value: data.toString(), flag: 'log' });
            });

            liveSocketChild.stdout.on('data', (data) => {
                console.log(`-----------sent socket---------\n`, data.toString());
            });

            mainChild.stderr.on('data', (data) => {
                socket.emit('log', { value: `ERROR: ${data.toString()}`, flag: 'log' });
            });

            mainChild.on('close', (code) => {
                // socket.emit('log', `Child process exited with code ${code}`);
            });
        });

        socket.on('run', (msg) => {
            socket.broadcast.emit('qwallet', msg);
        });

        socket.on('stop', () => {
            killChildProcesses();
        });

        socket.on('broadcast', (message) => {
            // console.log(message)
            // if(message.wasm==1){
                socket.broadcast.emit(message.command, message.message);
            // }
        });

        socket.on('disconnect', () => {
            killChildProcesses();
        });
    });
};
