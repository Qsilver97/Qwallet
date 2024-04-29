const os = require('os');
const path = require('path');
const createModule = require("../utils/a.out.js");
const socketManager = require("../managers/socketManager");

let wasm;

module.exports = {
    init: () => {
        // Get the home directory path
        const homeDir = os.homedir();
        const keysPath = path.join(homeDir, 'qwallet');
        console.log(keysPath, 'aaa')
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
};
