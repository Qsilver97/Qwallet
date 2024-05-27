import { buySell } from "@app/api/api";
import { useAuth } from "@app/context/AuthContext";
import { RootState } from "@app/redux/store";
import { IOrderData, IOrderUnit } from "@app/types";
import local from "@app/utils/locales";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { Text, VStack, useDisclose } from "native-base";
import React from "react";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import ConfirmModal from "../../components/ConfirmModal";
import TxStatusModal from "../../components/TxStatusModal";

interface IProps {
  isOpen: boolean;
  onToggle: () => void;
  token: string;
  amount: string;
  price: string;
  buySellFlag: "buy" | "sell" | "cancelbuy" | "cancelsell";
  orderData: IOrderData;
}

const Core: React.FC<IProps> = ({
  isOpen,
  onToggle,
  token,
  amount,
  price,
  buySellFlag,
  orderData,
}) => {
  const { tick } = useSelector((store: RootState) => store.app);
  const { user, currentAddress, txStatus, tokenBalances, balances } = useAuth();
  const modal2 = useDisclose();
  const lang = local.Main.Orderbook;

  const confirmText = {
    buy: lang.ConfirmBuy,
    sell: lang.ConfirmSell,
    cancelbuy: lang.ConfirmCancelBuy,
    cancelsell: lang.ConfirmCancelSell,
  }[buySellFlag];

  const handleBuySell = (
    flag: "buy" | "sell" | "cancelbuy" | "cancelsell",
    amount: string,
    price: string,
    token: string
  ) => {
    onToggle();
    const showError = (message: string) => {
      Toast.show({
        type: "error",
        text1: message,
      });
    };

    const isAmountOrPriceInvalid =
      amount === "" ||
      amount === "0" ||
      price === "" ||
      price === "0" ||
      !Number.isInteger(parseInt(amount)) ||
      !Number.isInteger(parseInt(price));
    if (isAmountOrPriceInvalid) {
      showError(local.Main.Components.InvalidAddressOrAmount);
      return;
    }

    const insufficientTokenBalance =
      flag === "sell" &&
      (Object.is(tokenBalances, {}) ||
        tokenBalances[token][currentAddress] < parseInt(amount));
    if (insufficientTokenBalance) {
      showError("E-32: " + lang.TokenBalanceInsufficient);
      return;
    }

    const insufficientQU =
      flag === "buy" &&
      balances[currentAddress] < parseInt(amount) * parseInt(price);
    if (insufficientQU) {
      showError("E-33: " + lang.QUInsufficient);
      return;
    }

    const validateOrder = (orderList: IOrderUnit[], flag: string) => {
      let isValidAddress = false;
      let isValidPriceOrAmount = false;
      for (const order of orderList) {
        if (order[1] === currentAddress) {
          isValidAddress = true;
          if (order[3] == price && parseInt(order[2]) >= parseInt(amount)) {
            isValidPriceOrAmount = true;
          }
        }
      }
      if (!isValidPriceOrAmount) {
        showError("E-34: " + lang.toast_NotExistOrder);
        return false;
      }
      if (!isValidAddress) {
        showError("E-35: " + lang.toast_NoOrder);
        return false;
      }
      return true;
    };

    if (flag === "cancelbuy" && !validateOrder(orderData[token].bids, flag)) {
      return;
    }

    if (flag === "cancelsell" && !validateOrder(orderData[token].asks, flag)) {
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
      <TxStatusModal isOpen={modal2.isOpen} onToggle={modal2.onToggle} />
    </>
  );
};

export default Core;
