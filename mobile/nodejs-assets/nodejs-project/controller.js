const wasmManager = require("./managers/wasmManager");
const stateManager = require("./managers/stateManager");
const rn_bridge = require("rn-bridge");
const socketManager = require("./managers/socketManager");
const { delay, socketSync } = require("./utils/helpers");
const liveSocketController = require("./liveSocketController");
const bridge_send = (responseType, result) => {
  rn_bridge.channel.send(
    JSON.stringify({
      action: responseType,
      data: result,
    })
  );
};

const base_controller = (
  socketCommand,
  responseType,
  preAction = () => {},
  afterAction = () => {}
) => {
  return async () => {
    try {
      preAction();
      const result = await socketSync(socketCommand);
      afterAction();
      bridge_send(responseType, result);
    } catch (error) {
      bridge_send("S2C/error", error);
    }
  };
};

exports.login = async ({ password }) => {
  try {
    let liveSocket = socketManager.initLiveSocket();
    liveSocketController(liveSocket);
    await delay(1000);
    let realPassword;
    stateManager.init();
    const resultFor24words = await wasmManager.ccall({
      command: `checkavail ${password}`,
      flag: "login",
    });
    const resultFor55chars = await wasmManager.ccall({
      command: `checkavail Q${password}`,
      flag: "login",
    });
    const passwordExistCode = -24;
    if (
      resultFor24words.value.result != passwordExistCode &&
      resultFor55chars.value.result != passwordExistCode
    ) {
      return "Password does not exist.";
    } else if (resultFor24words.value.result == passwordExistCode) {
      realPassword = password;
    } else if (resultFor55chars.value.result == passwordExistCode) {
      realPassword = `Q${password}`;
    }

    let listResult;

    async function checkSubshash() {
      listResult = await wasmManager.ccall({
        command: `list ${realPassword}`,
        flag: "login",
      });
      // const socket = socketManager.getIO();
      const localSubshash = listResult.value.display.subshash;
      stateManager.setLocalSubshash(localSubshash);

      const addresses = listResult.value.display.addresses;
      const addressesResp = await socketSync(addresses[0]);
      if (!addressesResp) {
        return "Socket server error";
      }
      const hexResult = await wasmManager.ccall({
        command: `logintx ${realPassword}`,
        flag: "logintx",
      });
      const hexLive = await socketSync(hexResult.value.display);
      if (!hexLive) {
        return "Socket server error";
      }
      const remoteSubshas = stateManager.getRemoteSubshash();
      return localSubshash != "" && remoteSubshas == localSubshash;
    }

    const matchStatus = await checkSubshash();

    if (matchStatus) {
      stateManager.setRemoteSubshash("");
      stateManager.setLocalSubshash("");
      const userState = stateManager.setUserState({
        password: realPassword,
        accountInfo: listResult.value.display,
        isAuthenticated: true,
      });
      return userState;
    } else if (matchStatus == "Socket server error") {
      return "Socket server error";
    } else {
      const clearResult = await socketSync("clearderived");
      if (!clearResult) {
        return "Socket server error";
      }
      listResult = await wasmManager.ccall({
        command: `list ${realPassword}`,
        flag: "login",
      });
      const addresses = listResult.value.display.addresses;
      for (let idx = 1; idx < addresses.length; idx++) {
        if (addresses[idx] && addresses[idx] != "") {
          const plusResult = await socketSync(`+${idx} ${addresses[idx]}`);
          if (!plusResult) {
            return "Socket server error";
          }
        }
      }
      if (
        stateManager.getLocalSubshash() != "" &&
        stateManager.getRemoteSubshash() == stateManager.getLocalSubshash()
      ) {
        stateManager.setRemoteSubshash("");
        stateManager.setLocalSubshash("");
        const userState = stateManager.setUserState({
          password: realPassword,
          accountInfo: listResult.value.display,
          isAuthenticated: true,
        });
        return userState;
      } else {
        return "Socket Not Synced!";
      }
    }
  } catch (err) {
    return err.message;
  }
};

exports.create = async ({ command }) => {
  const result = await wasmManager.ccall({
    command,
    flag: "create",
  });
  return result;
};

