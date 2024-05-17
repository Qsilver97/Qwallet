let userState = {};
let remoteSubshas = "";
let localSubshash = "";
let socketState = { pendingFlags: [] };

// export interface AccountDetailType {
//     addresses: string[],
//     numaddrs: number,
//     subshash: string,
// }

// export interface UserDetailType {
//     password: string,
//     accountInfo: AccountDetailType,
// }

module.exports = {
  init: () => {
    (userState = {
      isAuthenticated: false,
      password: "",
      accountInfo: {
        addresses: [],
        numaddrs: 0,
        subshash: "",
      },
    }),
      (remoteSubshas = "");
    localSubshash = "";
    return userState;
  },
  getUserState: () => {
    if (!userState) {
      throw new Error("Wasm not initialized!");
    }
    return userState;
  },
  setUserState: (userDetail) => {
    userState = { ...userDetail };
    return userState;
  },
  setRemoteSubshash: (subshash) => {
    remoteSubshas = subshash;
    return remoteSubshas;
  },
  getRemoteSubshash: () => {
    return remoteSubshas;
  },
  setLocalSubshash: (subshash) => {
    localSubshash = subshash;
    return subshash;
  },
  getLocalSubshash: () => {
    return localSubshash;
  },
  updateSocketState: (flag, value) => {
    socketState[flag] = value;
    return value;
  },
  getSocketState: (flag) => {
    return socketState[flag];
  },
  setPendingFlag: (flag) => {
    socketState["pendingFlags"] = [...socketState["pendingFlags"], flag];
  },
  getPendingFlags: () => {
    return socketState["pendingFlags"];
  },
};
