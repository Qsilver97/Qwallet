const WebSocket = require('ws');

function connectAndRequestData(url) {
    // Initialize a WebSocket connection
    const ws = new WebSocket(url);

    // Event handler for successfully opening a connection
    ws.on('open', () => {
        console.log("Connected to the server");

        function sendRequest() {
            ws.send("JZNVEOLEPZFPCEZYAPVJGNGOMBLBAIKEHGAHURZXEBJBURUBGOGHIYGCWFWB");
        }

        sendRequest();
    });

    ws.on('error', (error) => {
        console.error(`WebSocket error: ${error}`);
    });

    ws.on('message', (data) => {
        const response = new Uint8Array(data);
        const hexString = [...response].map(b => b.toString(16).padStart(2, '0')).join('');
        const byteArray = new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        const decoder = new TextDecoder('utf-8');
        const jsonString = decoder.decode(byteArray);
        console.log(jsonString, 111, typeof jsonString)
    });

    ws.onmessage = function(event) {
        console.log(event.data, 222, typeof event.data)
    }

    ws.on('close', () => {
        console.log("Disconnected from the server");
    });
}

connectAndRequestData("ws://93.190.139.223:4444");
