import React, { useEffect, useState } from "react";
import { HStack, ScrollView, Text, VStack } from "native-base";
import { useColors } from "@app/context/ColorContex";
import { useAuth } from "@app/context/AuthContext";
import { myOrders } from "@app/api/api";
import eventEmitter from "@app/api/eventEmitter";

type IOrder = [string, string, string, string]; // token, amount, price, type
type IOrderUnit = [number, string, string, string]; // index, address, amount, price
interface IOrderData {
  [tokenName: string]: {
    bids: IOrderUnit[];
    asks: IOrderUnit[];
  };
}

const Orderlist: React.FC = () => {
  const { textColor, bgColor } = useColors();
  const { currentAddress, allAddresses } = useAuth();
  const [orderData, setOrderData] = useState<IOrderData>({});
  const [showData, setShowData] = useState<IOrder[]>([]);

  useEffect(() => {
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
  }, [orderData, currentAddress]);

  useEffect(() => {
    myOrders();
    eventEmitter.on("S2C/my-orders", (res) => {
      setOrderData(res.data);
    });
  }, []);

  return (
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
        {showData.length ? (
          showData.map((dt, key) => {
            return (
              <HStack
                key={key}
                space={2}
                textAlign="center"
                rounded="xl"
                bgColor="blueGray.600"
                p="3"
                m="2"
              >
                <HStack>
                  <VStack></VStack>
                  <VStack></VStack>
                  <Text w="1/3">{dt[0]}</Text>
                  <Text w="1/3">
                    {dt[1]} {dt[0]}
                  </Text>
                  <Text w="1/3">{dt[2]} QU</Text>
                </HStack>
              </HStack>
            );
          })
        ) : (
          <VStack>
            <Text>You dont have got any orders now!</Text>
          </VStack>
        )}
      </ScrollView>
    </VStack>
  );
};

export default Orderlist;
