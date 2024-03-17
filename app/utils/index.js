const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Middleware to parse JSON and urlencoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route that sends a simple response
app.get('/', (req, res) => {
    res.send("QUBIC");
});

// Test route to serve an HTML file with specific Cross-Origin headers
app.get('/test', (req, res) => {
    // Set headers to enable Cross-Origin Isolation
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

    // Send an HTML file from the 'public' directory
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
