import { HStack, Icon, Text, VStack } from "native-base";
import React from "react";
import { useSelector } from "react-redux";

import { RootState } from "@app/redux/store";
import { FontAwesome5 } from "@expo/vector-icons";
import local from "@app/utils/locales"; // Importing the localization setup
import { useColors } from "@app/context/ColorContex";

type TransactionItemType = [string, string, string, string, string, string];

interface IProps {
  transaction: TransactionItemType;
}

const TransactionItem: React.FC<IProps> = ({ transaction }) => {
  const { marketcap } = useSelector((store: RootState) => store.app);
  const { panelBgColor } = useColors();
  const isSend = parseFloat(transaction[3]) < 0;
  var d = new Date(parseInt(`${transaction[5]}000`));
  const lang = local.Main.Transaction.Status;
  if (Math.abs(parseInt(transaction[3])))
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
      >
        <HStack alignItems="center" space={4}>
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
  else return <></>;
};

export default TransactionItem;
