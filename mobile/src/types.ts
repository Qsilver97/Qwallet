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
  status: "Closed" | "Waiting" | "Pending" | "Success" | "Failed";
  expectedTick: number;
  result: string;
}

type TransactionItem = [string, string, string, string, string, number];

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

interface IScTx {
  action: string;
  amount: string;
  fn: number;
  issuer: string;
  name: string;
  price: string;
  scind: number;
}

interface QxTxItem {
  txid: string;
  sctx: IScTx;
}

export {
  AccountDetailType,
  UserDetailType,
  Balances,
  TransactionStatus,
  TransactionItem,
  IOrderUnit,
  IOrderData,
  IOrder,
  IScTx,
  QxTxItem,
  // TxData,
};
