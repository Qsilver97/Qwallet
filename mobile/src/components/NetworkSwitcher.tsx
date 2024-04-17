import { useNetwork } from "../context/NetworkContext";

const NetworkSwitcher = () => {
  const { network, switchingStatus, switchNetwork } = useNetwork();

  return (
    <div className="flex gap-2">
      <button
        className={`bg-slate-700 px-2 ${
          network === "mainnet" ? "bg-green-300" : ""
        } ${switchingStatus ? "cursor-wait" : ""}`}
        onClick={() => switchNetwork("mainnet")}
        disabled={switchingStatus}
      >
        Mainnet
      </button>
      <button
        className={`bg-slate-700 px-2 ${
          network === "testnet" ? "bg-green-300" : ""
        } ${switchingStatus ? "cursor-wait" : ""}`}
        onClick={() => switchNetwork("testnet")}
        disabled={switchingStatus}
      >
        Testnet
      </button>
    </div>
  );
};

export default NetworkSwitcher;
