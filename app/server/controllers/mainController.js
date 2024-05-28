const path = require('path');
const wasmManager = require('../managers/wasmManager');
const stateManager = require('../managers/stateManager');
const socketManager = require('../managers/socketManager');
const { delay, socketSync } = require('../utils/helpers');
const liveSocketController = require('./liveSocketController');

exports.ccall = async (req, res) => {
    const result = await wasmManager.ccall(req.body);
    res.send(result);
}

exports.ccallV1request = async (req, res) => {
    const result = await wasmManager.ccallV1request(req.body);
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
    const { password, socketUrl } = req.body;
    // let liveSocket = socketManager.initLiveSocket(socketUrl);
    liveSocketController(socketUrl)
    await delay(2000);
    let realPassword;
    stateManager.init();
    const resultFor24words = await wasmManager.ccall({ command: `checkavail ${password}`, flag: 'login' });
    const resultFor55chars = await wasmManager.ccall({ command: `checkavail Q${password}`, flag: 'login' });
    const passwordExistCode = -24;
    if (resultFor24words.value.result != passwordExistCode && resultFor55chars.value.result != passwordExistCode) {
        res.status(401).send('Password does not exist.');
        return
    } else if (resultFor24words.value.result == passwordExistCode) {
        realPassword = password;
    } else if (resultFor55chars.value.result == passwordExistCode) {
        realPassword = `Q${password}`;
    }

    let listResult;
    let addressResp;
    async function checkSubshash() {
        listResult = await wasmManager.ccall({ command: `list ${realPassword}`, flag: 'login' });
        const socket = socketManager.getIO();
        const localSubshash = listResult.value.display.subshash;
        stateManager.setLocalSubshash(localSubshash);

        const addresses = listResult.value.display.addresses;
        stateManager.updateUserState({ currentAddress: addresses[0] });
        addressResp = await socketSync(addresses[0]);
        if (!addressResp) {
            return 'Socket server error';
        };
        const hexResult = await wasmManager.ccall({ command: `logintx ${realPassword}`, flag: 'logintx' });
        const hexLive = await socketSync(hexResult.value.display);
        if (!hexLive) {
            return 'Socket server error';
        };
        const remoteSubshas = stateManager.getRemoteSubshash();
        return (localSubshash != "") && (remoteSubshas == localSubshash);
    }
    const networkResp = await socketSync('network');

    const matchStatus = await checkSubshash();

    if (matchStatus) {
        stateManager.setRemoteSubshash("");
        stateManager.setLocalSubshash("");
        const userState = stateManager.setUserState({ password: realPassword, accountInfo: listResult.value.display, isAuthenticated: true });
        res.send({ userState, networkResp });
        return;
    } else if (matchStatus == 'Socket server error') {
        res.status(401).send('Socket server error');
        return;
    } else {
        const clearResult = await socketSync('clearderived');
        if (!clearResult) {
            res.status('401').send('Socket server error');
            return;
        }
        listResult = await wasmManager.ccall({ command: `list ${realPassword}`, flag: 'login' });
        const addresses = listResult.value.display.addresses;
        for (let idx = 1; idx < addresses.length; idx++) {
            if (addresses[idx] && addresses[idx] != "") {
                const plusResult = await socketSync(`+${idx} ${addresses[idx]}`);
                if (!plusResult) {
                    res.status('401').send('Socket server error');
                    return;
                }
            }
        }
        // const matchStatus = await checkSubshash()
        if ((stateManager.getLocalSubshash() != "") && (stateManager.getRemoteSubshash() == stateManager.getLocalSubshash())) {
            stateManager.setRemoteSubshash("");
            stateManager.setLocalSubshash("");
            const userState = stateManager.setUserState({ password: realPassword, accountInfo: listResult.value.display, isAuthenticated: true });
            res.send({ userState, networkResp });
        } else {
            res.status(401).send('not synced');
        }
    }
}

exports.logout = async (req, res) => {
    const userState = stateManager.init();
    res.send(userState);
}