exports.addAccout = async ({ password, index }) => {
  // const socket = socketManager.getIO();

  const addResult = await wasmManager.ccall({
    command: `login ${password},${index},derivation${index}`,
    flag: "addaccount",
  });
  if (addResult.value.result != 0) {
    rn_bridge.channel.send(
      JSON.stringify({
        action: "S2C/add-account",
        data: addResult.value.display,
      })
    );
    return;
  }
  const result = await wasmManager.ccall({
    command: `list ${password}`,
    flag: "login",
  });
  const localSubshash = result.value.display.subshash;
  stateManager.setLocalSubshash(localSubshash);

  const hexResult = await wasmManager.ccall({
    command: `logintx ${password}`,
    flag: "logintx",
  });
  const hexSocketResult = await socketSync(hexResult.value.display);
  if (!hexSocketResult) {
    bridge_send("S2C/add-account", "S2C/add-account");
    return;
  }

  const plusResult = await socketSync(`+${index} ${addResult.value.display}`);
  if (!plusResult) {
    bridge_send("S2C/add-account", "S2C/add-account");
    return;
  }
  const remoteSubshas = stateManager.getRemoteSubshash();

  if (localSubshash != "" && remoteSubshas == localSubshash) {
    stateManager.setRemoteSubshash("");
    stateManager.setLocalSubshash("");
    const userState = stateManager.setUserState({
      password,
      accountInfo: result.value.display,
      isAuthenticated: true,
    });
    bridge_send("S2C/add-account", userState);
  } else {
    bridge_send("S2C/add-account", "not-synced");
  }
};

exports.logout = async () => {
  stateManager.init();
  bridge_send("S2C/logout", {});
};

exports.fetchUser = async () => {
  const userState = stateManager.getUserState();
  bridge_send("S2C/fetchuser", userState);
};

exports.history = async (address) => {
  const result = await socketSync(`history ${address}`);
  bridge_send("S2C/history", result);
};

exports.deleteAccount = async (password, index, address) => {
  // const socket = socketManager.getIO();
  if (index == 0) {
    await wasmManager.ccall({
      command: `delete ${password},${index}`,
      flag: "delete",
    });
    const minusResult = await socketSync(`-${index} ${address}`);
    if (!minusResult) {
      bridge_send("S2C/error", "Socket Server Error");
      return;
    }
    stateManager.init();
    bridge_send("S2C/delete-account", result);
    return;
  }
  const deleteResult = await wasmManager.ccall({
    command: `delete ${password},${index}`,
    flag: "delete",
  });
  if (deleteResult.value.result != 0) {
    bridge_send("S2C/history", deleteResult);
    return;
  }
  const result = await wasmManager.ccall({
    command: `list ${password}`,
    flag: "login",
  });
  const localSubshash = result.value.display.subshash;

  const hexResult = await wasmManager.ccall({
    command: `logintx ${password}`,
    flag: "logintx",
  });
  const hexSocketResult = await socketSync(hexResult.value.display);
  if (!hexSocketResult) {
    bridge_send("S2C/error", "Socket server error");
    return;
  }
  const minusResult = await socketSync(`-${index} ${address}`);
  if (!minusResult) {
    bridge_send("S2C/error", "Socket server error");
    return;
  }

  await delay(1000);
  const remoteSubshas = stateManager.getRemoteSubshash();

  if (localSubshash != "" && remoteSubshas == localSubshash) {
    stateManager.setRemoteSubshash("");
    stateManager.setLocalSubshash("");
    const userState = stateManager.setUserState({
      password,
      accountInfo: result.value.display,
      isAuthenticated: true,
    });
    bridge_send("S2C/delete-account", userState);
  } else {
    bridge_send("S2C/error", "Socket Not Synced!");
  }
};

exports.restoreAccount = async (password, seeds, seedType) => {
  let command = null;
  if (seedType == "24words") {
    command = `addseed ${password},${seeds.join(" ")}`;
  } else if (seedType == "55chars") {
    command = `addseed ${password},${seeds}`;
  }
  if (command == null) {
    bridge_send("S2C/restore", "Error occured in restoring Account!");
    return;
  }
  const recoverResult = await wasmManager.ccall({ command, flag: "recover" });
  bridge_send("S2C/restore", recoverResult);
};

