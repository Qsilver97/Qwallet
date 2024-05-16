import React, { useState } from "react";
import { HStack, Text, VStack, useDisclose } from "native-base";
import { useColors } from "@app/context/ColorContex";
import TokenSelect from "../components/TokenSelect";
import TransferButton from "../components/TransferButton";
import { faCheck, faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import Input from "@app/components/UI/Input";
import { buySell } from "@app/api/api";
import { useSelector } from "react-redux";
import { RootState } from "@app/redux/store";
import { useAuth } from "@app/context/AuthContext";
import ConfirmModal from "../components/ConfirmModal";
import Orderlist from "./components/Orderlist";

const Orderbook: React.FC = () => {
  const { bgColor, textColor } = useColors();
  const { tokenprices, tick } = useSelector((store: RootState) => store.app);
  const { user, currentAddress } = useAuth();
  const [currentToken, setCurrentToken] = useState<string>("QWALLET");
  const [amount, setAmount] = useState<string>("0");
  const [price, setPrice] = useState<string>("0");
  const [buySellFlag, setBuySellFlag] = useState<
    "buy" | "sell" | "cancelbuy" | "cancelsell"
  >("buy");
  const { isOpen, onToggle } = useDisclose();

  const handleBuySell = async (
    flag: "buy" | "sell" | "cancelbuy" | "cancelsell",
    amount: string,
    price: string,
    currentToken: string
  ) => {
    buySell(
      flag,
      amount,
      price,
      user?.password as string,
      user?.accountInfo?.addresses.indexOf(currentAddress) as number,
      tick,
      currentToken
    );
  };

  return (
    <VStack
      flex={1}
      justifyContent="around"
      py="10"
      space={5}
      bgColor={bgColor}
      color={textColor}
    >
      <Text fontSize="3xl" color={textColor} textAlign="center">
        Orderbook
      </Text>
      <VStack px="5">
        <TokenSelect
          selectedToken={currentToken}
          onChange={setCurrentToken}
        ></TokenSelect>
        <HStack py="2">
          <VStack w="3/4" textAlign="center">
            <Input
              type="text"
              onChangeText={(text) => {
                setAmount(text);
              }}
              placeholder="Input Amount"
              label={`Amount of ${currentToken}`}
              w="full"
              parentProps={{ w: "full" }}
            ></Input>
            <Input
              type="text"
              onChangeText={(text) => {
                setPrice(text);
              }}
              placeholder="Input Price"
              label={`Price of ${currentToken}`}
              w="full"
              parentProps={{ w: "full" }}
            ></Input>
          </VStack>
          <VStack w={"1/4"} justifyContent={"center"} space={4}>
            <TransferButton
              icon={faPlus}
              title="BUY"
              onPress={() => {
                setBuySellFlag("buy");
                onToggle();
              }}
            ></TransferButton>
            <TransferButton
              icon={faMinus}
              title="SELL"
              onPress={() => {
                setBuySellFlag("sell");
                onToggle();
              }}
            ></TransferButton>
          </VStack>
        </HStack>

        <HStack w="full">
          <Text textAlign="center" fontSize="md">
            Currently the highest bid price of {currentToken} is{" "}
            {tokenprices?.[currentToken]?.[0] || "0"} QU, lowest ask price is{" "}
            {tokenprices?.[currentToken]?.[1] || "0"} QU.
          </Text>
        </HStack>
      </VStack>
      <Orderlist />
      <ConfirmModal
        icon={faCheck}
        isOpen={isOpen}
        onToggle={onToggle}
        onPress={() => handleBuySell(buySellFlag, amount, price, currentToken)}
      >
        <VStack fontSize={"xl"} textAlign={"center"} px={2}>
          <Text>
            Are you really want to buy {amount} {currentToken} as {price} QU
          </Text>
        </VStack>
      </ConfirmModal>
    </VStack>
  );
};

export default Orderbook;
