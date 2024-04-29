const createModule = require("../utils/a.out.js");
const socketManager = require("../managers/socketManager");

let wasm;

module.exports = {
    init: () => {
        wasm = createModule();
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
