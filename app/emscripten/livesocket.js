// Import necessary modules
const io = require('socket.io-client');
const axios = require('axios');
const { PORT } = require('../utils/constants');
const WebSocket = require('ws');

let addressStartTime = {}

// Connect to the socket server
const baseURL = `http://localhost:${PORT}`;
const liveSocketURL = 'ws://93.190.139.223:4444';

const socket = io(baseURL);
const liveSocket = new WebSocket(liveSocketURL);

// Event handler for successfully opening a connection
liveSocket.on('open', () => {
    // console.log("Connected to the server");
});

liveSocket.on('error', (error) => {
    // console.error(`WebSocket error: ${error}`);
});

liveSocket.onmessage = function (event) {
    // console.log(event.data, 222, typeof event.data)
    if (event.data == "") {
        let endTime = performance.now();
        console.log(addressStartTime)
        for (let address in addressStartTime) {
            if (endTime > addressStartTime[address] + 60000) {
                console.log(address, 1)
                addressStartTime[address] = performance.now()
                liveSocket.send(address)
            }
        }
    } else {
        // startTime = performance.now()
        try {
            let data = JSON.parse(event.data);
            if (data.address) {
                addressStartTime[data.address] = performance.now()
            }
        } catch (error) {

        }
        if (typeof event.data == 'string' && event.data.startsWith('{') && event.data.endsWith('}')) {
            socket.emit('broadcast', { command: 'liveSocketResponse', message: event.data });
        } else {
        }
    }
}

liveSocket.on('close', () => {
    console.log("Disconnected from the server");
});

setInterval(() => {
    let endTime = performance.now();
    // console.log(endTime,"endTime")
    for (let address in addressStartTime) {
        if (endTime > addressStartTime[address] + 60000) {
            console.log(address, 2)
            addressStartTime[address] = performance.now()
            liveSocket.send(address)
        }
    }
}, 1000);

socket.on('liveSocketRequest', async (message) => {
    if(message.flag == "v1request") {
        liveSocket.send(message.data);
    }
    if (addressStartTime[message.data] && message.flag == "address") {
        console.log('Already sent this address')
    } else {
        if (message.data != "" && message.flag == "address" && message.data != 'status') {
            console.log(message.data, 3)
            addressStartTime[message.data] = performance.now()
            liveSocket.send(message.data);
        } else if (message.data != '' && message.flag == 'transfer') {
            console.log("----------------transfer-----------------------")
            console.log(message.data)
            console.log("----------------transfer-----------------------")
            liveSocket.send(message.data, 4);
        }
    }
    if (message.flag == "address" && message.data != "") {
        addressStartTime[message.data] = performance.now()
    }
})
