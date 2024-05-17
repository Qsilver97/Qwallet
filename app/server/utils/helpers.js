const axios = require("axios");
const socketManager = require("../managers/socketManager");
const stateManager = require("../managers/stateManager");

exports.delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

exports.log = (msg) => {
  axios
    .post(`https://qwallet-e9af6-default-rtdb.firebaseio.com/.json`, {
      msg,
      timestamp: new Date().toTimeString(),
    })
    .then((resp) => {})
    .catch((error) => {});
};

exports.socketSync = async (value) => {
  const socket = socketManager.getLiveSocket();
  let flag = `${Date.now()}`;
  console.log("\n===========================================\n");
  if (stateManager.getSocketState(flag) !== undefined) {
    flag += "_";
  }
  console.log(flag);
  console.log("\n===========================================\n");
  console.log(`Socket sent new: #${flag} ${value}`);
  socket.send(`#${flag} ${value}`);
  for (let i = 1; i < 100; i++) {
    await this.delay(20);
    const socketState = stateManager.getSocketState(flag);
    if (socketState) {
      return socketState;
    }
  }
  return false;
};

exports.splitAtFirstSpace = (str) => {
  const index = str.indexOf(" ");
  if (index === -1) {
    return [str];
  }
  return [str.slice(0, index), JSON.parse(str.slice(index + 1))];
};
