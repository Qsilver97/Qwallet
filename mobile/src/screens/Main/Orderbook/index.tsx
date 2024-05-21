import Input from "@app/components/UI/Input";
import { useColors } from "@app/context/ColorContex";
import { RootState } from "@app/redux/store";
import local from "@app/utils/locales";
import { FontAwesome5 } from "@expo/vector-icons";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { HStack, Icon, Text, VStack, useDisclose } from "native-base";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import TokenSelect from "../components/TokenSelect";
import TransferButton from "../components/TransferButton";
import Core from "./components/Core";
import Orderlist from "./components/Orderlist";

const Orderbook: React.FC = () => {
  const { bgColor, textColor } = useColors();
  const { tokenprices } = useSelector((store: RootState) => store.app);
  const [currentToken, setCurrentToken] = useState<string>("QWALLET");
  const [amount, setAmount] = useState<string>("0");
  const [price, setPrice] = useState<string>("0");
  const [buySellFlag, setBuySellFlag] = useState<
    "buy" | "sell" | "cancelbuy" | "cancelsell"
  >("buy");
  const modal1 = useDisclose();
  const lang = local.Main.Orderbook;

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
          <HStack py="2">
            <VStack w="3/4" textAlign="center">
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
                parentProps={{ w: "full" }}
              ></Input>
            </VStack>
            <VStack w={"1/4"} justifyContent="flex-end" space={2}>
              <TransferButton
                icon={faPlus}
                title={lang.Buy}
                onPress={() => {
                  setBuySellFlag("buy");
                  modal1.onToggle();
                }}
              ></TransferButton>
              <TransferButton
                icon={faMinus}
                title={lang.Sell}
                onPress={() => {
                  setBuySellFlag("sell");
                  modal1.onToggle();
                }}
              ></TransferButton>
            </VStack>
          </HStack>

          <HStack w="full">
            <Text textAlign="center" fontSize="md">
              {lang.HighestBidPrice.replace("{currentToken}", currentToken)
                .replace("{price}", tokenprices?.[currentToken]?.[0] || "0")
                .replace("{price}", tokenprices?.[currentToken]?.[1] || "0")}
            </Text>
          </HStack>
        </VStack>
        <VStack flex={1}>
          <Orderlist />
        </VStack>
      </VStack>
      <Core
        isOpen={modal1.isOpen}
        onToggle={modal1.onToggle}
        amount={amount}
        price={price}
        buySellFlag={buySellFlag}
        token={currentToken}
        confirmText={lang.ConfirmBuy}
      />
    </>
  );
};

export default Orderbook;