exports.fetchUser = async (req, res) => {
    const userState = stateManager.getUserState();
    // res.send(userState);

    let liveSocket = socketManager.getLiveSocket();
    if (!liveSocket) {
        res.status(401).send('Socket server error.');
        return
    }
    let addressInfo;
    if (userState.currentAddress) {
        addressInfo = await socketSync(userState.currentAddress);
    } else {
        addressInfo = await socketSync(userState.accountInfo.addresses[0]);
    }
    const balances = await socketSync('balances');
    const marketcap = await socketSync('marketcap');
    const tokens = await socketSync('tokenlist');
    const tokenPrices = await socketSync('tokenprices');
    const networkResp = await socketSync('network');
    // const richlist = {};
    // const qurichlist = await socketSync('richlist');
    // richlist[qurichlist.name] = qurichlist.richlist;
    // try {
    //     for (let idx = 0; idx < tokens.tokens.length; idx++) {
    //         const richlistResult = await socketSync(`richlist.${tokens.tokens[idx]}`)
    //         richlist[richlistResult.name] = richlistResult.richlist;
    //     }
    // } catch (error) {

    // }
    const updatedUserState = { ...userState, ...{ balances: balances.balances, marketcap, tokens: tokens.tokens, tokenPrices: tokenPrices, networkResp } };
    stateManager.setUserState(updatedUserState);
    res.send(updatedUserState);
}

exports.updatedUserState = async (req, res) => {
    stateManager.updateUserState(req.body);
    if (req.body.currentAddress) {
        await socketSync(req.body.currentAddress);
    }
    res.status(200).send('success');
}

