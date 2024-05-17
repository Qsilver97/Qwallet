var rn_bridge = require("rn-bridge");
const {
  login,
  create,
  addAccout,
  history,
  fetchUser,
  deleteAccount,
  restoreAccount,
  transfer,
  transferStatus,
  switchNetwork,
  tokens,
  basicInfo,
  buySell,
  myOrders,
  tokenPrices,
  logout,
} = require("./controller");
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

const init = async (keypath) => {
  const keyDirectoryPath = path.join(keypath, "keys");
  await createDirectoryIfNotExists(keyDirectoryPath);
  wasmManager.init(keypath);
  stateManager.init();
};

rn_bridge.channel.on("message", async (msg) => {
  try {
    const message = JSON.parse(msg);
    switch (message.action) {
      case "C2S/INIT": {
        init(message.data.path);
        break;
      }
      case "C2S/login": {
        console.log(message.data);
        const result = await login({ password: message.data?.password });
        console.log("LOGIN RESULT: ", result);
        if (typeof result != "string") {
          rn_bridge.channel.send(
            JSON.stringify({
              action: "S2C/login",
              success: true,
              data: result,
            })
          );
        } else {
          rn_bridge.channel.send(
            JSON.stringify({
              action: "S2C/login",
              success: false,
              error: result,
            })
          );
        }
        break;
      }
      case "C2S/logout": {
        logout();
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

      case "C2S/histories": {
        history(message.data.address);
        break;
      }
      case "C2S/fetch-user": {
        fetchUser();
        break;
      }
      case "C2S/delete-account": {
        deleteAccount(
          message.data.password,
          message.data.index,
          message.data.address
        );
        break;
      }
      case "C2S/restore": {
        restoreAccount(
          message.data.password,
          message.data.seeds,
          message.data.seedType
        );
        break;
      }
      case "C2S/transfer": {
        transfer(
          message.data.toAddress,
          message.data.fromIdx,
          message.data.amount
        );
        break;
      }
      case "C2S/transfer-status": {
        transferStatus();
        break;
      }
      case "C2S/switch-network": {
        switchNetwork();
        break;
      }
      case "C2S/tokens": {
        tokens();
        break;
      }
      case "C2S/basic-info": {
        basicInfo();
        break;
      }
      case "C2S/buy-sell": {
        buySell(message.data);
        break;
      }
      case "C2S/my-orders": {
        myOrders();
        break;
      }
      case "C2S/token-prices": {
        tokenPrices();
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
