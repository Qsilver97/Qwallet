const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');

router.get('/login', mainController.getLogin);
router.get('/', mainController.getCli);
router.get('/dashboard', mainController.getDashboard);
router.get('/check', mainController.getCheck);
router.get('/create', mainController.getCreate);
router.get('/recover', mainController.getRecover);

router.post('/check', mainController.postCheck);
router.post('/create', mainController.postCreate);
router.post('/addaccount', mainController.postAddAccount);
router.post('/confirm', mainController.postConfirm);
router.post('/dashboard', mainController.postDashboard);
router.post('/logout', mainController.postLogout);
router.post('/postCheckAccount', mainController.postCheckAccount);
router.post('/postDeleteAccount', mainController.postDeleteAccount);
router.post('/gettransactionhistory', mainController.getTransaction);

module.exports = router;
