var rn_bridge = require("rn-bridge");
const { login, create } = require("./controller");
const wasmManager = require("./managers/wasmManager");
const stateManager = require("./managers/stateManager");
const path = require("path");
const fs = require("fs").promises;

const createDirectoryIfNotExists = async (directoryPath) => {
  try {
    await fs.mkdir(directoryPath, { recursive: true });
  } catch (error) {
    console.log(`Error creating directory ${directoryPath}:${error}`);
  }
};

wasmManager.init();
stateManager.init();
// const init = async (dir) => {
//   const result = await wasmManager.ccall({command:`keysdir ${dir}`, flag: "keysdir"})
//   console.log(dir)
//   console.log("Create_Directory_RESULT\n", result)
//   const keyDirectoryPath = path.join(dir, "/qwallet/keys");
//   await createDirectoryIfNotExists(keyDirectoryPath);
// };

// init();

rn_bridge.channel.on("message", async (msg) => {
  try {
    const message = JSON.parse(msg);
    if(message.action === "SET_FILES_DIR"){
      const dir = message.data?.path;
      console.log(dir)
      const result = await wasmManager.ccall({command:`keysdir ${dir}`, flag: "keysdir"})
      console.log("Create_Directory_RESULT\n", result)
      const keyDirectoryPath = path.join(dir, "/qwallet/keys");
      await createDirectoryIfNotExists(keyDirectoryPath);
    }

    if (message.action === "C2S/login") {
      const success = await login({ password: message.data?.password });
      if (typeof success != "string") {
        rn_bridge.channel.send(
          JSON.stringify({
            action: "S2C/login",
            success: true,
            data: success,
          })
        );
      } else {
        rn_bridge.channel.send(
          JSON.stringify({
            action: "S2C/login",
            success: false,
            error: "Invalid password",
          })
        );
      }
    } else if (message.action === "C2S/create") {
      console.log(message.data?.command);
      const result = await create({ command: message.data?.command });
      console.log(result);
      rn_bridge.channel.send(
        JSON.stringify({
          action: "S2C/create",
          data: result,
        })
      );
    }
  } catch (err) {
    rn_bridge.channel.send(
      JSON.stringify({
        action: "S2C/error",
        error: err.message,
      })
    );
  }
});

rn_bridge.channel.send("Node was initialized.");
