import React, { useMemo, useState } from "react";
import { useAuth } from "@app/context/AuthContext";
import { useColors } from "@app/context/ColorContex";
import { Pressable, ScrollView, Text, VStack, useDisclose } from "native-base";
import TransactionItem from "./TransactionItem";
import TransactionDetailModal from "./TranslationDetailModal";
import { ActivityIndicator } from "react-native";

const Transaction: React.FC = () => {
  const { histories, isLoading } = useAuth();
  const { textColor, bgColor, main } = useColors();
  const { isOpen, onToggle } = useDisclose();
  const [currentTx, setCurrentTx] = useState<any>([]);

  const Item = useMemo(() => {
    return (
      <>
        {histories?.map((tx, key) => (
          <Pressable
            key={key}
            onPress={() => {
              setCurrentTx(tx);
              onToggle();
            }}
            _pressed={{ opacity: 0.7 }}
          >
            <TransactionItem transaction={tx} />
          </Pressable>
        ))}
      </>
    );
  }, [histories]);

  return (
    <>
      <VStack
        flex={1}
        justifyContent="around"
        py="10"
        space={5}
        bgColor={bgColor}
        color={textColor}
      >
        <VStack flex={1}>
          <Text fontSize="3xl" textAlign="center">
            Transactions
          </Text>
          {isLoading && Item ? (
            <VStack flex={1} alignItems="center" justifyContent="center">
              <ActivityIndicator size="large" color={main.celestialBlue} />
            </VStack>
          ) : (
            <ScrollView my={3}>{Item}</ScrollView>
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
