import { useAuth } from "@app/context/AuthContext";
import { useColors } from "@app/context/ColorContex";
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
import React, { useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";
import QxTransactionItem from "./QxTransactionItem";
import QxTransactionDetailModal from "./QxTransactionDetailModal";

const index = () => {
  const { isLoading, qxHistories } = useAuth();
  const { textColor, main, bgColor } = useColors();
  const [currentTx, setCurrentTx] = useState<any>([]);
  const lang = local.Main.Transaction;

  const { isOpen, onToggle } = useDisclose();

  const Item = useMemo(() => {
    return (
      <>
        {qxHistories.reverse().map((tx, key) => (
          <Pressable
            key={key}
            onPress={() => {
              setCurrentTx(tx);
              onToggle();
            }}
            _pressed={{ opacity: 0.7 }}
          >
            <QxTransactionItem tx={tx} index={key + 1} />
          </Pressable>
        ))}
      </>
    );
  }, [qxHistories]);

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
            <Text fontSize="4xl">QX {lang.Transactions}</Text>
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
              {Item}
            </ScrollView>
          )}
        </VStack>
      </VStack>
      <QxTransactionDetailModal
        isOpen={isOpen}
        onToggle={onToggle}
        tx={currentTx}
      />
    </>
  );
};

export default index;
