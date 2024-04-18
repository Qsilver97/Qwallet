import nodejs from "nodejs-mobile-react-native";
import eventEmitter from "./eventEmitter";

export const channelInit = () => {
  nodejs.start("main.js");
  nodejs.channel.addListener("message", (msg) => {
    try {
      const res = JSON.parse(msg);
      eventEmitter.emit(res.action, res);
    } catch (err) {}
  });
};

export const login = (password: string) => {
  nodejs.channel.send(
    JSON.stringify({ action: "C2S/login", data: { password } })
  );
};

export const create = (command: string) => {
  nodejs.channel.send(
    JSON.stringify({ action: "C2S/create", data: { command } })
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
  nodejs.channel.send(
    JSON.stringify({ action: "C2S/history", data: { address } })
  );
};

export const getToken = () => {
  nodejs.channel.send(JSON.stringify({ action: "C2S/tokens", data: {} }));
};

export const basicInfo = () => {
  nodejs.channel.send(JSON.stringify({ action: "C2S/basic-info", data: {} }));
};

export const transfer = (
  toAddress: string,
  fromIdx: number,
  amount: any,
  tick: number
) => {
  nodejs.channel.send(
    JSON.stringify({
      action: "C2S/transfer",
      data: { toAddress, fromIdx, amount, tick },
    })
  );
};
