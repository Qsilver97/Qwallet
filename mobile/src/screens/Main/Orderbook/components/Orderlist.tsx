import { myOrders } from "@app/api/api";
import eventEmitter from "@app/api/eventEmitter";
import { useAuth } from "@app/context/AuthContext";
import { useColors } from "@app/context/ColorContex";
import tokenIcons from "@app/utils/tokens";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import {
  Box,
  Center,
  HStack,
  Icon,
  Pressable,
  ScrollView,
  Text,
  VStack,
  useDisclose,
} from "native-base";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";
import local from "@app/utils/locales";
import Core from "./Core";

type IOrder = [string, string, string, string]; // token, amount, price, type
type IOrderUnit = [number, string, string, string]; // index, address, amount, price
interface IOrderData {
  [tokenName: string]: {
    bids: IOrderUnit[];
    asks: IOrderUnit[];
  };
}

const Orderlist: React.FC = () => {
  const { textColor, bgColor, main } = useColors();
  const { currentAddress, allAddresses, isLoading, setIsLoading } = useAuth();
  const [orderData, setOrderData] = useState<IOrderData>({});
  const [showData, setShowData] = useState<IOrder[]>([]);
  const lang = local.Main.Orderbook;
  const { panelBgColor } = useColors();
  const [currentToken, setCurrentToken] = useState<string>("QWALLET");
  const [amount, setAmount] = useState<string>("0");
  const [price, setPrice] = useState<string>("0");
  const [buySellFlag, setBuySellFlag] = useState<
    "buy" | "sell" | "cancelbuy" | "cancelsell"
  >("buy");

  useEffect(() => {
    setIsLoading(true);
    Object.keys(orderData).map((token) => {
      orderData[token].bids.map((bid) => {
        if (allAddresses[bid[0]] == currentAddress)
          setShowData((prev) => {
            return [...prev, [token, bid[2], bid[3], "buy"]];
          });
      });
      orderData[token].asks.map((ask) => {
        if (allAddresses[ask[0]] == currentAddress)
          setShowData((prev) => {
            return [...prev, [token, ask[2], ask[3], "sell"]];
          });
      });
    });
    setIsLoading(false);
  }, [orderData, currentAddress]);

  const Item = useMemo(() => {
    return (
      <>
        {showData?.map((dt, key) => {
          const TokenIcon = tokenIcons.find((t) => t.symbol == dt[0])?.icon;
          return (
            <Pressable key={key} _pressed={{ opacity: 0.7 }}>
              <HStack
                space={2}
                textAlign="center"
                rounded="md"
                bgColor={panelBgColor}
                p="2"
                m="1"
              >
                <HStack alignItems="center" space="2" px="4">
                  {TokenIcon && <TokenIcon width={32} height={32} />}
                  <Text w="1/3">
                    {dt[1]} {dt[0]}
                  </Text>
                  <Text w="1/3">{dt[2]} QU</Text>
                  <Pressable
                    _pressed={{ opacity: 0.6 }}
                    onPress={() => {
                      modal.onToggle();
                      //@ts-ignore
                      setBuySellFlag(`cancel${dt[3]}`);
                      setAmount(dt[1]);
                      setCurrentToken(dt[0]);
                      setPrice(dt[2]);
                    }}
                  >
                    <Icon
                      as={AntDesign}
                      name="closecircle"
                      size="lg"
                      color="red.500"
                    />
                  </Pressable>
                </HStack>
              </HStack>
            </Pressable>
          );
        })}
      </>
    );
  }, [showData, panelBgColor]);

  useEffect(() => {
    myOrders();
    setShowData([]);
    const handleMyOrdersEvent = (res: any) => {
      setOrderData(res.data);
    };
    eventEmitter.on("S2C/my-orders", handleMyOrdersEvent);
    return () => {
      eventEmitter.off("S2C/my-orders", handleMyOrdersEvent);
    };
  }, [currentAddress]);
  const modal = useDisclose();

  return (
    <>
      <VStack
        flex={1}
        justifyItems="center"
        justifyContent="end"
        space={5}
        bgColor={bgColor}
        color={textColor}
      >
        <HStack justifyContent="center" space="2">
          <Icon as={FontAwesome} name="list" size="2xl" color={textColor} />
          <Text fontSize="2xl" textAlign="center">
            {lang.MyOrderList}
          </Text>
        </HStack>

        {isLoading && Item ? (
          <VStack flex={1} alignItems="center" justifyContent="center">
            <ActivityIndicator size="large" color={main.celestialBlue} />
          </VStack>
        ) : showData.length ? (
          <ScrollView w="full" textAlign="center">
            {Item}
          </ScrollView>
        ) : (
          <VStack flex={1} alignItems="center" justifyContent="center">
            <Center>
              <Icon as={AntDesign} name="questioncircle" size={20}></Icon>
              <Text color={textColor} fontSize="md" mt="4" textAlign="center">
                {lang.NoOrders}
              </Text>
            </Center>
          </VStack>
        )}
      </VStack>
      <Core
        isOpen={modal.isOpen}
        onToggle={modal.onToggle}
        amount={amount}
        price={price}
        buySellFlag={buySellFlag}
        token={currentToken}
        confirmText={"Do you really want to cancel this order?"}
      />
    </>
  );
};

export default Orderlist;
