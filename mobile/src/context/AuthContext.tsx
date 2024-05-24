import { basicInfo, getHistory, getToken, transferStatus } from "@app/api/api";
import eventEmitter from "@app/api/eventEmitter";
import {
  setIsAuthenticated,
  setMarketcap,
  setPassword,
  setTokenprices,
  setTokens,
} from "@app/redux/appSlice";
import local from "@app/utils/locales";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";

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
interface Balances {
  [address: string]: number;
}
interface AuthContextType {
  user: UserDetailType | null;
  balances: Balances;
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
  isLoading: boolean;

  login: (userDetails: UserDetailType) => void;
  logout: () => void;
  setTempPassword: React.Dispatch<React.SetStateAction<string>>;
  setBalances: React.Dispatch<React.SetStateAction<Balances>>;
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
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setPrevBalances: React.Dispatch<React.SetStateAction<Balances>>;
}

type TransactionItem = [string, string, string, string, string, string];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();
  const [user, setUser] = useState<UserDetailType | null>(null);
  const [tempPassword, setTempPassword] = useState("");
  const [balances, setBalances] = useState<Balances>({});
  const [currentAddress, setCurrentAddress] = useState<string>("");
  const [allAddresses, setAllAddresses] = useState<string[]>([]);
  const [histories, setHistories] = useState<TransactionItem[]>([]);
  const [txStatus, setTxStatus] = useState<
    "Open" | "Closed" | "Rejected" | "Pending" | "Success"
  >("Closed");
  const [txId, setTxId] = useState<string>("");
  const [expectedTick, setExpectedTick] = useState<number>(0);
  const [txResult, setTxResult] = useState<string>("Unknown");
  const [tokenBalances, setTokenBalances] = useState<{
    [name: string]: Balances;
  }>({});
  const [statusInterval, setStatusInterval] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [outTx, setOutTx] = useState(false);
  const [prevBalances, setPrevBalances] = useState<Balances>({});
  const [historyNum, setHistoryNum] = useState(histories.length);
  const [expectingHistoryUpdate, setExpectingHistoryUpdate] = useState(false);

  const lang = local.Toast;

  const login = (userDetails: UserDetailType | null) => {
    setUser(userDetails);
    if (userDetails !== null)
      setCurrentAddress(userDetails?.accountInfo?.addresses[0]);
    basicInfo();
  };

  const logout = () => {
    dispatch(setIsAuthenticated(false));
    dispatch(setPassword(""));
    setTempPassword("");
    setUser(null);
    setBalances({});
    setCurrentAddress("");
    setAllAddresses([]);
    setHistories([]);
    setTxStatus("Closed");
    setTxId("");
    setExpectedTick(0);
    setTxResult("");
    setTokenBalances({});
    setIsLoading(false);
  };

  useEffect(() => {
    setTokens([]);
    if (currentAddress != "") {
      setIsLoading(true);
      getHistory(currentAddress);
      getToken();
    }
  }, [currentAddress]);

  // If someone send qu to me
  useEffect(() => {
    if (currentAddress == "") return;
    if (Object.is(prevBalances, {})) return;
    if (!balances[currentAddress] || !prevBalances[currentAddress]) return;
    if (balances[currentAddress] > prevBalances[currentAddress]) setOutTx(true);
    else setOutTx(false);
    setHistoryNum(histories.length + 1);
    getHistory(currentAddress);
    setExpectingHistoryUpdate(true);
  }, [balances[currentAddress]]);

  useEffect(() => {
    if (user?.accountInfo) {
      setCurrentAddress(user?.accountInfo.addresses[0]);
      setAllAddresses(user?.accountInfo.addresses);
    }
  }, [user]);

  useEffect(() => {
    if (expectingHistoryUpdate && currentAddress !== "") {
      const interval = setInterval(() => {
        if (histories.length !== historyNum) {
          getHistory(currentAddress);
        } else {
          const newHistory = histories.reverse()[0];
          if (outTx)
            Toast.show({
              type: "info",
              text1: lang.ReceivedQUFrom.replace(
                "{amount}",
                `${Math.abs(parseInt(newHistory[3]))}`
              ).replace("{address}", newHistory[2]),
            });
          setExpectingHistoryUpdate(false); // Clear the flag when history is up-to-date
          clearInterval(interval); // Clear the interval when done
        }
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [histories.length, historyNum, currentAddress, expectingHistoryUpdate]);

  useEffect(() => {
    const handleHistoryEvent = (res: any) => {
      console.log("S2C/histories: ", res);
      if (res.data === false) {
        setHistories([]);
      } else if (res.data.history) {
        setHistories(res.data.history);
      } else {
        // setHistories([]);
      }
      setIsLoading(false);
    };
    const handleTokenEvent = (res: any) => {
      if (res.data) {
        if (res.data.tokens) dispatch(setTokens(res.data.tokens));
      } else {
        Toast.show({
          type: "error",
          text1: "E-21: " + lang.ErrorGettingToken,
        });
      }
    };
    const handleTransferEvent = (res: any) => {
      if (res.data) {
        const _statusInterval = setInterval(() => {
          transferStatus();
        }, 2000);
        setStatusInterval(_statusInterval);
      } else {
        Toast.show({
          type: "error",
          text1: "E-22: " + lang.ErrorTransfer,
        });
        setTxStatus("Rejected");
      }
    };
    const handleTransferStatusEvent = (res: any) => {
      console.log("S2C/transfer-status", res);
      if (res.data) {
        if (res.data == "failed") {
          setTxStatus("Rejected");
          setTxResult("Failed");
          Toast.show({ type: "error", text1: "E-23: " + lang.TransferFailed });
        } else if (res.data.value.result == 0) {
          setTxStatus("Pending");
          setTxResult("Pending");
        } else if (res.data.value.result == 1) {
          setTxResult(res.data.value.display);
        } else {
          setTxStatus("Rejected");
        }
      } else {
        Toast.show({ type: "error", text1: "E-24: " + lang.TransferFailed });
        setTxStatus("Rejected");
        setTxResult("Pending");
        clearInterval(statusInterval);
      }
    };
    const handleBuySellEvent = (res: any) => {
      if (res.data) {
        const _statusInterval = setInterval(() => {
          transferStatus();
        }, 2000);
        setStatusInterval(_statusInterval);
        if (res.data.value.result == 0) {
        } else if (res.data.value.result < 0) {
          Toast.show({
            type: "error",
            text1: "E-25: " + res.data.value.display,
          });
        } else if (res.data.value.result == 1) {
          setTxStatus(res.data.value.display);
        }
      } else {
      }
    };
    eventEmitter.on("S2C/histories", handleHistoryEvent);
    eventEmitter.on("S2C/tokens", handleTokenEvent);
    eventEmitter.on("S2C/transfer", handleTransferEvent);
    eventEmitter.on("S2C/transfer-status", handleTransferStatusEvent);
    eventEmitter.on("S2C/buy-sell", handleBuySellEvent);

    // Cleanup function to remove the event listener
    return () => {
      eventEmitter.off("S2C/histories", handleHistoryEvent);
      eventEmitter.off("S2C/tokens", handleTokenEvent);
      eventEmitter.off("S2C/transfer", handleTransferEvent);
      eventEmitter.off("S2C/transfer-status", handleTransferStatusEvent);
      eventEmitter.off("S2C/buy-sell", handleBuySellEvent);
    };
  }, []);

  useEffect(() => {
    if (txResult.includes("broadcast for tick")) {
      const txResultSplit = txResult.split(" ");
      setTxId(txResultSplit[1]);
      setExpectedTick(parseInt(txResultSplit[txResultSplit.length - 1]));
    } else if (txResult.includes("no command pending")) {
      setTxStatus("Success");
      Toast.show({
        type: "success",
        text1: lang.TransactionCompleted,
      });
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
        isLoading,
        login,
        logout,
        setTempPassword,
        setBalances,
        setCurrentAddress,
        setTxStatus,
        setExpectedTick,
        setTokenBalances,
        setIsLoading,
        setPrevBalances,
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
