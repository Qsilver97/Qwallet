import {
  basicInfo,
  fetchAddress,
  getHistory,
  getToken,
  network,
  qxhistory,
  transferStatus,
} from "@app/api/api";
import eventEmitter from "@app/api/eventEmitter";
import {
  setIsAuthenticated,
  setPassword,
  setTick,
  setTokens,
} from "@app/redux/appSlice";
import { RootState } from "@app/redux/store";
import {
  Balances,
  QxTxItem,
  TransactionItem,
  TransactionStatus,
  UserDetailType,
} from "@app/types";
import local from "@app/utils/locales";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";

interface AuthContextType {
  user: UserDetailType;
  balances: Balances;
  currentAddress: string;
  histories: TransactionItem[];
  qxHistories: QxTxItem[];
  tokenBalances: {
    [name: string]: Balances;
  };
  txStatus: TransactionStatus;
  isLoading: boolean;

  login: (userDetails: UserDetailType) => void;
  logout: () => void;
  setBalances: React.Dispatch<React.SetStateAction<Balances>>;
  setCurrentAddress: (value: React.SetStateAction<string>) => void;
  setTxStatus: React.Dispatch<React.SetStateAction<TransactionStatus>>;
  setTokenBalances: React.Dispatch<
    React.SetStateAction<{
      [name: string]: Balances;
    }>
  >;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setPrevBalances: React.Dispatch<React.SetStateAction<Balances>>;
  setLastSocketResponseTime: React.Dispatch<React.SetStateAction<number>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();
  const { tick } = useSelector((store: RootState) => store.app);

  //////////////// Acccount Info /////////////////////
  const [user, setUser] = useState<UserDetailType>({
    isAuthenticated: false,
    password: "",
    accountInfo: { addresses: [], numaddrs: 0, subshash: "" },
  });
  const [balances, setBalances] = useState<Balances>({});
  const [histories, setHistories] = useState<TransactionItem[]>([]);
  const [qxHistories, setQxHistories] = useState<QxTxItem[]>([]);
  const [tokenBalances, setTokenBalances] = useState<{
    [name: string]: Balances;
  }>({});

  ////////////// Transaction Data ////////////////
  const [txStatus, setTxStatus] = useState<TransactionStatus>({
    txid: "",
    expectedTick: 0,
    status: "Closed",
    result: "",
  });

  ////////////// Temp Data ////////////////
  const [currentAddress, setCurrentAddress] = useState<string>("");

  const [statusInterval, setStatusInterval] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [outTx, setOutTx] = useState(false);
  const [prevBalances, setPrevBalances] = useState<Balances>({});
  const [historyNum, setHistoryNum] = useState(histories.length);
  const [expectingHistoryUpdate, setExpectingHistoryUpdate] = useState(false);

