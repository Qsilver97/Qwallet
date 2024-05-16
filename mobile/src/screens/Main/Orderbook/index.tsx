import { buySell } from "@app/api/api";
import Input from "@app/components/UI/Input";
import { useAuth } from "@app/context/AuthContext";
import { useColors } from "@app/context/ColorContex";
import { RootState } from "@app/redux/store";
import {
  faCheck,
  faMinus,
  faPlus,
  faShare,
} from "@fortawesome/free-solid-svg-icons";
import { FormControl, HStack, Text, VStack, useDisclose } from "native-base";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import ConfirmModal from "../components/ConfirmModal";
import TokenSelect from "../components/TokenSelect";
import TransferButton from "../components/TransferButton";
import Orderlist from "./components/Orderlist";

const Orderbook: React.FC = () => {
  const { bgColor, textColor } = useColors();
  const { tokenprices, tick } = useSelector((store: RootState) => store.app);
  const { user, currentAddress, txId, txResult, txStatus, expectedTick } =
    useAuth();
  const [currentToken, setCurrentToken] = useState<string>("QWALLET");
  const [amount, setAmount] = useState<string>("0");
  const [price, setPrice] = useState<string>("0");
  const [buySellFlag, setBuySellFlag] = useState<
    "buy" | "sell" | "cancelbuy" | "cancelsell"
  >("buy");
  const modal1 = useDisclose();
  const modal2 = useDisclose();

  const handleBuySell = (
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
      parseInt(tick) + 10,
      currentToken
    );
  };

  return (
    <>
      <VStack
        flex={1}
        justifyContent="around"
        py="5"
        space={5}
        bgColor={bgColor}
        color={textColor}
      >
        <VStack px="5">
          <Text fontSize="3xl" color={textColor} textAlign="center">
            Orderbook
          </Text>
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
                  modal1.onToggle();
                }}
              ></TransferButton>
              <TransferButton
                icon={faMinus}
                title="SELL"
                onPress={() => {
                  setBuySellFlag("sell");
                  modal1.onToggle();
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
        <VStack flex={1}>
          <Orderlist />
        </VStack>
      </VStack>
      <ConfirmModal
        icon={faCheck}
        isOpen={modal1.isOpen}
        onToggle={modal1.onToggle}
        onPress={() => {
          handleBuySell(buySellFlag, amount, price, currentToken);
          modal2.onToggle();
        }}
      >
        <VStack fontSize={"xl"} textAlign={"center"} px={2}>
          <Text>
            Are you really want to buy {amount} {currentToken} as {price} QU
          </Text>
        </VStack>
      </ConfirmModal>
      <ConfirmModal
        icon={txStatus == "Success" ? faCheck : faShare}
        isOpen={modal2.isOpen}
        onToggle={modal2.onToggle}
        onPress={() => {
          modal1.onToggle();
          modal2.onToggle();
        }}
      >
        <VStack fontSize={"xl"} textAlign={"center"} px={2}>
          <FormControl>
            <FormControl.Label>Status</FormControl.Label>
            <Text ml={3}>{txStatus}</Text>
          </FormControl>
          <FormControl>
            <FormControl.Label>Transaction ID</FormControl.Label>
            <Text ml={3}>{txId}</Text>
          </FormControl>
          <FormControl>
            <FormControl.Label>Current Tick</FormControl.Label>
            <Text ml={3}>{tick}</Text>
          </FormControl>
          <FormControl>
            <FormControl.Label>Expected Tick</FormControl.Label>
            <Text ml={3}>{expectedTick}</Text>
          </FormControl>
        </VStack>
      </ConfirmModal>
    </>
  );
};

export default Orderbook;
