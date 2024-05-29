import nodejs from "nodejs-mobile-react-native";
import eventEmitter from "./eventEmitter";

export const channelInit = (path: string) => {
  nodejs.start("main.js");
  nodejs.channel.send(JSON.stringify({ action: "C2S/INIT", data: { path } }));
  nodejs.channel.addListener("message", (msg) => {
    try {
      const res = JSON.parse(msg);
      eventEmitter.emit(res.action, res);
    } catch (err) {}
  });
};

export const passwordAvail = (password: string) => {
  nodejs.channel.send(
    JSON.stringify({
      action: "C2S/passwordAvail",
      data: { command: `checkavail ${password}`, flag: "passwordAvail" },
    })
  );
};

export const login = (password: string) => {
  nodejs.channel.send(
    JSON.stringify({ action: "C2S/login", data: { password } })
  );
};

export const logout = () => {
  nodejs.channel.send(JSON.stringify({ action: "C2S/logout", data: {} }));
};

export const create = (command: string) => {
  nodejs.channel.send(
    JSON.stringify({ action: "C2S/create", data: { command } })
  );
};

export const restore = (
  password: string,
  seeds: string | string[],
  seedType: string
) => {
  nodejs.channel.send(
    JSON.stringify({
      action: "C2S/restore",
      data: { password, seeds, seedType },
    })
  );
};

export const addAccount = (
  password: string | undefined,
  index: number | undefined
) => {
  nodejs.channel.send(
    JSON.stringify({ action: "C2S/add-account", data: { password, index } })
  );
};

export const deleteAccount = (
  password: string | undefined,
  index: number | undefined,
  address: string
) => {
  nodejs.channel.send(
    JSON.stringify({
      action: "C2S/delete-account",
      data: { password, index, address },
    })
  );
};

export const getHistory = (address: string) => {
  console.log("GETTING_HISTORY\n")
  nodejs.channel.send(
    JSON.stringify({ action: "C2S/histories", data: { address } })
  );
};

export const getToken = () => {
  console.log("GETTING_TOKEN\n")
  nodejs.channel.send(JSON.stringify({ action: "C2S/tokens", data: {} }));
};

export const basicInfo = () => {
  console.log("GETTING_BASICINFO\n")
  nodejs.channel.send(JSON.stringify({ action: "C2S/basic-info", data: {} }));
};

export const transfer = (
  toAddress: string,
  fromIdx: number,
  amount: any,
  tick: number,
  token: string
) => {
  console.log("TRANSFER\n")
  nodejs.channel.send(
    JSON.stringify({
      action: "C2S/transfer",
      data: { toAddress, fromIdx, amount, tick, token },
    })
  );
};

export const transferStatus = () => {
  console.log("TRANSFER_STATUS\n")
  nodejs.channel.send(
    JSON.stringify({
      action: "C2S/transfer-status",
      data: {},
    })
  );
};

export const buySell = (
  flag: "buy" | "sell" | "cancelbuy" | "cancelsell",
  amount: string,
  price: string,
  password: string,
  index: number,
  tick: number,
  currentToken: string
) => {
  nodejs.channel.send(
    JSON.stringify({
      action: "C2S/buy-sell",
      data: {
        flag,
        password,
        index,
        tick,
        currentToken,
        amount,
        price,
      },
    })
  );
};

export const myOrders = () => {
  console.log("MY_ORDERS\n")
  nodejs.channel.send(
    JSON.stringify({
      action: "C2S/my-orders",
      data: {},
    })
  );
};

export const network = () => {
  console.log("NETWORK\n")
  nodejs.channel.send(
    JSON.stringify({
      action: "C2S/network",
      data: {},
    })
  );
};

export const qxhistory = (address: string) => {
  console.log("GETTING_QXHISTORY\n")
  nodejs.channel.send(
    JSON.stringify({ action: "C2S/qxhistory", data: { address } })
  );
};

export const txFetch = (txid: string) => {
  console.log("TX_FETCH\n")
  nodejs.channel.send(
    JSON.stringify({
      action: "C2S/tx-fetch",
      data: { txid },
    })
  );
};

export const fetchAddress = (address: string) => {
  console.log("FETCH_ADDRESS_DATA\n")
  nodejs.channel.send(
    JSON.stringify({
      action: "C2S/fetch-address",
      data: { address },
    })
  );
};
