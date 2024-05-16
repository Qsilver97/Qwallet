import { useAuth } from "@app/context/AuthContext";
import { RootState } from "@app/redux/store";
import tokenIcons from "@app/utils/tokens";
import { Box, HStack, Pressable, ScrollView, Text, VStack } from "native-base";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";

const tokenBalances = {
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
  const { currentAddress } = useAuth();
  const { tokens, tokenprices, marketcap } = useSelector(
    (store: RootState) => store.app
  );

  const formattedItems = useMemo(() => {
    if (!tokenBalances || Object.keys(tokenBalances).length === 0) {
      return <Text>You haven't got any assets!</Text>;
    }

    return tokens.map((token, key) => {
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
  }, [tokenBalances, currentAddress, tokens, tokenprices, marketcap]);

  return (
    <ScrollView px="5" py="2">
      <Box>{formattedItems}</Box>
    </ScrollView>
  );
};

export default Tokenlist;