exports.transfer = async (toAddress, fromIdx, amount, tick) => {
  const command = `send ${
    stateManager.getUserState().password
  },${fromIdx},${tick},${toAddress},${amount}`;
  const sendResult = await wasmManager.ccall({ command, flag: "transfer" });
  const v1requestResult = await wasmManager.ccall({
    command: "v1request",
    flag: "v1request",
  });
  if (v1requestResult.value.result == 0 && v1requestResult.value.display) {
    const sendResult = await socketSync(v1requestResult.value.display);
    if (!sendResult) {
      bridge_send("S2C/transfer", "Transfer Failed!");
      return;
    }
    bridge_send("S2C/transfer", "Pending...");
    return;
  } else {
    bridge_send("S2C/transfer", "Transfer Failed by something...");
    return;
  }
};

exports.socket = async (command, socketUrl) => {
  let liveSocket = socketManager.getLiveSocket();
  if (!liveSocket) {
    liveSocket = socketManager.initLiveSocket(socketUrl);
    liveSocketController(liveSocket);
    await delay(500);
  }
  console.log(`Socket sent: ${command}`);
  liveSocket.send(command);
  bridge_send("S2C/socket", {});
};

exports.balances = async () => {
  let liveSocket = socketManager.getLiveSocket();
  if (!liveSocket) {
    bridge_send("S2C/balances", "Socket server error!");
    return;
  }
  const balanceResult = await socketSync("balances");
  if (!balanceResult) {
    bridge_send("S2C/balances", "Failed!");
    return;
  }
  bridge_send("S2C/balances", balanceResult);
};

exports.transferStatus = async () => {
  const result = await wasmManager.ccall({
    command: "status 1",
    flag: "transferStatus",
  });
  setTimeout(() => {
    wasmManager.ccall({ command: "v1request", flag: "transferStatus" });
  }, 1000);
  bridge_send("S2C/transfer-status", result);
};

exports.switchNetwork = async () => {
  bridge_send("S2C/switchnetwork", {});
};

exports.tokens = base_controller("tokenlist", "S2C/tokens");

exports.basicInfo = async () => {
  let liveSocket = socketManager.getLiveSocket();
  if (!liveSocket) {
    rn_bridge.channel.send(
      JSON.stringify({
        action: "S2C/error",
        data: "Socket Server Error",
      })
    );
    return;
  }
  const balances = await socketSync("balances");
  const marketcap = await socketSync("marketcap");
  const tokens = await socketSync("tokenlist");
  const tokenprices = await socketSync("tokenprices");
  const richlist = {};
  const qurichlist = await socketSync("richlist");
  richlist[qurichlist.name] = qurichlist.richlist;
  for (let idx = 0; idx < tokens.tokens.length; idx++) {
    const richlistResult = await socketSync(`richlist.${tokens.tokens[idx]}`);
    richlist[richlistResult.name] = richlistResult.richlist;
  }
  bridge_send("S2C/basic-info", {
    balances: balances.balances,
    marketcap,
    tokens: tokens.tokens,
    tokenprices,
    // richlist,
  });
};

exports.fetchOrders = async (token) => {
  try {
    const orders = await socketSync(`orders ${token}`);
    bridge_send("S2C/fetch-orders", orders);
  } catch (error) {
    bridge_send("S2C/error", error);
  }
};

exports.buySell = async ({
  flag,
  password,
  index,
  tick,
  currentToken,
  amount,
  price,
}) => {
  console.log({
    command: `${flag} ${password},${index},${tick},${currentToken},${amount},${price}`,
    flag,
  });
  const res = await wasmManager.ccallV1request({
    command: `${flag} ${password},${index},${tick},${currentToken},${amount},${price}`,
    flag,
  });
  bridge_send("S2C/buy-sell", res);
};

exports.myOrders = base_controller("myorders", "S2C/my-orders");

exports.tokenPrices = base_controller("tokenprices", "S2C/token-prices");
