const createModule = require('../utils/a.out.js');

let wasm;

module.exports = {
    init: () => {
        wasm = createModule();
        return wasm;
    },
    getWasm: () => {
        if (!wasm) {
            throw new Error('Wasm not initialized!');
        }
        return wasm;
    },
    ccall: async (data) => {
        if (!wasm) {
            throw new Error('Wasm not initialized!');
        }
        const result = await wasm.ccall('qwallet', 'string', ['string'], [data.command]);
        return { value: JSON.parse(result), flag: data.flag }
    }
};
