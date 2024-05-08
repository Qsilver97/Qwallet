import React from "react";
import { Box, HStack, ScrollView, Text, VStack, View } from "native-base";

const tokenlist = [
  { name: "QU", amount: "23.3", percent: "71.68" },
  { name: "QTRY", amount: "23.3", percent: "71.68" },
  { name: "RANDOM", amount: "23.3", percent: "71.68" },
  { name: "QUTIL", amount: "23.3", percent: "71.68" },
  { name: "QFT", amount: "23.3", percent: "71.68" },
  { name: "RANDOM", amount: "23.3", percent: "71.68" },
  { name: "CFB", amount: "23.3", percent: "71.68" },
];

const colorOrder = ["#CC50FD", "#60FF9B", "#F0447A", "#CA55FD", "#50D9A6"];
const Tokenlist: React.FC = () => {
  return (
    <ScrollView pt={20}>
      {tokenlist.map((token, key) => {
        return (
          <HStack key={key} px={10} space={4}>
            <VStack flex={1}>
              <Text>{token.name}</Text>
              <Box bgColor={colorOrder[key % 5]} h={2} rounded={"sm"}>
                {" "}
              </Box>
            </VStack>
            <VStack>
              <Text>$ {token.amount}B</Text>
              <Text>{token.percent} %</Text>
            </VStack>
          </HStack>
        );
      })}
    </ScrollView>
  );
};

export default Tokenlist;
