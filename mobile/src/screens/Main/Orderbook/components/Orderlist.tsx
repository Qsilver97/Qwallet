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
} from "native-base";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";

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

  useEffect(() => {
    setIsLoading(true);
    Object.keys(orderData).map((token) => {
      orderData[token].bids.map((bid) => {
        if (allAddresses[bid[0]] == currentAddress)
          setShowData((prev) => {
            return [...prev, [token, bid[2], bid[3], "bid"]];
          });
      });
      orderData[token].asks.map((ask) => {
        if (allAddresses[ask[0]] == currentAddress)
          setShowData((prev) => {
            return [...prev, [token, ask[2], ask[3], "ask"]];
          });
      });
    });
    setIsLoading(false);
  }, [orderData, currentAddress]);

  const Item = useMemo(() => {
    return (
      <>
        {showData?.map((dt, key) => {
          const Icon = tokenIcons.find((t) => t.symbol == dt[0])?.icon;
          return (
            <Pressable key={key} _pressed={{ opacity: 0.7 }}>
              <HStack
                space={2}
                textAlign="center"
                rounded="md"
                bgColor="blueGray.600"
                p="2"
                m="1"
              >
                <HStack alignItems="center" space="2">
                  <Box w="1/4">{Icon && <Icon width={32} height={32} />}</Box>
                  <Text w="1/3">
                    {dt[1]} {dt[0]}
                  </Text>
                  <Text w="1/3">{dt[2]} QU</Text>
                </HStack>
              </HStack>
            </Pressable>
          );
        })}
      </>
    );
  }, [showData]);

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

  return (
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
          My Order List
        </Text>
      </HStack>

      <ScrollView w="full" textAlign="center">
        {isLoading && Item ? (
          <VStack flex={1} alignItems="center" justifyContent="center">
            <ActivityIndicator size="large" color={main.celestialBlue} />
          </VStack>
        ) : showData.length ? (
          Item
        ) : (
          <VStack flex={1} alignItems="center" justifyContent="center">
            <VStack>
              <Center>
                <Icon as={AntDesign} name="questioncircle" size={20}></Icon>
                <Text color={textColor} fontSize="md" mt="4" textAlign="center">
                  You haven't got any buy/sell orders in this address!
                </Text>
              </Center>
            </VStack>
          </VStack>
        )}
      </ScrollView>
    </VStack>
  );
};

export default Orderlist;
