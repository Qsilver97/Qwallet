const wasmManager = require('../managers/wasmManager')

exports.ccall = async (req, res) => {
    const result = await wasmManager.ccall(req.body)
    res.send(result)
}
