import { addAccount } from "@app/api/api";
import eventEmitter from "@app/api/eventEmitter";
import { useAuth } from "@app/context/AuthContext";
import { useColors } from "@app/context/ColorContex";
import local from "@app/utils/locales";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import Clipboard from "@react-native-clipboard/clipboard";
import {
  Button,
  HStack,
  Popover,
  Text,
  VStack,
  useColorMode,
} from "native-base";
import { useEffect, useMemo, useState } from "react";
import { Image, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import ConfirmModal from "./ConfirmModal";
import LogoutButton from "./LogoutButton";

const Header: React.FC = () => {
  const { bgColor, textColor, main, gray } = useColors();
  const { currentAddress, allAddresses, user, login, setCurrentAddress } =
    useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [addingStatus, setAddingStatus] = useState(false);
  const { colorMode } = useColorMode();

  const logoSource = useMemo(() => {
    return colorMode === "dark"
      ? require("@assets/icon.png")
      : require("@assets/favicon.png");
  }, [colorMode]);
  const lang = local.Main.Header;
  const toggleModal = () => setModalVisible(!modalVisible);
  const handleAddAdress = () => {
    if (addingStatus) return;
    setAddingStatus(true);
    addAccount(
      user?.password,
      user?.accountInfo.addresses.findIndex((item) => item == "")
    );
  };
  const handleTapAddress = () => {
    Clipboard.setString(currentAddress);
    Toast.show({ type: "success", text1: lang.toast_AddressCopied });
  };

  useEffect(() => {
    const handleAddAddressEvent = (res: any) => {
      if (res.data) {
        login(res.data);
      } else {
        Toast.show({ type: "error", text1: "E01: " + res.data.value.display });
      }
      setModalVisible(false);
      setAddingStatus(false);
    };
    eventEmitter.on("S2C/add-account", handleAddAddressEvent);
    return () => {
      eventEmitter.off("S2C/add-account", handleAddAddressEvent);
    };
  }, []);

  return (
    <>
      <HStack bgColor={bgColor} p={3} alignItems="center">
        <VStack justifyContent={"center"}>
          <Image
            source={logoSource}
            alt="Logo"
            style={{ width: 42, height: 42 }}
          />
        </VStack>
        <HStack flex={1} justifyContent={"center"} px={10}>
          <TouchableOpacity onPress={handleTapAddress}>
            <Text numberOfLines={1} ellipsizeMode="middle">
              {currentAddress}
            </Text>
          </TouchableOpacity>
          <Popover
            trigger={(triggerProps) => {
              return (
                <TouchableOpacity
                  {...triggerProps}
                  onPress={() => setIsOpen(true)}
                >
                  <FontAwesomeIcon
                    icon={faAngleDown}
                    size={20}
                    color={textColor}
                  ></FontAwesomeIcon>
                </TouchableOpacity>
              );
            }}
            isOpen={isOpen}
            onClose={() => setIsOpen(!isOpen)}
          >
            <Popover.Content accessibilityLabel="" mx={10}>
              <Popover.CloseButton onPress={() => setIsOpen(false)} />
              <Popover.Body bgColor={bgColor}>
                <VStack justifyContent={"center"} py={6}>
                  {allAddresses.map((address, key) => {
                    if (address != "")
                      return (
                        <TouchableOpacity
                          key={key}
                          onPress={() => {
                            setCurrentAddress(address);
                            setIsOpen(false);
                          }}
                        >
                          <Text
                            fontSize={"md"}
                            numberOfLines={1}
                            ellipsizeMode="middle"
                            py={1}
                            bgColor={main.crystalBlue}
                          >
                            {address}
                          </Text>
                        </TouchableOpacity>
                      );
                  })}
                </VStack>
                <HStack justifyContent={"center"} space={3}>
                  <Button
                    onPress={() => setIsOpen(false)}
                    w={"1/2"}
                    rounded={"md"}
                    _pressed={{ opacity: 0.6 }}
                    bgColor={gray.gray50}
                  >
                    {lang.button_Cancel}
                  </Button>
                  <Button
                    onPress={() => {
                      toggleModal();
                      setIsOpen(false);
                    }}
                    w={"1/2"}
                    rounded={"md"}
                    _pressed={{ opacity: 0.6 }}
                    bgColor={main.celestialBlue}
                  >
                    {lang.button_CreateAddress}
                  </Button>
                </HStack>
              </Popover.Body>
            </Popover.Content>
          </Popover>
        </HStack>
        <VStack justifyContent={"center"}>
          <LogoutButton />
        </VStack>
      </HStack>
      <ConfirmModal
        isOpen={modalVisible}
        onToggle={toggleModal}
        onPress={handleAddAdress}
      >
        <>
          <Text fontSize={"2xl"} textAlign={"center"}>
            {lang.Create}
          </Text>
          <Text textAlign={"center"}>{lang.CreateInfo}</Text>
        </>
      </ConfirmModal>
    </>
  );
};

export default Header;
