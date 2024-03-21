const wasmManager = require('../managers/wasmManager')

exports.ccall = async (req, res) => {
    const result = await wasmManager.ccall(req.body)
    res.send(result)
}

exports.checkavail = async (req, res) => {
    const resultFor22words = await wasmManager.ccall(req.body)
    const resultFor55chars = await wasmManager.ccall({...req.body, command: req.body.command.replace('checkavail ', 'checkavail Q')})
    res.send(resultFor22words.value.result == 0 && resultFor55chars.value.result == 0)
}
