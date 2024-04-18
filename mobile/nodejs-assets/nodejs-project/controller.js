const wasmManager = require("./managers/wasmManager");
const stateManager = require("./managers/stateManager");
const rn_bridge = require("rn-bridge");
const socketManager = require("./managers/socketManager");
const { delay, socketSync } = require("./utils/helpers");
const liveSocketController = require("./liveSocketController");

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
        return "not synced";
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
    rn_bridge.channel.send(
      JSON.stringify({
        action: "S2C/add-account",
        data: "Socket server error",
      })
    );
    return;
  }

  const plusResult = await socketSync(`+${index} ${addResult.value.display}`);
  if (!plusResult) {
    rn_bridge.channel.send(
      JSON.stringify({
        action: "S2C/err",
        data: "Socket server error",
      })
    );
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
    rn_bridge.channel.send(
      JSON.stringify({
        action: "S2C/add-account",
        data: userState,
      })
    );
  } else {
    rn_bridge.channel.send(
      JSON.stringify({
        action: "S2C/add-account",
        data: "not-synced",
      })
    );
  }
};

exports.logout = async () => {
  stateManager.init();
  rn_bridge.channel.send(
    JSON.stringify({
      action: "S2C/logout",
      data: "success",
    })
  );
};

exports.fetchUser = async () => {
  const userState = stateManager.getUserState();
  rn_bridge.channel.send(
    JSON.stringify({
      action: "S2C/fetchuser",
      data: userState,
    })
  );
};

exports.history = async (address) => {
  const result = await socketSync(`history ${address}`);
  rn_bridge.channel.send(
    JSON.stringify({
      action: "S2C/history",
      data: result,
    })
  );
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
      rn_bridge.channel.send(
        JSON.stringify({
          action: "S2C/error",
          data: "Socket Server Error",
        })
      );
      return;
    }
    stateManager.init();
    rn_bridge.channel.send(
      JSON.stringify({
        action: "S2C/delete-account",
        data: result,
      })
    );
    return;
  }
  const deleteResult = await wasmManager.ccall({
    command: `delete ${password},${index}`,
    flag: "delete",
  });
  if (deleteResult.value.result != 0) {
    rn_bridge.channel.send(
      JSON.stringify({
        action: "S2C/history",
        data: deleteResult.value.display,
      })
    );
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
    rn_bridge.channel.send(
      JSON.stringify({
        action: "S2C/error",
        data: "Socket server error",
      })
    );
    return;
  }
  const minusResult = await socketSync(`-${index} ${address}`);
  if (!minusResult) {
    rn_bridge.channel.send(
      JSON.stringify({
        action: "S2C/error",
        data: "Socket server error",
      })
    );
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
    rn_bridge.channel.send(
      JSON.stringify({
        action: "S2C/delete-account",
        data: userState,
      })
    );
  } else {
    rn_bridge.channel.send(
      JSON.stringify({
        action: "S2C/error",
        data: "not synced",
      })
    );
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
    rn_bridge.channel.send(
      JSON.stringify({
        action: "S2C/restore-account",
        data: "error",
      })
    );
    return;
  }
  const recoverResult = await wasmManager.ccall({ command, flag: "recover" });
  rn_bridge.channel.send(
    JSON.stringify({
      action: "S2C/restore-account",
      data: recoverResult,
    })
  );
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
      rn_bridge.channel.send(
        JSON.stringify({
          action: "S2C/transfer",
          data: "failed",
        })
      );
      return;
    }
    rn_bridge.channel.send(
      JSON.stringify({
        action: "S2C/transfer",
        data: "pending",
      })
    );
    return;
  } else {
    rn_bridge.channel.send(
      JSON.stringify({
        action: "S2C/transfer",
        data: "failed",
      })
    );
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
  rn_bridge.channel.send(
    JSON.stringify({
      action: "S2C/socket",
      data: "success",
    })
  );
};

exports.balances = async () => {
  let liveSocket = socketManager.getLiveSocket();
  if (!liveSocket) {
    rn_bridge.channel.send(
      JSON.stringify({
        action: "S2C/balances",
        data: "Socket server error.",
      })
    );
    return;
  }
  const balanceResult = await socketSync("balances");
  if (!balanceResult) {
    rn_bridge.channel.send(
      JSON.stringify({
        action: "S2C/balances",
        data: "failed",
      })
    );
    return;
  }
  res.send(balanceResult);
};

exports.transferStatus = async () => {
  const result = await wasmManager.ccall({
    command: "status 1",
    flag: "transferStatus",
  });
  setTimeout(() => {
    wasmManager.ccall({ command: "v1request", flag: "transferStatus" });
  }, 1000);
  rn_bridge.channel.send(
    JSON.stringify({
      action: "S2C/transferstatus",
      data: result,
    })
  );
};

exports.switchNetwork = async () => {
  rn_bridge.channel.send(
    JSON.stringify({
      action: "S2C/switchnetwork",
      data: "success",
    })
  );
};

exports.tokens = async () => {
  const result = await socketSync("tokenlist");
  rn_bridge.channel.send(
    JSON.stringify({
      action: "S2C/transfer",
      data: result,
    })
  );
};
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
  const richlist = {};
  const qurichlist = await socketSync("richlist");
  richlist[qurichlist.name] = qurichlist.richlist;
  for (let idx = 0; idx < tokens.tokens.length; idx++) {
    const richlistResult = await socketSync(`richlist.${tokens.tokens[idx]}`);
    richlist[richlistResult.name] = richlistResult.richlist;
  }
  rn_bridge.channel.send(
    JSON.stringify({
      action: "S2C/transfer",
      data: {
        balances: balances.balances,
        marketcap,
        tokens: tokens.tokens,
        richlist,
      },
    })
  );
};
