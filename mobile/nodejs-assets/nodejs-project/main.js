var rn_bridge = require("rn-bridge");
const { login, create, addAccout } = require("./controller");
const wasmManager = require("./managers/wasmManager");
const stateManager = require("./managers/stateManager");
const path = require("path");
const fs = require("fs").promises;

const createDirectoryIfNotExists = async (directoryPath) => {
  try {
    await fs.mkdir(directoryPath, { recursive: true });
    console.log(directoryPath);
  } catch (error) {
    console.log(`Error creating directory ${directoryPath}:${error}`);
  }
};

const init = async () => {
  const keyDirectoryPath = path.join(
    "/sdcard/Android/data/com.anonymous.qwallet/files",
    "keys"
  );
  await createDirectoryIfNotExists(keyDirectoryPath);
  wasmManager.init("/sdcard/Android/data/com.anonymous.qwallet/files");
  stateManager.init();
  // await wasmManager.ccall({command:`keysdir ${__dirname}`, flag: "keysdir"})
};

init();

rn_bridge.channel.on("message", async (msg) => {
  try {
    const message = JSON.parse(msg);
    switch (message.action) {
      case "C2S/login": {
        console.log(message.data);
        const success = await login({ password: message.data?.password });
        console.log(success);
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
        break;
      }
      case "C2S/create": {
        console.log(message.data?.command);
        const result = await create({ command: message.data?.command });
        console.log(result);
        rn_bridge.channel.send(
          JSON.stringify({
            action: "S2C/create",
            data: result,
          })
        );
        break;
      }


      // Socket
      case "C2S/add-account": {
        console.log(message.data);
        const result = await addAccout({
          password: message.data?.password,
          index: message.data?.index,
        });
        console.log(result);
        break;
      }
      case "C2S/passwordAvail": {
        const resultFor24words = await wasmManager.ccall(message.data);
        const resultFor55chars = await wasmManager.ccall({
          ...message.data,
          command: message.data.command.replace("checkavail ", "checkavail Q"),
        });
        rn_bridge.channel.send(
          JSON.stringify({
            action: "S2C/passwordAvail",
            data:
              resultFor24words.value.result == 0 &&
              resultFor55chars.value.result == 0,
          })
        );
      }
      case "C2S/send": {
        const liveSocket = socketManager.getLiveSocket();
        console.log(`Socket sent: ${message.data}`);
        liveSocket.send(message.data);
      }
      case "C2S/broadcast": {
        rn_bridge.channel.send(
          JSON.stringify({
            action: "S2C/broadcast",
            data: message.data,
          })
        );
      }
      default:
        break;
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
