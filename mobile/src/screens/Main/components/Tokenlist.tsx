import { useAuth } from "@app/context/AuthContext";
import { useColors } from "@app/context/ColorContex";
import { RootState } from "@app/redux/store";
import tokenIcons from "@app/utils/tokens";
import {
  Box,
  Center,
  HStack,
  Icon,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from "native-base";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { AntDesign } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";
interface Balances {
  [address: string]: number;
}
const tokenBalances: {
  [name: string]: Balances;
} = {
  QX: {
    TLEIBEQEXQKJLBQXENQJZLKEZIGAKLVXYSTVDHYEAHRPFJPLFWROUWGBJNIB: 24,
  },
  QWALLET: {
    TLEIBEQEXQKJLBQXENQJZLKEZIGAKLVXYSTVDHYEAHRPFJPLFWROUWGBJNIB: 24,
  },
  QFT: {
    TLEIBEQEXQKJLBQXENQJZLKEZIGAKLVXYSTVDHYEAHRPFJPLFWROUWGBJNIB: 24,
  },
  QTRY: {
    TLEIBEQEXQKJLBQXENQJZLKEZIGAKLVXYSTVDHYEAHRPFJPLFWROUWGBJNIB: 24,
  },
  CFB: {
    TLEIBEQEXQKJLBQXENQJZLKEZIGAKLVXYSTVDHYEAHRPFJPLFWROUWGBJNIB: 24,
  },
  RANDOM: {
    TLEIBEQEXQKJLBQXENQJZLKEZIGAKLVXYSTVDHYEAHRPFJPLFWROUWGBJNIB: 24,
  },
  QUTIL: {
    TLEIBEQEXQKJLBQXENQJZLKEZIGAKLVXYSTVDHYEAHRPFJPLFWROUWGBJNIB: 24,
  },
};

const Tokenlist: React.FC = () => {
  const { textColor, main } = useColors();
  const { currentAddress, isLoading } = useAuth();
  const { tokens, tokenprices, marketcap } = useSelector(
    (store: RootState) => store.app
  );

  const formattedItems = useMemo(() => {
    return tokens?.map((token, key) => {
      const Icon = tokenIcons.find((t) => t.symbol == token)?.icon;
      const balance = tokenBalances?.[token]?.[currentAddress] || 0;
      const price = parseFloat(tokenprices?.[token]?.[0] || "0"); // Handle missing price

      if (balance) {
        const valueInQU = balance * price;
        const usdValue = valueInQU * parseFloat(marketcap.price);

        return (
          <Pressable
            key={key}
            m="2"
            p="2"
            px="4"
            rounded="md"
            bgColor="blueGray.600"
            _pressed={{ opacity: 0.6 }}
          >
            <HStack alignItems="center" justifyContent="space-between">
              <HStack space={4} alignItems="center" flex={1}>
                {Icon && <Icon width={32} height={32} />}
                <VStack flex={1}>
                  <Text>{token}</Text>
                  <Text>{balance.toLocaleString()}</Text>
                </VStack>
              </HStack>
              <VStack>
                <Text>{valueInQU} QU</Text>
                <Text>$ {usdValue.toFixed(2)}</Text>
              </VStack>
            </HStack>
          </Pressable>
        );
      }
      return null; // Avoid empty elements
    });
  }, [tokenBalances, tokenprices, marketcap]);

  return (
    <>
      {isLoading && formattedItems ? (
        <VStack flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color={main.celestialBlue} />
        </VStack>
      ) : Object.keys(tokenBalances).length === 0 ? (
        <VStack flex={1} alignItems="center" justifyContent="center">
          <VStack>
            <Center>
              <Icon as={AntDesign} name="questioncircle" size={20}></Icon>
              <Text color={textColor} fontSize="md" mt="4">
                You haven't got any assets!
              </Text>
            </Center>
          </VStack>
        </VStack>
      ) : (
        <ScrollView px="5" py="2">
          <Box>{formattedItems}</Box>
        </ScrollView>
      )}
    </>
  );
};

export default Tokenlist;