  const [lastSocketResponseTime, setLastSocketResponseTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  const lang = local.Toast;

  // useEffect(() => {
  //   if (lastSocketResponseTime != 0)
  //     intervalRef.current = setInterval(() => {
  //       if (Date.now() - lastSocketResponseTime > 4000) {
  //         console.log(Date.now());
  //         console.log(lastSocketResponseTime);
  //         network();
  //       }
  //     }, 5000);

  //   return () => {
  //     if (intervalRef.current) {
  //       clearInterval(intervalRef.current);
  //     }
  //   };
  // }, [lastSocketResponseTime]);

  useEffect(() => {
    if (user.accountInfo.numaddrs)
      setTimeout(() => {
        network();
      }, 5000);
  }, [user.accountInfo.numaddrs]);

  const clear = () => {
    dispatch(setIsAuthenticated(false));
    dispatch(setPassword(""));
    setUser({
      isAuthenticated: false,
      password: "",
      accountInfo: { addresses: [], numaddrs: 0, subshash: "" },
    });
    setBalances({});
    setCurrentAddress("");
    setHistories([]);
    setTxStatus({
      txid: "",
      expectedTick: 0,
      status: "Closed",
      result: "",
    });
    setTokenBalances({});
    setIsLoading(false);
    setExpectingHistoryUpdate(false);
  };

  const login = (userDetails: UserDetailType) => {
    setUser(userDetails);
    setCurrentAddress(userDetails?.accountInfo?.addresses[0]);
    basicInfo();
  };

  const logout = () => {
    clear();
  };

  useEffect(() => {
    setTokens([]);
    if (!!currentAddress) {
      setExpectingHistoryUpdate(false);
      setIsLoading(true);
      getHistory(currentAddress);
      qxhistory(currentAddress);
      getToken();
      fetchAddress(currentAddress);
    }
  }, [currentAddress]);

  // If someone send qu to me
  // useEffect(() => {
  //   if (!currentAddress) return;
  //   if (Object.is(prevBalances, {})) return;
  //   if (!balances[currentAddress] || !prevBalances[currentAddress]) return;
  //   if (balances[currentAddress] > prevBalances[currentAddress]) setOutTx(true);
  //   else setOutTx(false);
  //   setHistoryNum(histories.length + 1);
  //   getHistory(currentAddress);
  //   setExpectingHistoryUpdate(true);
  // }, [balances[currentAddress]]);

  useEffect(() => {
    if (user.accountInfo.numaddrs) {
      setCurrentAddress(user.accountInfo.addresses[0]);
    }
  }, [user]);

  useEffect(() => {
    if (!currentAddress) return;
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
  }, [histories.length, historyNum, expectingHistoryUpdate]);

  useEffect(() => {
    if (
      txStatus.status == "Success" ||
      txStatus.status == "Failed" ||
      txStatus.status == "Closed"
    )
      return;
    transferStatus();
  }, [tick]);

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
    const handleQxHistoryEvent = (res: any) => {
      if (res.data === false) {
        setQxHistories([]);
      } else if (res.data.history) {
        setQxHistories(res.data.history);
      } else {
        // setHistories([]);
      }
      setIsLoading(false);
    };
    const handleTokenEvent = (res: any) => {
      if (res.data) {
        console.log(res.data);
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
        setTimeout(() => transferStatus(), 1500);
      } else {
        Toast.show({
          type: "error",
          text1: "E-22: " + lang.ErrorTransfer,
        });
        setTxStatus((prev) => {
          return { ...prev, status: "Failed" };
        });
      }
    };
    const handleTransferStatusEvent = (res: any) => {
      console.log("S2C/transfer-status", res);
      if (res.data) {
        if (res.data == "failed") {
          setTxStatus((prev) => {
            return { ...prev, status: "Failed" };
          });
          Toast.show({ type: "error", text1: "E-23: " + lang.TransferFailed });
        } else if (res.data.value.result == 0) {
          setTxStatus((prev) => {
            return { ...prev, status: "Pending" };
          });
        } else if (res.data.value.result == 1) {
          setTxStatus((prev) => {
            return {
              ...prev,
              result: res.data.value.display,
            };
          });
        } else {
          setTxStatus((prev) => {
            return { ...prev, status: "Failed" };
          });
        }
      } else {
        Toast.show({ type: "error", text1: "E-24: " + lang.TransferFailed });
        setTxStatus((prev) => {
          return { ...prev, status: "Failed" };
        });
      }
    };
    const handleBuySellEvent = (res: any) => {
      if (res.data) {
        if (res.data.value.result == 0) {
        } else if (res.data.value.result < 0) {
          Toast.show({
            type: "error",
            text1: "E-25: " + res.data.value.display,
          });
        } else if (res.data.value.result == 1) {
          const splited = res.data.value.display.split(" ");
          setTxStatus((prev) => {
            return {
              ...prev,
              expectedTick: splited[5],
              txid: splited[1],
              status: "Pending",
            };
          });
        }
      } else {
      }
    };
    const handleNetwork = (res: any) => {
      if (res.data) {
        console.log(res.data);
        dispatch(setTick(res.data?.latest));
      }
    };
    eventEmitter.on("S2C/histories", handleHistoryEvent);
    eventEmitter.on("S2C/qxhistory", handleQxHistoryEvent);
    eventEmitter.on("S2C/tokens", handleTokenEvent);
    eventEmitter.on("S2C/transfer", handleTransferEvent);
    eventEmitter.on("S2C/transfer-status", handleTransferStatusEvent);
    eventEmitter.on("S2C/buy-sell", handleBuySellEvent);
    eventEmitter.on("S2C/network", handleNetwork);

    // Cleanup function to remove the event listener
    return () => {
      eventEmitter.off("S2C/histories", handleHistoryEvent);
      eventEmitter.off("S2C/tokens", handleTokenEvent);
      eventEmitter.off("S2C/transfer", handleTransferEvent);
      eventEmitter.off("S2C/transfer-status", handleTransferStatusEvent);
      eventEmitter.off("S2C/buy-sell", handleBuySellEvent);
      eventEmitter.off("S2C/network", handleNetwork);
    };
  }, []);

  useEffect(() => {
    if (txStatus.result?.includes("broadcast for tick")) {
      const txResultSplit = txStatus.result.split(" ");
      setTxStatus((prev) => {
        return { ...prev, txid: txResultSplit[1] };
      });
      setTxStatus((prev) => {
        return {
          ...prev,
          expectedTick: parseInt(txResultSplit[txResultSplit.length - 1]),
        };
      });
    } else if (txStatus.result?.includes("no command pending")) {
      setTxStatus((prev) => {
        return { ...prev, status: "Success" };
      });
      Toast.show({
        type: "success",
        text1: lang.TransactionCompleted,
      });
    }
  }, [txStatus.result]);

  return (
    <AuthContext.Provider
      value={{
        user,
        balances,
        currentAddress,
        histories,
        qxHistories,
        txStatus,
        tokenBalances,
        isLoading,
        login,
        logout,
        setBalances,
        setCurrentAddress,
        setTokenBalances,
        setTxStatus,
        setIsLoading,
        setPrevBalances,
        setLastSocketResponseTime,
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
