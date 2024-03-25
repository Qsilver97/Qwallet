const express = require('express');

const router = express.Router();

const mainController = require('./controllers/mainController');

router.post('/ccall', mainController.ccall);
router.post('/checkavail', mainController.checkavail);
router.post('/login', mainController.login);
router.post('/logout', mainController.logout);
router.post('/fetch-user', mainController.fetchUser);
router.post('/delete-account', mainController.deleteAccount);
router.post('/add-account', mainController.addAccount);
router.post('/restore', mainController.restoreAccount);

module.exports = router;
