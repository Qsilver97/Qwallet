import React from "react";
import { useAuth } from "@app/context/AuthContext";
import { HStack, Pressable, Text, VStack, useDisclose } from "native-base";
import { useColors } from "@app/context/ColorContex";
import ConfirmModal from "../components/ConfirmModal";
import { faWarning } from "@fortawesome/free-solid-svg-icons";

const AllAddresses: React.FC = () => {
  const { allAddresses, balances } = useAuth();
  const { bgColor, textColor } = useColors();
  const { isOpen, onToggle } = useDisclose();
  return (
    <VStack
      flex={1}
      justifyItems="center"
      space={5}
      bgColor={bgColor}
      color={textColor}
    >
      <VStack>
        <Text fontSize="2xl" textAlign="center">
          All Addresses
        </Text>
      </VStack>
      <VStack mx={2} space="2">
        {allAddresses.map((address, key) => {
          if (address !== "")
            return (
              <Pressable
                key={key}
                _pressed={{ opacity: 0.6 }}
                onLongPress={onToggle}
              >
                <HStack p="3" space="2" bgColor="blueGray.600">
                  <Text w="5%">{key + 1}</Text>
                  <Text flex={1} ellipsizeMode="middle" numberOfLines={1}>
                    {address}
                  </Text>
                  <Text w="28%" textAlign="center" numberOfLines={1}>
                    {balances[address] || 0} QU
                  </Text>
                </HStack>
              </Pressable>
            );
        })}
      </VStack>
      <ConfirmModal
        icon={faWarning}
        isOpen={isOpen}
        onToggle={onToggle}
        onPress={() => {}}
      >
        <VStack fontSize={"xl"} textAlign={"center"} px={2}>
          <Text>Do you really want to delete this address?</Text>
        </VStack>
      </ConfirmModal>
    </VStack>
  );
};

export default AllAddresses;
