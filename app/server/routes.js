const express = require('express');

const router = express.Router();

const mainController = require('./controllers/mainController');

router.post('/ccall', mainController.ccall);
router.post('/checkavail', mainController.checkavail);

module.exports = router;
