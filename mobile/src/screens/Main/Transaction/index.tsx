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
import React, { useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";
import TransactionItem from "./TransactionItem";
import TransactionDetailModal from "./TranslationDetailModal";
import local from "@app/utils/locales";
import { AntDesign } from "@expo/vector-icons";

const Transaction: React.FC = () => {
  const { histories, isLoading } = useAuth();
  const { textColor, bgColor, main } = useColors();
  const { isOpen, onToggle } = useDisclose();
  const [currentTx, setCurrentTx] = useState<any>([]);
  const lang = local.Main.Transaction;

  const Item = useMemo(() => {
    return (
      <>
        {histories.length ? (
          <VStack flex={1}>
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
          </VStack>
        ) : (
          <VStack flex={1} alignItems="center" justifyContent="center">
            <Center>
              <Icon as={AntDesign} name="questioncircle" size={20}></Icon>
              <Text color={textColor} fontSize="md" mt="4" textAlign="center">
                {lang.NoTransactionHistory}
              </Text>
            </Center>
          </VStack>
        )}
      </>
    );
  }, [histories]);

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
          {isLoading && Item ? (
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
              {Item}
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
