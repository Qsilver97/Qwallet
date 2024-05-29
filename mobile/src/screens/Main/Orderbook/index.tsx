import { myOrders } from "@app/api/api";
import eventEmitter from "@app/api/eventEmitter";
import Input from "@app/components/UI/Input";
import { useAuth } from "@app/context/AuthContext";
import { useColors } from "@app/context/ColorContex";
import { RootState } from "@app/redux/store";
import local from "@app/utils/locales";
import { FontAwesome5, AntDesign } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import {
  HStack,
  Icon,
  KeyboardAvoidingView,
  Text,
  VStack,
  useDisclose,
} from "native-base";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import TokenSelect from "../components/TokenSelect";
import TransferButton from "../components/TransferButton";
import Core from "./components/Core";
import Orderlist from "./components/Orderlist";
import { IOrderData } from "@app/types";

const Orderbook: React.FC = () => {
  const { bgColor, textColor } = useColors();
  const { tokenprices } = useSelector((store: RootState) => store.app);
  const [currentToken, setCurrentToken] = useState<string>("QWALLET");
  const [amount, setAmount] = useState<string>("0");
  const [price, setPrice] = useState<string>("0");
  const [buySellFlag, setBuySellFlag] = useState<
    "buy" | "sell" | "cancelbuy" | "cancelsell"
  >("buy");
  const [orderData, setOrderData] = useState<IOrderData>({});
  const modal1 = useDisclose();
  const lang = local.Main.Orderbook;
  const { currentAddress, txStatus } = useAuth();

  useEffect(() => {
    myOrders();
  }, [currentAddress, txStatus.result, useIsFocused()]);

  useEffect(() => {
    const handleMyOrdersEvent = (res: any) => {
      setOrderData(res.data);
    };
    eventEmitter.on("S2C/my-orders", handleMyOrdersEvent);
    return () => {
      eventEmitter.off("S2C/my-orders", handleMyOrdersEvent);
    };
  }, []);

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
          <HStack justifyContent="center" alignItems="center" space="3" p="2">
            <Icon
              as={FontAwesome5}
              name="book-open"
              size="3xl"
              color={textColor}
            />
            <Text fontSize="4xl">{lang.Orderbook}</Text>
          </HStack>
          <TokenSelect
            selectedToken={currentToken}
            onChange={setCurrentToken}
          ></TokenSelect>
          <KeyboardAvoidingView behavior="height">
            <HStack py="2">
              <VStack w="4/5" textAlign="center">
                <Input
                  type="text"
                  onChangeText={(text) => {
                    setAmount(text);
                  }}
                  placeholder={lang.InputAmount}
                  label={lang.AmountOfToken.replace(
                    "{currentToken}",
                    currentToken
                  )}
                  w="full"
                  keyboardType="numeric"
                  parentProps={{ w: "full" }}
                ></Input>
                <Input
                  type="text"
                  onChangeText={(text) => {
                    setPrice(text);
                  }}
                  placeholder={lang.InputPrice}
                  label={lang.PriceOfToken.replace(
                    "{currentToken}",
                    currentToken
                  )}
                  w="full"
                  keyboardType="numeric"
                  parentProps={{ w: "full" }}
                ></Input>
              </VStack>
              <VStack
                w={"1/5"}
                justifyContent="flex-end"
                alignItems="center"
                py="2"
              >
                <TransferButton
                  icon={
                    <Icon
                      as={AntDesign}
                      name="plus"
                      size="xl"
                      color="white"
                    ></Icon>
                  }
                  title={lang.Buy}
                  onPress={() => {
                    setBuySellFlag("buy");
                    modal1.onToggle();
                  }}
                ></TransferButton>
                <TransferButton
                  icon={
                    <Icon
                      as={AntDesign}
                      name="minus"
                      size="xl"
                      color="white"
                    ></Icon>
                  }
                  title={lang.Sell}
                  onPress={() => {
                    setBuySellFlag("sell");
                    modal1.onToggle();
                  }}
                ></TransferButton>
              </VStack>
            </HStack>
          </KeyboardAvoidingView>

          <HStack w="full">
            <Text textAlign="center" fontSize="md">
              {lang.HighestBidPrice.replace("{currentToken}", currentToken)
                .replace(
                  "{high_price}",
                  tokenprices?.[currentToken]?.[0] || "0"
                )
                .replace(
                  "{low_price}",
                  tokenprices?.[currentToken]?.[1] || "0"
                )}
            </Text>
          </HStack>
        </VStack>
        <VStack flex={1}>
          <Orderlist orderData={orderData} />
        </VStack>
      </VStack>
      <Core
        isOpen={modal1.isOpen}
        onToggle={modal1.onToggle}
        amount={amount}
        price={price}
        buySellFlag={buySellFlag}
        token={currentToken}
        orderData={orderData}
      />
    </>
  );
};

export default Orderbook;
