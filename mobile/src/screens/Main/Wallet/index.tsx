import { useAuth } from "@app/context/AuthContext";
import { useColors } from "@app/context/ColorContex";
import { RootState } from "@app/redux/store";
import { faMinus, faPlus, faShare } from "@fortawesome/free-solid-svg-icons";
import { HStack, Text, VStack, useDisclose } from "native-base";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import Tokenlist from "../components/Tokenlist";
import TransferButton from "../components/TransferButton";
import TransferModal from "../components/TransferModal";

const Wallet: React.FC = () => {
  const { balances, currentAddress } = useAuth();
  const { marketcap } = useSelector((store: RootState) => store.app);
  const { bgColor, textColor } = useColors();
  const { isOpen, onToggle } = useDisclose();
  const handleTransfer = () => {};

  const BalanceItem = useMemo(() => {
    return (
      <VStack>
        <Text fontSize="2xl" textAlign="center">
          Balance
        </Text>
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
    <>
      <VStack
        flex={1}
        justifyItems="center"
        space={5}
        bgColor={bgColor}
        color={textColor}
      >
        <VStack>
          {BalanceItem}
          <HStack w="full" justifyContent="center" space={4}>
            <TransferButton
              icon={faShare}
              title="SEND"
              toggleModal={onToggle}
            ></TransferButton>
            <TransferButton icon={faPlus} title="BUY"></TransferButton>
            <TransferButton icon={faMinus} title="SELL"></TransferButton>
          </HStack>
        </VStack>
        <VStack w="full" flex={1} py="2">
          <VStack>
            <Text fontSize="xl" textAlign="center">
              My All Assets
            </Text>
          </VStack>
          <VStack flex={1}>
            <Tokenlist />
          </VStack>
        </VStack>
      </VStack>
      <TransferModal
        isOpen={isOpen}
        onToggle={onToggle}
        onPress={handleTransfer}
      />
    </>
  );
};

export default Wallet;
