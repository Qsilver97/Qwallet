const createModule = require('../public/a.out.js');

// Initialize the WebAssembly module
const Module = createModule();

// Define the message to be sent to the WebAssembly function
const message = "v1request";

// Call the 'qwallet' function from the WebAssembly module with the message
const result = Module.ccall("qwallet", 'string', ['string'], [message]);

console.log(result);

// Exit the process explicitly
process.exit();
