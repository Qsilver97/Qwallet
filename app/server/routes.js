const express = require('express');

const router = express.Router();

const mainController = require('./controllers/mainController');

router.post('/ccall', mainController.ccall);

module.exports = router;
