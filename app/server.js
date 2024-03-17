require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').createServer(app);
const userRoutes = require('./routes/userRoutes');
const mainRoutes = require('./routes/mainRoutes');
const socketManager = require('./controllers/socketManager')

const { PORT } = require('./utils/constants');

const io = socketManager.init(http);
const socketController = require('./controllers/socketController')(io)

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Use body-parser to parse form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Use morgan to view api logs
app.use(morgan('tiny'));

// Setup routes
app.use('/api', userRoutes);
app.use('/', mainRoutes);


// Start the server
http.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
