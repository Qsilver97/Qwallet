const wasmManager = require('../managers/wasmManager');
const stateManager = require('../managers/stateManager');
const socketManager = require('../managers/socketManager');
const { delay } = require('../utils/helpers');
const liveSocketController = require('./liveSocketController');

exports.ccall = async (req, res) => {
    const result = await wasmManager.ccall(req.body);
    console.log(result);
    res.send(result);
}

exports.checkavail = async (req, res) => {
    const resultFor24words = await wasmManager.ccall(req.body);
    const resultFor55chars = await wasmManager.ccall({ ...req.body, command: req.body.command.replace('checkavail ', 'checkavail Q') });
    res.send(resultFor24words.value.result == 0 && resultFor55chars.value.result == 0);
}

exports.createAccount = async (req, res) => {

}

exports.login = async (req, res) => {
    let password;
    stateManager.init();
    const liveSocket = await socketManager.initLiveSocket();
    const resultFor24words = await wasmManager.ccall({ command: `checkavail ${req.body.password}`, flag: 'login' });
    const resultFor55chars = await wasmManager.ccall({ command: `checkavail Q${req.body.password}`, flag: 'login' });
    console.log(req.body.password, resultFor24words, resultFor55chars);
    if (resultFor24words.value.result != -33 && resultFor55chars.value.result != -33) {
        res.status(401).send('Password does not exist.');
        return
    } else if (resultFor24words.value.result == -33) {
        password = req.body.password;
    } else if (resultFor55chars.value.result == -33) {
        password = `Q${req.body.password}`;
    }
    const result = await wasmManager.ccall({ command: `list ${password}`, flag: 'login' });
    const socket = socketManager.getIO();
    const localSubshash = result.value.display.subshash;
    stateManager.setLocalSubshash(localSubshash);

    liveSocketController(liveSocket);
    await delay(1000);
    liveSocket.send('clearderived');

    const addresses = result.value.display.addresses;
    await delay(200);
    liveSocket.send(addresses[0]);

    await delay(200)
    const hexResult = await wasmManager.ccall({ command: `logintx ${password}`, flag: 'logintx' });
    console.log(hexResult.value.display, 'qqqqq')
    liveSocket.send(hexResult.value.display);
    await delay(200)

    for (let idx = 1; idx < addresses.length; idx++) {
        if (addresses[idx] != "") {
            console.log(`+${idx} ${addresses[idx]}`)
            await delay(50)
            liveSocket.send(`+${idx} ${addresses[idx]}`)
        }
    }

    await delay(200);
    const remoteSubshas = stateManager.getRemoteSubshash();
    console.log('1', remoteSubshas, '2', localSubshash)
    if ((localSubshash != "") && (remoteSubshas == localSubshash)) {
        stateManager.setRemoteSubshash("");
        stateManager.setLocalSubshash("");
        const userState = stateManager.setUserState({ password, accountInfo: result.value.display, isAuthenticated: true });
        res.send(userState);
    } else {
        res.status(401).send('not synced');
    }
}

exports.logout = async (req, res) => {
    stateManager.init();
    res.send('success');
}

exports.fetchUser = async (req, res) => {
    const userState = stateManager.getUserState();
    res.send(userState);
}

exports.deleteAccount = async (req, res) => {
    const password = req.body.password;
    const index = req.body.index;
    const address = req.body.address;
    const socket = socketManager.getIO();
    const liveSocket = socketManager.getLiveSocket();
    if (index == 0) {
        await wasmManager.ccall({ command: `delete ${password},${index}`, flag: 'delete' });
        liveSocket.send(`-${index} ${address}`);
        stateManager.init();
        res.send('logouted');
        return
    }
    const deleteResult = await wasmManager.ccall({ command: `delete ${password},${index}`, flag: 'delete' });
    if (deleteResult.value.result != 0) {
        res.send(deleteResult.value.display);
        return
    }
    const result = await wasmManager.ccall({ command: `list ${password}`, flag: 'login' });
    const localSubshash = result.value.display.subshash;

    const hexResult = await wasmManager.ccall({ command: `logintx ${password}`, flag: 'logintx' });
    liveSocket.send(hexResult.value.display);

    await delay(1000);
    liveSocket.send(`-${index} ${address}`);

    await delay(1000);
    const remoteSubshas = stateManager.getRemoteSubshash();

    if ((localSubshash != "") && (remoteSubshas == localSubshash)) {
        stateManager.setRemoteSubshash("");
        stateManager.setLocalSubshash("");
        const userState = stateManager.setUserState({ password, accountInfo: result.value.display, isAuthenticated: true });
        res.send(userState);
    } else {
        res.status(401).send('not synced');
    }
}

exports.addAccount = async (req, res) => {
    const password = req.body.password;
    const index = req.body.index;
    const socket = socketManager.getIO();
    const liveSocket = socketManager.getLiveSocket();

    const addResult = await wasmManager.ccall({ command: `login ${password},${index},derivation${index}`, flag: 'addaccount' });
    if (addResult.value.result != 0) {
        res.send(addResult.value.display);
        return
    }
    const result = await wasmManager.ccall({ command: `list ${password}`, flag: 'login' });
    const localSubshash = result.value.display.subshash;
    stateManager.setLocalSubshash(localSubshash);

    const hexResult = await wasmManager.ccall({ command: `logintx ${password}`, flag: 'logintx' });
    liveSocket.send(hexResult.value.display);


    await delay(1000);
    console.log(`+${index} ${addResult.value.display}`)
    liveSocket.send(`+${index} ${addResult.value.display}`)

    await delay(1000)
    const remoteSubshas = stateManager.getRemoteSubshash()

    if ((localSubshash != "") && (remoteSubshas == localSubshash)) {
        stateManager.setRemoteSubshash("");
        stateManager.setLocalSubshash("");
        const userState = stateManager.setUserState({ password, accountInfo: result.value.display, isAuthenticated: true });
        res.send(userState);
    } else {
        res.status(401).send('not synced');
    }
}

exports.restoreAccount = async (req, res) => {
    const password = req.body.password;
    const seeds = req.body.seeds;
    const seedType = req.body.seedType;
    let command = null;
    if (seedType == '24words') {
        command = `addseed ${password},${seeds.join(' ')}`;
    } else if (seedType == '55chars') {
        command = `addseed ${password},${seeds}`;
    }
    if (command == null) {
        res.status(401).send('error');
        return;
    }
    const recoverResult = await wasmManager.ccall({ command, flag: 'recover' });
    console.log(recoverResult)
    res.send(recoverResult)
}
