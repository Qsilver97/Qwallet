import { useAuth } from "@app/context/AuthContext";
import { useColors } from "@app/context/ColorContex";
import { FontAwesome5 } from "@expo/vector-icons";
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
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";
import TransactionDetailModal from "./TranslationDetailModal";
import local from "@app/utils/locales";
import { AntDesign } from "@expo/vector-icons";
import { IScTx, TransactionItem } from "@app/types";
import QuTransactionItem from "./QuTx/QuTransactionItem";
import QxTransactionItem from "./QxTx/QxTransactionItem";
import eventEmitter from "@app/api/eventEmitter";
import { txFetch } from "@app/api/api";

const Transaction: React.FC = () => {
  const { histories, isLoading, setIsLoading } = useAuth();
  const { textColor, bgColor, main } = useColors();
  const { isOpen, onToggle } = useDisclose();
  const [currentTx, setCurrentTx] = useState<any>([]);
  const [quHistory, setQuHistory] = useState<TransactionItem[]>([]);
  const [qxHistory, setQxHistory] = useState<TransactionItem[]>([]);
  const [scTx, setScTx] = useState<{ [txid: string]: IScTx }>({});

  const lang = local.Main.Transaction;

  // useEffect(() => {
  //   const updateQxHistory = (res: any) => {
  //     for (const tx of res) {
  //       if (tx.sctx)
  //         setScTx((prev) => {
  //           return { ...prev, [tx.txid]: tx.sctx };
  //         });
  //     }
  //     setIsLoading(false)
  //     console.log("SCTX\n: ", scTx)
  //   };
  //   eventEmitter.on("S2C/tx-fetch", updateQxHistory);
  //   return () => {
  //     eventEmitter.off("S2C/tx-fetch", updateQxHistory);
  //   };
  // }, []);

  useEffect(() => {
    const newQuHistory: TransactionItem[] = [];
    const newQxHistory: TransactionItem[] = [];
    const txids: string[] = [];
    histories.forEach((tx) => {
      if (tx[2].includes("BAAAAAAAAAA")) {
        txids.push(tx[1]);
        newQxHistory.push(tx);
      } else if (Math.abs(parseInt(tx[3]))) {
        newQuHistory.push(tx);
      }
    });
    txFetch(txids);
    setQxHistory(newQxHistory);
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
            <Text fontSize="4xl">{lang.Transactions}</Text>
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
              {quHistory.length ? (
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
      <TransactionDetailModal
        isOpen={isOpen}
        onToggle={onToggle}
        transaction={currentTx}
      />
    </>
  );
};

export default Transaction;
