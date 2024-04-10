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
router.post('/transfer', mainController.transfer);
router.post('/socket', mainController.socket);
router.post('/balances', mainController.balances);
router.post('/transfer-status', mainController.transferStatus);
router.post('/history', mainController.history);
router.post('/switch-network', mainController.switchNetwork);
router.post('/tokens', mainController.tokens);

module.exports = router;
