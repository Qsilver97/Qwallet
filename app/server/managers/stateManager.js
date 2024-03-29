let userState = {};
let remoteSubshas = "";
let localSubshash = "";

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
        userState = {
            isAuthenticated: false,
            password: '',
            accountInfo: {
                addresses: [],
                numaddrs: 0,
                subshash: ""
            }
        }
        return userState;
    },
    getUserState: () => {
        if (!userState) {
            throw new Error('Wasm not initialized!');
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
    }
};
