import { deleteAccount } from "@app/api/api";
import eventEmitter from "@app/api/eventEmitter";
import { useAuth } from "@app/context/AuthContext";
import { useColors } from "@app/context/ColorContex";
import local from "@app/utils/locales";
import { MaterialIcons } from "@expo/vector-icons";
import { faWarning } from "@fortawesome/free-solid-svg-icons";
import Clipboard from "@react-native-clipboard/clipboard";
import {
  HStack,
  Icon,
  Pressable,
  Text,
  VStack,
  useDisclose,
} from "native-base";
import React, { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import ConfirmModal from "../components/ConfirmModal";

const AllAddresses: React.FC = () => {
  const { balances, user, login } = useAuth();
  const { bgColor, textColor, panelBgColor } = useColors();
  const [selectedAddress, setSelectedAddress] = useState("");
  const { isOpen, onToggle } = useDisclose();
  const lang = local.Main.Wallet.AllAddress;

  const handleTapAddress = () => {
    Clipboard.setString(selectedAddress);
    Toast.show({ type: "success", text1: lang.toast_AddressCopied });
  };

  useEffect(() => {
    const handleDeleteAddressEvent = (res: any) => {
      if (res.data) {
        login(res.data);
        Toast.show({ type: "success", text1: "Delete Address Successfully!" });
      } else {
        Toast.show({ type: "error", text1: "E-31: " + res.data.value.display });
      }
    };
    eventEmitter.on("S2C/delete-address", handleDeleteAddressEvent);
    return () => {
      eventEmitter.off("S2C/delete-address", handleDeleteAddressEvent);
    };
  }, []);

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
        {user.accountInfo.addresses.map((address, key) => {
          if (address !== "")
            return (
              <Pressable
                key={key}
                _pressed={{ opacity: 0.6 }}
                onPress={() => {
                  setSelectedAddress(address);
                  handleTapAddress();
                }}
                onLongPress={() => {
                  setSelectedAddress(address);
                  onToggle();
                }}
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
        onPress={() => {
          onToggle();
          deleteAccount(
            user?.password,
            user.accountInfo.addresses.indexOf(selectedAddress),
            selectedAddress
          );
        }}
      >
        <VStack fontSize={"xl"} textAlign={"center"} px={2}>
          <Text>{lang.DeleteAddressPrompt}</Text>
        </VStack>
      </ConfirmModal>
    </VStack>
  );
};

export default AllAddresses;
