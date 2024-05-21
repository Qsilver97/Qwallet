import { buySell } from "@app/api/api";
import FormLabel from "@app/components/UI/FormLabel";
import { useAuth } from "@app/context/AuthContext";
import { RootState } from "@app/redux/store";
import local from "@app/utils/locales";
import { faCheck, faShare } from "@fortawesome/free-solid-svg-icons";
import { Text, VStack, useDisclose } from "native-base";
import React from "react";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import ConfirmModal from "../../components/ConfirmModal";

interface IProps {
  isOpen: boolean;
  onToggle: () => void;
  token: string;
  amount: string;
  price: string;
  buySellFlag: "buy" | "sell" | "cancelbuy" | "cancelsell";
  confirmText: string;
}

const Core: React.FC<IProps> = ({
  isOpen,
  onToggle,
  token,
  amount,
  price,
  buySellFlag,
  confirmText,
}) => {
  const { tick } = useSelector((store: RootState) => store.app);
  const { user, currentAddress, txId, txStatus, expectedTick } = useAuth();
  const modal2 = useDisclose();
  const lang = local.Main.Orderbook;

  const handleBuySell = (
    flag: "buy" | "sell" | "cancelbuy" | "cancelsell",
    amount: string,
    price: string,
    token: string
  ) => {
    onToggle();
    if (amount == "" || amount == "0" || price == "" || price == "0") {
      Toast.show({
        type: "error",
        text1: local.Main.Components.InvalidAddressOrAmount,
      });
      return;
    }
    buySell(
      flag,
      amount,
      price,
      user?.password as string,
      user?.accountInfo?.addresses.indexOf(currentAddress) as number,
      parseInt(tick) + 5,
      token
    );
    modal2.onToggle();
  };

  return (
    <>
      <ConfirmModal
        icon={faCheck}
        isOpen={isOpen}
        onToggle={onToggle}
        onPress={() => {
          handleBuySell(buySellFlag, amount, price, token);
        }}
      >
        <VStack fontSize={"xl"} textAlign={"center"} px={2}>
          <Text>
            {confirmText
              .replace("{amount}", amount)
              .replace("{currentToken}", token)
              .replace("{price}", price)}
          </Text>
        </VStack>
      </ConfirmModal>
      <ConfirmModal
        icon={txStatus == "Success" ? faCheck : faShare}
        isOpen={modal2.isOpen}
        onToggle={modal2.onToggle}
        onPress={() => {
          modal2.onToggle();
        }}
      >
        <VStack fontSize={"xl"} textAlign={"center"} px={2}>
          <FormLabel label={lang.Status} value={txStatus}></FormLabel>
          <FormLabel label={lang.TransactionID} value={txId}></FormLabel>
          <FormLabel label={lang.CurrentTick} value={tick}></FormLabel>
          <FormLabel
            label={lang.CurrentTick}
            value={`${expectedTick}`}
          ></FormLabel>
        </VStack>
      </ConfirmModal>
    </>
  );
};

export default Core;
