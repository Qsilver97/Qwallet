import { HStack, Icon, Text, VStack, View } from "native-base";
import React from "react";
import { useSelector } from "react-redux";

import { RootState } from "@app/redux/store";
import { FontAwesome5 } from "@expo/vector-icons";
import local from "@app/utils/locales"; // Importing the localization setup
import { useColors } from "@app/context/ColorContex";
import { IHStackProps } from "native-base/lib/typescript/components/primitives/Stack/HStack";
import { TransactionItem as ITransactionItem } from "@app/types";

interface IProps extends IHStackProps {
  transaction: ITransactionItem;
  index: number;
}

const QuTransactionItem: React.FC<IProps> = ({
  transaction,
  index,
  ...props
}) => {
  const { marketcap } = useSelector((store: RootState) => store.app);
  const { panelBgColor } = useColors();
  const isSend = parseFloat(transaction[3]) < 0;
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
        <Icon
          as={FontAwesome5}
          name={isSend ? "share" : "reply"}
          color={isSend ? "red.600" : "green.600"}
          size="xl"
        ></Icon>
        <VStack>
          <Text>{Math.abs(parseInt(transaction[3]))} QU</Text>
          <Text>
            ${" "}
            {Math.abs(
              parseFloat(transaction[3]) * parseFloat(marketcap.price)
            ).toFixed(5)}
          </Text>
        </VStack>
      </HStack>
      <VStack space="1">
        <Text>
          {d.getMonth() + 1}/{d.getDate()}, {d.getFullYear()}
        </Text>
        <HStack justifyContent="flex-end">
          <Icon
            as={FontAwesome5}
            name={
              transaction[4] == "confirmed"
                ? "check"
                : transaction[4] == "failed"
                ? "times"
                : "question"
            }
            color={
              transaction[4] == "confirmed"
                ? "green.500"
                : transaction[4] == "failed"
                ? "red.500"
                : "black"
            }
            size="md"
          />
        </HStack>
      </VStack>
    </HStack>
  );
};

export default QuTransactionItem;