exports.deleteAccount = async (req, res) => {
    const { password, index, address } = req.body;
    const socket = socketManager.getIO();
    if (index == 0) {
        await wasmManager.ccall({ command: `delete ${password},${index}`, flag: 'delete' });
        const minusResult = await socketSync(`-${index} ${address}`);
        if (!minusResult) {
            res.status(401).send('Socket server error');
            return;
        }
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
    const hexSocketResult = await socketSync(hexResult.value.display);
    if (!hexSocketResult) {
        res.status(401).send('Socket server error');
        return;
    }
    const minusResult = await socketSync(`-${index} ${address}`);
    if (!minusResult) {
        res.status(401).send('Socket server error');
        return;
    }

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
    const { password, index } = req.body;
    const socket = socketManager.getIO();

    const addResult = await wasmManager.ccall({ command: `login ${password},${index},derivation${index}`, flag: 'addaccount' });
    if (addResult.value.result != 0) {
        res.send(addResult.value.display);
        return
    }
    const result = await wasmManager.ccall({ command: `list ${password}`, flag: 'login' });
    const localSubshash = result.value.display.subshash;
    stateManager.setLocalSubshash(localSubshash);

    const hexResult = await wasmManager.ccall({ command: `logintx ${password}`, flag: 'logintx' });
    const hexSocketResult = await socketSync(hexResult.value.display);
    if (!hexSocketResult) {
        res.status(401).send('Socket server error');
        return;
    }

    const plusResult = await socketSync(`+${index} ${addResult.value.display}`)
    if (!plusResult) {
        res.status(401).send('Socket server error');
        return;
    }
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
    const { password, seeds, seedType } = req.body;
    let command = null;
    if (seedType == '24words') {
        command = `addseed ${password},${seeds.join(' ')}`;
    } else if (seedType == '55chars') {
        command = `addseed Q${password},${seeds}`;
    }
    if (command == null) {
        res.status(401).send('error');
        return;
    }
    const recoverResult = await wasmManager.ccall({ command, flag: 'recover' });
    res.send(recoverResult)
}

exports.transfer = async (req, res) => {
    const { toAddress, fromIdx, amount, tick, tokenName } = req.body;
    let command;
    if (tokenName == 'QU') {
        command = `send ${stateManager.getUserState().password},${fromIdx},${tick},${toAddress},${amount}`;
    } else {
        command = `tokensend ${stateManager.getUserState().password},${fromIdx},${tick},${toAddress},${amount},${tokenName}`;
    }
    const sendResult = await wasmManager.ccall({ command, flag: 'transfer' });
    const v1requestResult = await wasmManager.ccall({ command: 'v1request', flag: 'v1request' });
    if (v1requestResult.value.result == 0 && v1requestResult.value.display) {
        const sendResult = await socketSync(v1requestResult.value.display);
        if (!sendResult) {
            res.status(401).send('failed');
            return;
        }
        res.send('pending')
        return;
    } else {
        res.status(401).send('failed');
        return;
    }
}

exports.socket = async (req, res) => {
    const { command, socketUrl } = req.body;
    let liveSocket = socketManager.getLiveSocket();
    if (!liveSocket) {
        liveSocket = socketManager.initLiveSocket(socketUrl);
        liveSocketController(liveSocket)
        await delay(1500);
    }
    console.log(`Socket sent: ${command}`);
    liveSocket.send(command);
    res.send('success');
}

exports.balances = async (req, res) => {
    let liveSocket = socketManager.getLiveSocket();
    if (!liveSocket) {
        res.status(401).send('Socket server error.');
        return
    }
    const balanceResult = await socketSync('balances');
    if (!balanceResult) {
        res.status(401).send('failed');
        return;
    }
    res.send(balanceResult);
}

exports.txStatus = async (req, res) => {
    const result = await wasmManager.ccall({ command: 'status 1', flag: 'transferStatus' })
    setTimeout(() => {
        wasmManager.ccall({ command: 'v1request', flag: 'transferStatus' });
    }, 1000)
    res.send(result);
}

exports.history = async (req, res) => {
    const { address } = req.body;
    const result = await socketSync(`history ${address}`);
    res.send(result);
}

exports.switchNetwork = async (req, res) => {
    res.send('success');
}

exports.tokens = async (req, res) => {
    const result = await socketSync('tokenlist');
    res.send(result);
}
exports.basicInfo = async (req, res) => {

    let liveSocket = socketManager.getLiveSocket();
    if (!liveSocket) {
        res.status(401).send('Socket server error.');
        return
    }
    const balances = await socketSync('balances');
    const marketcap = await socketSync('marketcap');
    const tokens = await socketSync('tokenlist');
    // const richlist = {};
    // const qurichlist = await socketSync('richlist');
    // richlist[qurichlist.name] = qurichlist.richlist;
    // for (let idx = 0; idx < tokens.tokens.length; idx++) {
    //     const richlistResult = await socketSync(`richlist.${tokens.tokens[idx]}`)
    //     richlist[richlistResult.name] = richlistResult.richlist;
    // }

    res.send({ balances: balances.balances, marketcap, tokens: tokens.tokens });
}

exports.checkAuthenticated = async (req, res) => {
    const isAuthenticated = stateManager.getUserState().isAuthenticated;
    if (isAuthenticated) {
        res.status(200).send(true);
    } else {
        res.status(402).send(false);
    }
}

exports.fetchTradingPageInfo = async (req, res) => {
    const { token } = req.body;
    try {
        const orders = await socketSync(`orders ${token}`);
        res.status(200).send(orders);
        return;
    } catch (error) {
        res.status(400).send('failed');
        return;
    }
}

exports.sendTx = async (req, res) => {
    const { flag, password, index, tick, currentToken, amount, price, toAddress } = req.body;
    const socket = socketManager.getIO();
    let command = "";
    if (flag == 'send') {
        command = `send ${password},${index},${tick},${toAddress},${amount}`;
    } else {
        command = `${flag} ${password},${index},${tick},${currentToken},${amount},${price}`;
    }
    console.log({ command: command, flag });
    const result = await wasmManager.ccallV1request({ command: command, flag });
    const statusResult = await wasmManager.ccall({ command: 'status 1', flag: 'transferStatus' })
    let txid = statusResult.value.display.split(' ')[1];
    let expectedTick = statusResult.value.display.split(' ')[5];
    console.log(statusResult, 'aaaaaaaaaaaasssssssss')
    if (statusResult.value.result != 1) {
        res.status(400).send('error');
        return;
    }
    let txStatusInterval;
    const handleTx = async () => {
        const result = await wasmManager.ccall({ command: 'status 1', flag: 'transferStatus' })
        socket.emit('txWasmStatus', result.value);

        if (result.value.result == 1) {
            if (txid.length == 60) {
                setTimeout(async () => {
                    const txStatus = await socketSync(`${txid} ${expectedTick}`);
                    socket.emit('txSocketStatus', { txStatus, txid, tick: expectedTick, flag, currentToken, amount, price, toAddress });
                    if (txStatus.status) {
                        clearInterval(txStatusInterval);
                    }
                }, 1333);
            }
        }

        if (result.value.display == 'no command pending') {
            clearInterval(txStatusInterval);
        }
        setTimeout(() => {
            wasmManager.ccall({ command: 'v1request', flag: 'transferStatus' });
        }, 660);
    }

    const handleTxInterval = async () => {
        const tick = stateManager.getTick();
        if (tick && tick >= parseInt(expectedTick)) {
            const networkResp = await socketSync('network');
            if (networkResp.txdata > parseInt(expectedTick) || networkResp.latest >= parseInt(expectedTick) + 5) {
                clearInterval(txStatusInterval);
            }
            handleTx();
        }
    }
    txStatusInterval = setInterval(handleTxInterval, 2000);
    handleTx();
    res.status(200).send(flag);

}

exports.getPrice = async (req, res) => {
    const { token } = req.body;
    try {
        let command = 'prices';
        if (token != 'QU') {
            command = `${command}.${token}`
        }
        console.log(command, '11111111111111111111111111')
        const prices = await socketSync(command)
        res.status(200).send(prices);
        return;
    } catch (error) {
        res.status(400).send(error);
        return
    }

}

exports.callSocket = async (req, res) => {
    const { command } = req.body;
    const resp = await socketSync(command);
    res.status(200).send(resp);
}
