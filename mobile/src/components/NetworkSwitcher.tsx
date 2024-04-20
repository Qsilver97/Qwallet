import { Button, View } from "native-base";
import { useNetwork } from "../context/NetworkContext";
import tw from "tailwind-react-native-classnames";

const NetworkSwitcher = () => {
  const { network, switchingStatus, switchNetwork } = useNetwork();

  return (
    <View style={tw`flex-row `}>
      <Button
        style={tw`px-2 ${
          network === "mainnet" ? "bg-green-300" : ""
        } ${switchingStatus ? "" : ""}`}
        onPress={() => switchNetwork("mainnet")}
        isDisabled={switchingStatus}
        _text={tw`text-white`}
      >
        Mainnet
      </Button>
      <Button
        style={tw`px-2 ${
          network === "testnet" ? "bg-green-300" : ""
        } ${switchingStatus ? "" : ""}`}
        onPress={() => switchNetwork("testnet")}
        isDisabled={switchingStatus}
        _text={tw`text-white`}
      >
        Testnet
      </Button>
    </View>
  );
};

export default NetworkSwitcher;
