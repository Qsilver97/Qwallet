import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@app/redux/store";
import {
  basicInfo,
  buySell,
  getHistory,
  getToken,
  transferStatus,
} from "@app/api/api";
import Toast from "react-native-toast-message";
import eventEmitter from "@app/api/eventEmitter";
import {
  setMarketcap,
  setRichlist,
  setTokenprices,
  setTokens,
} from "@app/redux/appSlice";

export interface AccountDetailType {
  addresses: string[];
  numaddrs: number;
  subshash: string;
}

export interface UserDetailType {
  isAuthenticated: boolean;
  password: string;
  accountInfo: AccountDetailType;
}

interface AuthContextType {
  user: UserDetailType | null;
  balances: string[];
  tempPassword: string;
  currentAddress: string;
  allAddresses: string[];
  histories: TransactionItem[];
  tokenBalances: {
    [name: string]: Balances;
  };
  txId: string;
  txStatus: "Open" | "Closed" | "Rejected" | "Pending" | "Success";
  expectedTick: number;
  txResult: string;
  login: (userDetails: UserDetailType) => void;
  logout: () => void;
  setTempPassword: React.Dispatch<React.SetStateAction<string>>;
  setBalances: React.Dispatch<React.SetStateAction<string[]>>;
  setCurrentAddress: (value: React.SetStateAction<string>) => void;
  setTxStatus: React.Dispatch<
    React.SetStateAction<"Open" | "Closed" | "Rejected" | "Pending" | "Success">
  >;
  setExpectedTick: React.Dispatch<React.SetStateAction<number>>;
  setTokenBalances: React.Dispatch<
    React.SetStateAction<{
      [name: string]: Balances;
    }>
  >;
}
interface Balances {
  [address: string]: number;
}

type TransactionItem = [string, string, string, string, string, string];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();
  const [user, setUser] = useState<UserDetailType | null>(null);
  const [tempPassword, setTempPassword] = useState("");
  const [balances, setBalances] = useState<string[]>([]);
  const [currentAddress, setCurrentAddress] = useState<string>("");
  const [allAddresses, setAllAddresses] = useState<string[]>([]);
  const [histories, setHistories] = useState<TransactionItem[]>([]);
  const [txStatus, setTxStatus] = useState<
    "Open" | "Closed" | "Rejected" | "Pending" | "Success"
  >("Pending");
  const [txId, setTxId] = useState<string>("");
  const [expectedTick, setExpectedTick] = useState<number>(0);
  const [txResult, setTxResult] = useState<string>("");
  const [tokenBalances, setTokenBalances] = useState<{
    [name: string]: Balances;
  }>({});
  const [statusInterval, setStatusInterval] = useState<any>();

  const login = (userDetails: UserDetailType | null) => {
    setUser(userDetails);
    if (userDetails !== null)
      setCurrentAddress(userDetails?.accountInfo?.addresses[0]);
    basicInfo();
  };

  const logout = () => {
    // axios
    //   .post(`${}/api/logout`)
    //   .then((resp) => {
    //     console.log(resp.data);
    //     dispatch(setIsAuthenticated(true));
    //     login(null);
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //   })
    //   .finally(() => {});
  };

  useEffect(() => {
    eventEmitter.on("S2C/history", (res) => {
      if (res.data.history) {
        setHistories(res.data.history);
      } else {
        Toast.show({ type: "error", text1: res.data.value.display });
        setHistories([]);
      }
    });
    eventEmitter.on("S2C/tokens", (res) => {
      if (res.data.tokens) {
        dispatch(setTokens(res.data.tokens));
      } else {
        Toast.show({ type: "error", text1: "Error ocurred!" });
      }
    });
    eventEmitter.on("S2C/basic-info", (res) => {
      if (res.data) {
        dispatch(setTokens(res.data.tokens));
        dispatch(setRichlist(res.data.richlist));
        dispatch(setMarketcap(res.data.marketcap));
        dispatch(setTokenprices(res.data.tokenprices));
        dispatch(setTokens(res.data.tokens));
      } else {
        Toast.show({ type: "error", text1: res.data.value.display });
      }
    });
  }, []);

  useEffect(() => {
    if (currentAddress != "") {
      getHistory(currentAddress);
      getToken();
    }
  }, [currentAddress]);

  useEffect(() => {
    if (user?.accountInfo) {
      setCurrentAddress(user?.accountInfo.addresses[0]);
      setAllAddresses(user?.accountInfo.addresses);
    }
  }, [user]);

  useEffect(() => {
    eventEmitter.on("S2C/transfer", (res) => {
      if (res.data) {
        const _statusInterval = setInterval(() => {
          transferStatus();
        }, 2000);
        setStatusInterval(_statusInterval);
      } else {
        Toast.show({ type: "error", text1: "Error Occured" });
        setTxStatus("rejected");
      }
    });
    eventEmitter.on("S2C/transfer-status", (res) => {
      if (res.data) {
        console.log(res.data);
        if (res.data == "failed") {
          setTxStatus("rejected");
          Toast.show({ type: "error", text1: "Transfer Failed!" });
        } else if (res.data.value.result == "0") {
          setTxStatus("pending");
        } else if (res.data.value.result == "1") {
          setTxResult(res.data.value.display);
        } else {
          setTxStatus("rejected");
        }
      } else {
        Toast.show({ type: "error", text1: "Error Occured" });
        setTxStatus("rejected");
        clearInterval(statusInterval);
      }
    });
    eventEmitter.on("S2C/S2C/buy-sell", (res) => {
      if (res.data) {
        console.log("Client Data:", res.data);
      } else {
      }
    });
  }, []);

  useEffect(() => {
    if (txResult.includes("broadcast for tick")) {
      const txResultSplit = txResult.split(" ");
      setTxId(txResultSplit[1]);
      setExpectedTick(parseInt(txResultSplit[txResultSplit.length - 1]));
    } else if (txResult.includes("no command pending")) {
      setTxStatus("success");
      clearInterval(statusInterval);
    }
  }, [txResult]);

  return (
    <AuthContext.Provider
      value={{
        user,
        tempPassword,
        balances,
        currentAddress,
        allAddresses,
        histories,
        txId,
        txStatus,
        expectedTick,
        txResult,
        tokenBalances,
        login,
        logout,
        setTempPassword,
        setBalances,
        setCurrentAddress,
        setTxStatus,
        setExpectedTick,
        setTokenBalances,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
