const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const { PORT } = require('./utils/constants');
const createModule = require('./utils/a.out.js');
const bodyParser = require('body-parser');

const Module = createModule();

const callQwallet = async (req) => {
    const result = await Module.ccall('qwallet', 'string', ['string'], [req.command]);
    return { value: JSON.parse(result), flag: req.flag };
};

app.use(express.static(path.join(__dirname, '/dist')));

// Use body-parser to parse form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/ccall', async (req, res) => {
    console.log(req.body)
    const result = await callQwallet(req.body);
    res.send(result)
})

// Serve the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});