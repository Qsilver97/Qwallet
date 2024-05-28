import { HStack, Icon, Text, VStack, View } from "native-base";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { RootState } from "@app/redux/store";
import { FontAwesome5 } from "@expo/vector-icons";
import local from "@app/utils/locales"; // Importing the localization setup
import { useColors } from "@app/context/ColorContex";
import { IHStackProps } from "native-base/lib/typescript/components/primitives/Stack/HStack";
import { IScTx, TransactionItem as ITransactionItem } from "@app/types";

interface IProps extends IHStackProps {
  transaction: ITransactionItem;
  index: number;
  scTx: IScTx;
}

const QxTransactionItem: React.FC<IProps> = ({
  transaction,
  index,
  scTx,
  ...props
}) => {
  const { marketcap } = useSelector((store: RootState) => store.app);
  const { panelBgColor } = useColors();
  // const isSend = parseFloat(transaction[3]) < 0;
  var d = new Date(parseInt(`${transaction[5]}000`));
  const lang = local.Main.Transaction.Status;

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
        {/* <Icon
          as={FontAwesome5}
          name={isSend ? "share" : "reply"}
          color={isSend ? "red.600" : "green.600"}
          size="xl"
        ></Icon> */}
        <VStack>
          <Text>{scTx?.action}</Text>
          <Text>
            ${" "}
            {Math.abs(
              parseFloat(transaction[3]) * parseFloat(marketcap.price)
            ).toFixed(5)}
          </Text>
        </VStack>
      </HStack>
      <VStack>
        <Text>
          {transaction[4] !== ""
            ? transaction[4] == "confirmed"
              ? lang.Confirmed
              : lang.Failed
            : lang.OldEpoch}
        </Text>
        <Text>
          {d.getMonth() + 1}/{d.getDate()}, {d.getFullYear()}
        </Text>
      </VStack>
    </HStack>
  );
};

export default QxTransactionItem;
