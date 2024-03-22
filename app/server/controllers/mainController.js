const wasmManager = require('../managers/wasmManager');
const stateManager = require('../managers/stateManager');
const socketManager = require('../managers/socketManager');
const { delay } = require('../utils/helpers');

exports.ccall = async (req, res) => {
    const result = await wasmManager.ccall(req.body);
    res.send(result);
}

exports.checkavail = async (req, res) => {
    const resultFor24words = await wasmManager.ccall(req.body);
    const resultFor55chars = await wasmManager.ccall({ ...req.body, command: req.body.command.replace('checkavail ', 'checkavail Q') });
    res.send(resultFor24words.value.result == 0 && resultFor55chars.value.result == 0);
}

exports.login = async (req, res) => {
    let password;
    const resultFor24words = await wasmManager.ccall({ command: `checkavail ${req.body.password}`, flag: 'login' });
    const resultFor55chars = await wasmManager.ccall({ command: `checkavail Q${req.body.password}`, flag: 'login' });
    console.log(req.body.password, resultFor24words, resultFor55chars);
    if (resultFor24words.value.result != -33 && resultFor55chars.value.result != -33) {
        res.send('Password does not exist.');
        return
    } else if (resultFor24words.value.result == -33) {
        password = req.body.password;
    } else if (resultFor55chars.value.result == -33) {
        password = `Q${req.body.password}`;
    }
    const result = await wasmManager.ccall({ command: `list ${password}`, flag: 'login' });
    const socket = socketManager.getIO();
    const liveSocket = socketManager.getLiveSocket();
    console.log(result.value.display)
    const localSubshash = result.value.display.subshash;
    stateManager.setLocalSubshash(localSubshash);

    liveSocket.send(result.value.display.addresses[0]);
    const hexResult = await wasmManager.ccall({ command: `logintx ${password}`, flag: 'logintx' });
    liveSocket.send(hexResult.value.display);

    await delay(500);
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
