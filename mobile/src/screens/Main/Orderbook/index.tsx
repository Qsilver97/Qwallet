import React, { useEffect, useState } from "react";
import {
  FormControl,
  HStack,
  ScrollView,
  Text,
  VStack,
  useDisclose,
} from "native-base";
import { useColors } from "@app/context/ColorContex";
import TokenSelect from "../components/TokenSelect";
import TransferButton from "../components/TransferButton";
import {
  faCheck,
  faMinus,
  faPlus,
  faShare,
} from "@fortawesome/free-solid-svg-icons";
import Input from "@app/components/UI/Input";
import { buySell, myOrders } from "@app/api/api";
import { useSelector } from "react-redux";
import { RootState, store } from "@app/redux/store";
import { useAuth } from "@app/context/AuthContext";
import eventEmitter from "@app/api/eventEmitter";
import ConfirmModal from "../components/ConfirmModal";

const Orderbook: React.FC = () => {
  const { bgColor, textColor } = useColors();
  const { tokenprices, tick } = useSelector((store: RootState) => store.app);
  const { user, currentAddress } = useAuth();
  const [currentToken, setCurrentToken] = useState<string>("QWALLET");
  const [amount, setAmount] = useState<string>("0");
  const [price, setPrice] = useState<string>("0");
  const [orderBookTab, setOrderBookTab] = useState<"Bid" | "Ask">("Bid");
  const [orderData, setOrderData] = useState({});
  const [buySellFlag, setBuySellFlag] = useState<
    "buy" | "sell" | "cancelbuy" | "cancelsell"
  >("buy");
  const { isOpen, onToggle } = useDisclose();

  useEffect(() => {
    myOrders();

    eventEmitter.on("S2C/my-orders", (res) => {
      console.log(res.data?.QWALLET);
      setOrderData(res.data);
    });
  }, []);

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
        <HStack w="full" textAlign="center" space="2">
          <Input
            type="text"
            onChangeText={(text) => {
              setAmount(text);
            }}
            placeholder="Input Amount"
            label={`Amount of ${currentToken}`}
            w="full"
            parentProps={{ w: "1/2" }}
          ></Input>
          <Input
            type="text"
            onChangeText={(text) => {
              setPrice(text);
            }}
            placeholder="Input Price"
            label={`Price of ${currentToken}`}
            w="full"
            parentProps={{ w: "1/2" }}
          ></Input>
        </HStack>
        <HStack w="full">
          <Text textAlign="center" fontSize="md">
            Currently the highest bid price of {currentToken} is{" "}
            {tokenprices?.[currentToken]?.[0]} QU, lowest ask price is{" "}
            {tokenprices?.[currentToken]?.[1]} QU.
          </Text>
        </HStack>
        <HStack w={"full"} justifyContent={"center"} space={4}>
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
        </HStack>
      </VStack>
      <VStack
        flex={1}
        justifyItems="center"
        justifyContent="end"
        space={5}
        bgColor={bgColor}
        color={textColor}
      >
        <Text fontSize="2xl" textAlign="center">
          My Order List
        </Text>
        <ScrollView w="full" textAlign="center">
          {Object.keys(orderData).map((token) => {
            let showData;
            if (orderBookTab == "Bid") showData = orderData[token].bids;
            else showData = orderData[token].asks;
            if (showData.length)
              return (
                <HStack
                  key={token}
                  space={2}
                  textAlign="center"
                  rounded="xl"
                  bgColor="blueGray.600"
                  p="3"
                  m="2"
                >
                  {showData.map(
                    (dt: any, key: number) =>
                      currentAddress == dt[1] && (
                        <HStack key={key}>
                          <VStack></VStack>
                          <VStack></VStack>
                          <Text w="1/3">{token}</Text>
                          <Text w="1/3">
                            {dt[2]} {token}
                          </Text>
                          <Text w="1/3">{dt[3]} QU</Text>
                        </HStack>
                      )
                  )}
                </HStack>
              );
          })}
        </ScrollView>
      </VStack>

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
