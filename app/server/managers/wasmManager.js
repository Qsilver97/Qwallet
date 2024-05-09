const os = require('os');
const path = require('path');
const createModule = require("../utils/a.out.js");
const socketManager = require("../managers/socketManager");
const { socketSync } = require('../utils/helpers.js');

let wasm;

module.exports = {
    init: () => {
        // Get the home directory path
        const homeDir = os.homedir();
        const keysPath = path.join(homeDir, 'qwallet');
        wasm = createModule();
        wasm.rootDirectory = keysPath;
        wasm.print = function(text) {console.log('From C stdout: ' + text);};
        wasm.printErr = function(text) {console.error('From C stderr: ' + text);};
        return wasm;
    },
    getWasm: () => {
        if (!wasm) {
            throw new Error("Wasm not initialized!");
        }
        return wasm;
    },
    ccall: async (data) => {
        if (!wasm) {
            throw new Error("Wasm not initialized!");
        }
        const io = socketManager.getIO();
        const result = await wasm.ccall(
            "qwallet",
            "string",
            ["string"],
            [data.command]
        );
        io.emit("result", result);
        return { value: JSON.parse(result), flag: data.flag };
    },
    ccallV1request: async (data) => {
        if (!wasm) {
            throw new Error("Wasm not initialized!");
        }
        const io = socketManager.getIO();
        const result = await wasm.ccall(
            "qwallet",
            "string",
            ["string"],
            [data.command]
        );
        io.emit("result", result);
        const parsedResult = JSON.parse(result);
        const v1requestResult = JSON.parse(await wasm.ccall(
            "qwallet",
            "string",
            ["string"],
            'v1request'
        ))
        if(v1requestResult.display && v1requestResult.result == 0) {
            await socketSync(v1requestResult.display);
        }
        return { value: parsedResult, flag: data.flag };
    }
};
