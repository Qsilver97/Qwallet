import { useAuth } from "@app/context/AuthContext";
import { useColors } from "@app/context/ColorContex";
import { MaterialIcons } from "@expo/vector-icons";
import { faWarning } from "@fortawesome/free-solid-svg-icons";
import {
  HStack,
  Icon,
  Pressable,
  Text,
  VStack,
  useDisclose,
} from "native-base";
import React from "react";
import ConfirmModal from "../components/ConfirmModal";
import local from "@app/utils/locales";
import Clipboard from "@react-native-clipboard/clipboard";
import Toast from "react-native-toast-message";

const AllAddresses: React.FC = () => {
  const { allAddresses, balances } = useAuth();
  const { bgColor, textColor, panelBgColor } = useColors();
  const { isOpen, onToggle } = useDisclose();
  const lang = local.Main.Wallet.AllAddress;

  const handleTapAddress = (currentAddress: string) => {
    Clipboard.setString(currentAddress);
    Toast.show({ type: "success", text1: lang.toast_AddressCopied });
  };

  return (
    <VStack
      flex={1}
      justifyItems="center"
      space={5}
      bgColor={bgColor}
      color={textColor}
    >
      <HStack justifyContent="center" alignItems="center" space="3" p="2">
        <Icon
          as={MaterialIcons}
          name="library-books"
          size="3xl"
          color={textColor}
        />
        <Text fontSize="4xl">{lang.AllAddresses}</Text>
      </HStack>
      <VStack mx={2} space="2">
        {allAddresses.map((address, key) => {
          if (address !== "")
            return (
              <Pressable
                key={key}
                _pressed={{ opacity: 0.6 }}
                onPress={() => handleTapAddress(address)}
                onLongPress={onToggle}
              >
                <HStack p="3" space="2" bgColor={panelBgColor}>
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
          <Text>{lang.DeleteAddressPrompt}</Text>
        </VStack>
      </ConfirmModal>
    </VStack>
  );
};

export default AllAddresses;
