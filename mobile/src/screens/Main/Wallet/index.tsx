import React from "react";
import { HStack, Text, VStack, useDisclose } from "native-base";
import { useColors } from "@app/context/ColorContex";
import Tokenlist from "./components/Tokenlist";
import { faMinus, faPlus, faShare } from "@fortawesome/free-solid-svg-icons";
import TransferButton from "./components/TransferButton";
import { useAuth } from "@app/context/AuthContext";
import { useSelector } from "react-redux";
import { RootState } from "@app/redux/store";
import TransferModal from "./TransferModal";

const Wallet: React.FC = () => {
  const { balances, allAddresses, currentAddress } = useAuth();
  const { marketcap } = useSelector((store: RootState) => store.app);
  const { bgColor, textColor, gray } = useColors();
  const { isOpen, onToggle } = useDisclose();
  const handleTransfer = () => {};

  return (
    <VStack
      flex={1}
      justifyItems="center"
      justifyContent="center"
      space={5}
      bgColor={bgColor}
      color={textColor}
    >
      <VStack flex={1} pt={14}>
        <Text fontSize="2xl" textAlign="center">
          Balance
        </Text>
        <Text fontSize="3xl" textAlign="center">
          {/* {balances.reduce(
            (acc, currentValue) => acc + Number(currentValue),
            0
          )} */}
          ${" "}
          {Math.floor(
            parseFloat(balances[allAddresses.indexOf(currentAddress)]) *
              parseFloat(marketcap.price) *
              1000
          ) / 1000}
          {"\n"}
          {balances[allAddresses.indexOf(currentAddress)]} QU
        </Text>
        <HStack w={"full"} justifyContent={"center"} space={4}>
          <TransferButton
            icon={faShare}
            title="SEND"
            onPress={onToggle}
          ></TransferButton>
          <TransferButton icon={faPlus} title="BUY"></TransferButton>
          <TransferButton icon={faMinus} title="SELL"></TransferButton>
        </HStack>
      </VStack>
      <Tokenlist />
      <TransferModal
        isOpen={isOpen}
        onToggle={onToggle}
        onPress={handleTransfer}
      />
    </VStack>
  );
};

export default Wallet;
