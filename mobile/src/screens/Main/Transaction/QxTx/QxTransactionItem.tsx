import { HStack, Icon, Text, VStack, View } from "native-base";
import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@app/redux/store";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import local from "@app/utils/locales"; // Importing the localization setup
import { useColors } from "@app/context/ColorContex";
import { IHStackProps } from "native-base/lib/typescript/components/primitives/Stack/HStack";
import { QxTxItem } from "@app/types";
import { useAuth } from "@app/context/AuthContext";

interface IProps extends IHStackProps {
  tx: QxTxItem;
  index: number;
}

const QxTransactionItem: React.FC<IProps> = ({ tx, index, ...props }) => {
  const { currentAddress } = useAuth();
  const { panelBgColor } = useColors();

  const action = useMemo(() => {
    if (tx.action === "transfer") {
      return tx.dest !== currentAddress ? "Send" : "Receive";
    }
    if (tx.action === "addbid") return "Bid";
    if (tx.action === "addask") return "Ask";
    return "Cancel";
  }, [tx, currentAddress]);

  const iconProps = useMemo(() => {
    if (action === "Send")
      return { name: "share", color: "red.600", as: FontAwesome5 };
    if (action === "Receive")
      return { name: "reply", color: "green.600", as: FontAwesome5 };
    if (action === "Bid")
      return {
        name: "add-shopping-cart",
        color: "green.400",
        as: MaterialIcons,
      };
    if (action === "Ask")
      return {
        name: "shopping-cart-checkout",
        color: "blue.400",
        as: MaterialIcons,
      };
    return {
      name: "remove-shopping-cart",
      color: "red.400",
      as: MaterialIcons,
    };
  }, [action]);

  const date = useMemo(() => new Date(parseInt(`${tx.utc}000`)), [tx.utc]);

  return (
    <HStack
      mx="4"
      my="1"
      rounded="md"
      py="2"
      px="4"
      space="2"
      backgroundColor={panelBgColor}
      alignItems="center"
      justifyContent="space-between"
      {...props}
    >
      <View w="8">
        <Text fontSize="xl" textAlign="center" ml={-2}>
          {index}
        </Text>
      </View>
      <HStack alignItems="center" space={4} flex={1}>
        <Icon {...iconProps} size="xl" />
        <VStack>
          <Text>{action}</Text>
          <Text>
            {tx.amount}{" "}
            {tx.action !== "transfer"
              ? `${tx.name} / ${tx.price} QU`
              : tx.token}
          </Text>
        </VStack>
      </HStack>
      <VStack space="1">
        <Text>
          {date.getMonth() + 1}/{date.getDate()}, {date.getFullYear()}
        </Text>
        <HStack justifyContent="flex-end">
          <Icon
            as={FontAwesome5}
            name={tx.status == "confirmed" ? "check" : "times"}
            color={tx.status == "confirmed" ? "green.500" : "red.500"}
            size="md"
          />
        </HStack>
      </VStack>
    </HStack>
  );
};

export default QxTransactionItem;
