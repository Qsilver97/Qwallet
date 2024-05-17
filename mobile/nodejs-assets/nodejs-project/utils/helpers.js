const socketManager = require("../managers/socketManager");
const stateManager = require("../managers/stateManager");

exports.delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// exports.log = (msg) => {
//     axios.post(
//         `https://qwallet-e9af6-default-rtdb.firebaseio.com/.json`,
//         {
//             msg,
//             timestamp: (new Date).toTimeString()
//         }
//     ).then((resp) => { })
//         .catch((error) => { })
// }
const checkPending = (flag) => {
  let tmpFlag = flag;
  if (stateManager.getPendingFlags()?.includes(tmpFlag)) {
    console.log("There is same pending flag in now! Changing...");
    tmpFlag += "_";
    let newFlag = checkPending(tmpFlag);
    stateManager.setPendingFlag(newFlag);
    return newFlag;
  } else {
    stateManager.setPendingFlag(tmpFlag);
    return tmpFlag;
  }
};

exports.socketSync = async (value) => {
  const socket = socketManager.getLiveSocket();
  let flag = `${Date.now()}`;
  let newFlag = checkPending(flag);
  if (newFlag !== flag) console.log(`Flag changed: ${flag} => ${newFlag}`);
  console.log(`Socket sent new: #${newFlag} ${value}`);
  socket.send(`#${newFlag} ${value}`);
  for (let i = 1; i < 100; i++) {
    await this.delay(20);
    const socketState = stateManager.getSocketState(newFlag);
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
