import { useAuth } from "@app/context/AuthContext";
import { useColors } from "@app/context/ColorContex";
import { RootState } from "@app/redux/store";
import { FontAwesome5 } from "@expo/vector-icons";
import { HStack, Icon, Text, VStack } from "native-base";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import Tokenlist from "../components/Tokenlist";

const Home: React.FC = () => {
  const { balances, currentAddress } = useAuth();
  const { marketcap } = useSelector((store: RootState) => store.app);
  const { bgColor, textColor, main } = useColors();

  const BalanceItem = useMemo(() => {
    return (
      <VStack>
        <HStack justifyContent="center" alignItems="center" space="3" p="2">
          <Icon as={FontAwesome5} name="wallet" size="3xl" color={textColor} />
          <Text fontSize="4xl">My Wallet</Text>
        </HStack>
        <Text fontSize="3xl" textAlign="center">
          ${" "}
          {(
            balances[currentAddress] * parseFloat(marketcap.price) || 0
          ).toFixed(3)}
          {"\n"}
          {balances[currentAddress] || 0} QU
        </Text>
      </VStack>
    );
  }, [balances, currentAddress, marketcap.price]);

  return (
    <VStack flex={1} space={2} bgColor={bgColor} color={textColor}>
      <VStack>{BalanceItem}</VStack>
      <VStack w="full" flex={1} py="2">
        <HStack alignItems="center" space="3" px="4">
          <Icon as={FontAwesome5} name="coins" size="2xl" color={textColor} />
          <Text fontSize="2xl">My All Assets</Text>
        </HStack>
        <VStack flex={1} mt="2">
          <Tokenlist />
        </VStack>
      </VStack>
    </VStack>
  );
};

export default Home;
