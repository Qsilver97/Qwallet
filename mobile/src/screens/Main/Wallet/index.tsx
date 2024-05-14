import React from "react";
import { HStack, Text, VStack, useDisclose } from "native-base";
import { useColors } from "@app/context/ColorContex";
import Tokenlist from "../components/Tokenlist";
import { faMinus, faPlus, faShare } from "@fortawesome/free-solid-svg-icons";
import TransferButton from "../components/TransferButton";
import { useAuth } from "@app/context/AuthContext";
import { useSelector } from "react-redux";
import { RootState } from "@app/redux/store";
import TransferModal from "../components/TransferModal";

const Wallet: React.FC = () => {
  const { balances, allAddresses, currentAddress } = useAuth();
  const { marketcap } = useSelector((store: RootState) => store.app);
  const { bgColor, textColor, gray } = useColors();
  const { isOpen, onToggle } = useDisclose();
  const handleTransfer = () => {};

  return (
    <>
      <VStack
        flex={1}
        justifyItems="center"
        justifyContent="center"
        space={5}
        bgColor={bgColor}
        color={textColor}
      >
        <VStack flex={1} pt={14}>
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
              !isNaN(
                parseFloat(balances[allAddresses.indexOf(currentAddress)])
              ) &&
              !isNaN(parseFloat(marketcap.price))
                ? Math.floor(
                    parseFloat(balances[allAddresses.indexOf(currentAddress)]) *
                      parseFloat(marketcap.price) *
                      1000
                  ) / 1000
                : "0"}
              {"\n"}
              {balances[allAddresses.indexOf(currentAddress)]} QU
            </Text>
          </VStack>
          <HStack w={"full"} justifyContent={"center"} space={4}>
            <TransferButton
              icon={faShare}
              title="SEND"
              toggleModal={onToggle}
            ></TransferButton>
            <TransferButton icon={faPlus} title="BUY"></TransferButton>
            <TransferButton icon={faMinus} title="SELL"></TransferButton>
          </HStack>
        </VStack>
        <Tokenlist />
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
