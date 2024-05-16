import React, { useEffect, useState } from "react";
import { useAuth } from "@app/context/AuthContext";
import { useColors } from "@app/context/ColorContex";
import { Pressable, ScrollView, Text, VStack, useDisclose } from "native-base";
import TransactionItem from "./TransactionItem";
import TransactionDetailModal from "./TranslationDetailModal";

const Transaction: React.FC = () => {
  const { histories, currentAddress } = useAuth();
  const { textColor, bgColor, main } = useColors();
  const { isOpen, onToggle } = useDisclose();
  const [currentTx, setCurrentTx] = useState<any>([]);
  
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
        <VStack>
          <Text fontSize="3xl" textAlign="center">
            Transactions
          </Text>
          <ScrollView my={5}>
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
          </ScrollView>
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
