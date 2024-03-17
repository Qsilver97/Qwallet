const socketManager = require("./socketManager");
const axios = require('axios')
const TRANSACTION_URL = require('../utils/constants').TRANSACTION_URL

let seedInfo = null;
let confirmSeeds = new Array(24).fill("");

function reset() {
    seedInfo = null;
    confirmSeeds = new Array(24).fill("");
}

exports.getLogin = (req, res) => {
    if (seedInfo && seedInfo.result.result == 0 && seedInfo.result.seedpage == 0) {
        res.redirect('dashboard')
    } else if (seedInfo && seedInfo.result.result == 0 && seedInfo.result.seedpage == 1) {
        res.redirect('create')
    } else {
        reset()
        res.render('login')
    }
}

exports.getTransaction = (req, res) => {
    const address = req.body.address
    axios
        .post(TRANSACTION_URL, {
            "identity": address
        })
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            // console.error(error);
        });
}

exports.getRecover = (req, res) => {
    try {
        res.render('recover')
    } catch (error) {
        console.log(error)
    }
}

exports.getCli = (req, res) => {
    res.render('index')
}

exports.getDashboard = (req, res) => {
    if (seedInfo && seedInfo.result.result == 0 && seedInfo.result.seedpage == 0) {
        res.render('dashboard', { ...seedInfo, result: { ...seedInfo.result, display: seedInfo.result.display.split(' ') } })
    } else if (seedInfo && seedInfo.result.result == 0 && seedInfo.result.seedpage == 1) {
        res.redirect('create')
    } else {
        res.redirect('login')
    }
}

exports.getCheck = (req, res) => {
    if (seedInfo && seedInfo.result.result == 0 && seedInfo.result.seedpage == 0) {
        res.redirect('dashboard')
    } else if (seedInfo && seedInfo.result.result == 0 && seedInfo.result.seedpage == 1) {
        res.render('check', { confirmSeeds, password: seedInfo.password })
    } else {
        res.redirect('login')
    }
}

exports.getCreate = (req, res) => {
    if (seedInfo && seedInfo.result.result == 0 && seedInfo.result.seedpage == 0) {
        res.redirect('dashboard')
    } else if (seedInfo && seedInfo.result.result == 0 && seedInfo.result.seedpage == 1) {
        res.render('create', seedInfo)
    } else {
        res.redirect('login')
    }
}

exports.postCreate = (req, res) => {
    seedInfo = { ...req.body, result: JSON.parse(req.body.result) }
    console.log(seedInfo)
    res.redirect('create')
}

exports.postCheck = (req, res) => {
    res.redirect('check')
}

exports.postAddAccount = (req, res) => {
    const io = socketManager.getIO()
    // io.emit('testemit', 'test emit message')
    seedInfo = { ...seedInfo, result: { ...seedInfo.result, display: `${seedInfo.result.display} ${req.body.display}` } }
    console.log(seedInfo, 'addaccount', req.body)
    res.send('aaaa')
}

exports.postConfirm = (req, res) => {
    const display = seedInfo.result.display.split(' ')
    let compare = true;

    if (seedInfo.password.startsWith('Q')) {
        confirmSeeds[0] = req.body['seed0']
        if (req.body['seed0'] != display[0]) {
            compare = false
        }
    } else {
        display.map((word, index) => {
            confirmSeeds[index] = req.body[`seed${index}`];
            if (req.body[`seed${index}`] != word) compare = false;
        })
    }

    if (compare) {
        seedInfo = { ...seedInfo, result: JSON.parse(req.body['result']) }
        console.log(seedInfo, 'hello')
        confirmSeeds = new Array(24).fill("");
        res.redirect('dashboard')
    } else {
        res.redirect('check?status=notmatch')
    }
}

exports.postDashboard = (req, res) => {
    console.log("PostDashboard")
    seedInfo = { ...req.body, result: JSON.parse(req.body.result) }
    res.redirect('dashboard')
}

exports.postLogout = (req, res) => {
    reset()
    res.redirect('login')
}

exports.postCheckAccount = (req, res) => {
    seedInfo = { ...seedInfo, result: { ...seedInfo.result, display: req.body.accounts.join(' ') } }
    res.send('success')
}

exports.postDeleteAccount = (req, res) => {
    console.log(req.body.address)
    console.log(seedInfo)
    seedInfo = { ...seedInfo, result: { ...seedInfo.result, display: seedInfo.result.display.replace(` ${req.body.address}`, "") } }
    res.send('success')
}
