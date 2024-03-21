const wasmManager = require('../managers/wasmManager');
const stateManager = require('../managers/stateManager');

exports.ccall = async (req, res) => {
    const result = await wasmManager.ccall(req.body);
    res.send(result);
}

exports.checkavail = async (req, res) => {
    const resultFor22words = await wasmManager.ccall(req.body);
    const resultFor55chars = await wasmManager.ccall({ ...req.body, command: req.body.command.replace('checkavail ', 'checkavail Q') });
    res.send(resultFor22words.value.result == 0 && resultFor55chars.value.result == 0);
}

exports.login = async (req, res) => {
    let password;
    const resultFor22words = await wasmManager.ccall({ command: `checkavail ${req.body.password}`, flag: 'login' });
    const resultFor55chars = await wasmManager.ccall({ command: `checkavail Q${req.body.password}`, flag: 'login' });
    console.log(req.body.password, resultFor22words, resultFor55chars);
    if (resultFor22words.value.result != -33 && resultFor55chars.value.result != -33) {
        res.send('Password does not exist.');
        return
    } else if (resultFor22words.value.result == -33) {
        password = req.body.password;
    } else if (resultFor55chars.value.result == -33) {
        password = `Q${req.body.password}`;
    }
    const result = await wasmManager.ccall({ command: `list ${password}`, flag: 'login' });
    const userState = stateManager.setUserState({ password, accountInfo: result.value.display, isAuthenticated: true });
    res.send(userState);
}

exports.logout = async (req, res) => {
    stateManager.init();
    res.send('success');
}

exports.fetchUser = async (req, res) => {
    const userState = stateManager.getUserState();
    res.send(userState);
}
