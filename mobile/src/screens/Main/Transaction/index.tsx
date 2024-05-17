import { useAuth } from "@app/context/AuthContext";
import { useColors } from "@app/context/ColorContex";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  HStack,
  Icon,
  Pressable,
  ScrollView,
  Text,
  VStack,
  useDisclose,
} from "native-base";
import React, { useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";
import TransactionItem from "./TransactionItem";
import TransactionDetailModal from "./TranslationDetailModal";
import local from "@app/utils/locales";


const Transaction: React.FC = () => {
  const { histories, isLoading } = useAuth();
  const { textColor, bgColor, main } = useColors();
  const { isOpen, onToggle } = useDisclose();
  const [currentTx, setCurrentTx] = useState<any>([]);
  const lang = local.Main.Transaction;

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
        space={5}
        bgColor={bgColor}
        color={textColor}
      >
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
