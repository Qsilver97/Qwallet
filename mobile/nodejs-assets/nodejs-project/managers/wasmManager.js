const createModule = require("../utils/a.out.js");
// const socketManager = require("../managers/socketManager");

let wasm;

module.exports = {
  init: (rootDirectory) => {
    let Module = {
      onRuntimeInitialized: function () {
        console.log("WebAssembly module initialized.");
      },
    };

    // Check if a custom root directory is provided and set it
    if (rootDirectory) {
      Module["rootDirectory"] = rootDirectory;
    }

    wasm = createModule(Module); // Pass the Module object to createModule
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
    // const io = socketManager.getIO();
    const result = await wasm.ccall(
      "qwallet",
      "string",
      ["string"],
      [data.command]
    );
    // io.emit('result', result);
    return { value: JSON.parse(result), flag: data.flag };
  },
  ccallV1request: async (data) => {
    try {
      if (!wasm) {
        throw new Error("Wasm not initialized!");
      }
      // const io = socketManager.getIO();
      console.log(data.command, "command");
      const result = await wasm.ccall(
        "qwallet",
        "string",
        ["string"],
        [data.command]
      );
      // io.emit("result", result);
      const parsedResult = JSON.parse(result);
      console.log(parsedResult, "parsedResult");
      const v1requestResult = JSON.parse(
        await wasm.ccall("qwallet", "string", ["string"], ["v1request"])
      );
      console.log(v1requestResult, "v1request");
      if (v1requestResult.display && v1requestResult.result == 0) {
        await socketSync(v1requestResult.display);
      }
      return { value: parsedResult, flag: data.flag };
    } catch (error) {
      console.log(error);
    }
  },
};
