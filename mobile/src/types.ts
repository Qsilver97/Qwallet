interface AccountDetailType {
  addresses: string[];
  numaddrs: number;
  subshash: string;
}

interface UserDetailType {
  isAuthenticated: boolean;
  password: string;
  accountInfo: AccountDetailType;
}
interface Balances {
  [address: string]: number;
}

interface TransactionStatus {
  txid: string;
  status: "Closed" | "Waiting" | "Pending" | "Sucess" | "Failed";
  expectedTick: number;
  result: string;
}

type TransactionItem = [string, string, string, string, string, string];

interface AuthContextType {
  user: UserDetailType;
  balances: Balances;
  currentAddress: string;
  histories: TransactionItem[];
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

type IOrderUnit = [number, string, string, string]; // index, address, amount, price

interface IOrderData {
  [tokenName: string]: {
    bids: IOrderUnit[];
    asks: IOrderUnit[];
  };
}

type IOrder = [string, string, string, string]; // token, amount, price, type

// interface TxData {
//   txToken: string;
//   index: number;
//   amount: number | number[];
//   expectedTick: number;
//   dest: string | string[]; // for tx only
//   price: number; // for qx only
// }

export {
  AccountDetailType,
  UserDetailType,
  Balances,
  TransactionStatus,
  TransactionItem,
  AuthContextType,
  IOrderUnit,
  IOrderData,
  IOrder,
  // TxData,
};
