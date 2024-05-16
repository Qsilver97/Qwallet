import { useAuth } from "@app/context/AuthContext";
import { useColors } from "@app/context/ColorContex";
import { RootState } from "@app/redux/store";
import { faMinus, faPlus, faShare } from "@fortawesome/free-solid-svg-icons";
import { HStack, Text, VStack, useDisclose } from "native-base";
import React from "react";
import { useSelector } from "react-redux";
import Tokenlist from "../components/Tokenlist";
import TransferButton from "../components/TransferButton";
import TransferModal from "../components/TransferModal";

const Wallet: React.FC = () => {
  const { balances, allAddresses, currentAddress, tokenBalances } = useAuth();
  const { marketcap } = useSelector((store: RootState) => store.app);
  const { bgColor, textColor, gray } = useColors();
  const { isOpen, onToggle } = useDisclose();
  const handleTransfer = () => {};

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
          <VStack>
            <Text fontSize="2xl" textAlign="center">
              Balance
            </Text>
            <Text fontSize="3xl" textAlign="center">
              {/* {balances.reduce(
            (acc, currentValue) => acc + Number(currentValue),
            0
          )} */}
              ${" "}
              {balances.length > 0 &&
              allAddresses.includes(currentAddress) &&
              !isNaN(balances[currentAddress]) &&
              !isNaN(parseFloat(marketcap.price))
                ? Math.floor(
                    balances[currentAddress] *
                      parseFloat(marketcap.price) *
                      1000
                  ) / 1000
                : "0"}
              {"\n"}
              {balances[currentAddress]} QU
            </Text>
          </VStack>
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
