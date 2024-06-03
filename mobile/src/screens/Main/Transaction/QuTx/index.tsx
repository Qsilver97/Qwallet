import { useAuth } from "@app/context/AuthContext";
import { useColors } from "@app/context/ColorContex";
import { TransactionItem } from "@app/types";
import local from "@app/utils/locales";
import { FontAwesome5, AntDesign } from "@expo/vector-icons";
import {
  Center,
  HStack,
  Icon,
  Pressable,
  ScrollView,
  Text,
  VStack,
  useDisclose,
} from "native-base";
import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import QuTransactionItem from "./QuTransactionItem";
import QuTransactionDetailModal from "./QuTranslationDetailModal";

const index = () => {
  const { histories, isLoading } = useAuth();
  const { textColor, bgColor, main } = useColors();
  const [currentTx, setCurrentTx] = useState<any>([]);
  const [quHistory, setQuHistory] = useState<TransactionItem[]>([]);
  const lang = local.Main.Transaction;

  const { isOpen, onToggle } = useDisclose();

  useEffect(() => {
    const newQuHistory: TransactionItem[] = [];
    histories.forEach((tx) => {
      if (tx[2].includes("BAAAAAAAAAA")) {
      } else if (Math.abs(parseInt(tx[3]))) {
        newQuHistory.push(tx);
      }
    });
    setQuHistory(newQuHistory);
  }, [histories.length]);
  return (
    <>
      <VStack flex={1} space={5} bgColor={bgColor} color={textColor}>
        <VStack flex={1}>
          <HStack justifyContent="center" alignItems="center" space="3" p="2">
            <Icon
              as={FontAwesome5}
              name="history"
              size="3xl"
              color={textColor}
            />
            <Text fontSize="4xl">QU {lang.Transactions}</Text>
          </HStack>
          {isLoading ? (
            <VStack flex={1} alignItems="center" justifyContent="center">
              <ActivityIndicator size="large" color={main.celestialBlue} />
            </VStack>
          ) : (
            <ScrollView
              my={3}
              flex={1}
              contentContainerStyle={{
                flexGrow: 1,
              }}
            >
              {quHistory.reverse().length ? (
                <VStack flex={1}>
                  {quHistory.map((tx, key) => (
                    <Pressable
                      key={key}
                      onPress={() => {
                        setCurrentTx(tx);
                        onToggle();
                      }}
                      _pressed={{ opacity: 0.7 }}
                    >
                      <QuTransactionItem
                        transaction={tx}
                        index={key + 1}
                        // scTx={scTx[tx[1]]}
                      />
                    </Pressable>
                  ))}
                </VStack>
              ) : (
                <VStack flex={1} alignItems="center" justifyContent="center">
                  <Center>
                    <Icon as={AntDesign} name="questioncircle" size={20}></Icon>
                    <Text
                      color={textColor}
                      fontSize="md"
                      mt="4"
                      textAlign="center"
                    >
                      {lang.NoTransactionHistory}
                    </Text>
                  </Center>
                </VStack>
              )}
            </ScrollView>
          )}
        </VStack>
      </VStack>
      <QuTransactionDetailModal
        isOpen={isOpen}
        onToggle={onToggle}
        transaction={currentTx}
      />
    </>
  );
};

export default index;
