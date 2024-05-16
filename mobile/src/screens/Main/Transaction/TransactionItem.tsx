import React from "react";
import { useSelector } from "react-redux";
import { HStack, Text, VStack } from "native-base";

import { RootState } from "@app/redux/store";
import { faReply, faShare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";

type TransactionItemType = [string, string, string, string, string, string];

interface IProps {
  transaction: TransactionItemType;
}

const TransactionItem: React.FC<IProps> = ({ transaction }) => {
  const { marketcap } = useSelector((store: RootState) => store.app);
  const isSend = parseFloat(transaction[3]) < 0;
  var d = new Date(parseInt(`${transaction[5]}000`));
  return (
    <HStack
      mx="4"
      my="2"
      rounded="xl"
      py="2"
      px="4"
      space="2"
      backgroundColor="blueGray.600"
      alignItems="center"
      justifyContent="space-between"
    >
      <HStack alignItems="center" space={4}>
        <FontAwesomeIcon
          icon={isSend ? faShare : faReply}
          color={isSend ? "red" : "green"}
          size={28}
        />
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
        <Text>{transaction[4] !== "" ? transaction[4] : "Unknown"}</Text>
        <Text>
          {d.getMonth()}/{d.getDate()}, {d.getFullYear()}
        </Text>
      </VStack>
    </HStack>
  );
};

export default TransactionItem;
