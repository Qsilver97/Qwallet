// Import necessary modules
const io = require('socket.io-client');
const axios = require('axios');
const { PORT } = require('../utils/constants');

// Connect to the socket server
const baseURL = `http://localhost:${PORT}`;
const socket = io(baseURL);

// Regularly emit 'broadcast' events every 1000 milliseconds (1 second)
// setInterval(() => {
//     socket.emit('broadcast', { command: 'v1request', message: { command: 'testmessage', flag: 'v1request' } });
// }, 1000);

// Listen for 'v1response' events from the server
socket.on('v1response', async (message) => {
    try {
        // Parse the message to get the endpoint
        const endpoint = JSON.parse(message.value).display;
        // Perform a GET request to the specified endpoint
        const response = await axios.get(`http://93.190.139.223:8080/v1/${endpoint}`);

        // Format the command to be sent
        const formattedCommand = `v1${endpoint.replace("/", " ")} ${JSON.stringify(response.data).replace(' ', '').replace('\n', '')}`;

        // Emit a 'broadcast' event with the response data
        // socket.emit('broadcast', { command: 'qwalletwithv1', message: { command: formattedCommand, flag: 'qwalletwithv1' } });
    } catch (error) {
        console.error('An error occurred:', error);
    }
});
