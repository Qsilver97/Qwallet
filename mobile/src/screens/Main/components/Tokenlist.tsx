import { useAuth } from "@app/context/AuthContext";
import { useColors } from "@app/context/ColorContex";
import { RootState } from "@app/redux/store";
import tokenIcons from "@app/utils/tokens";
import { AntDesign } from "@expo/vector-icons";
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
import { ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import local from "@app/utils/locales";

const Tokenlist: React.FC = () => {
  const { textColor, main, panelBgColor } = useColors();
  const { currentAddress, isLoading, tokenBalances } = useAuth();
  const { tokens, tokenprices, marketcap } = useSelector(
    (store: RootState) => store.app
  );
  const lang = local.Main.Components;

  const formattedItems = useMemo(() => {
    return (
      <>
        {tokens?.map((token, key) => {
          const TokenIcon = tokenIcons.find((t) => t.symbol == token)?.icon;
          const balance = tokenBalances?.[token]?.[currentAddress] || 0;
          const price = parseInt(tokenprices?.[token]?.[0] || "0"); // Handle missing price

          const valueInQU = balance * price;
          const usdValue = valueInQU * parseFloat(marketcap.price);

          return (
            <Pressable
              key={key}
              m="1"
              p="1"
              px="4"
              rounded="md"
              bgColor={panelBgColor}
              _pressed={{ opacity: 0.6 }}
            >
              <HStack alignItems="center" justifyContent="space-between">
                <HStack space={4} alignItems="center" flex={1}>
                  {TokenIcon && <TokenIcon width={32} height={32} />}
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
        })}
      </>
    );
  }, [tokenBalances, tokenprices, marketcap, tokens]);

  return (
    <>
      {isLoading ? (
        <VStack flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color={main.celestialBlue} />
        </VStack>
      ) : Object.keys(tokenBalances).length === 0 ? (
        <VStack flex={1} alignItems="center" justifyContent="center">
          <VStack>
            <Center>
              <Icon as={AntDesign} name="questioncircle" size={20}></Icon>
              <Text color={textColor} fontSize="md" mt="4">
                {lang.NoAssets}
              </Text>
            </Center>
          </VStack>
        </VStack>
      ) : (
        <ScrollView px="1" py="2">
          <Box>{formattedItems}</Box>
        </ScrollView>
      )}
    </>
  );
};

export default Tokenlist;
