import { useEffect, useState } from "react";
import {
  Button,
  HStack,
  Image,
  Modal,
  Popover,
  Text,
  VStack,
  View,
} from "native-base";
import Toast from "react-native-toast-message";
import { TouchableOpacity } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faAngleDown, faCheck } from "@fortawesome/free-solid-svg-icons";
import { useColors } from "@app/context/ColorContex";
import LogoutButton from "./LogoutButton";
import { useAuth } from "@app/context/AuthContext";
import { addAccount } from "@app/api/api";
import eventEmitter from "@app/api/eventEmitter";

const Header: React.FC = () => {
  const { bgColor, textColor, main, gray } = useColors();
  const { currentAddress, allAddresses, user, login, setCurrentAddress } =
    useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [addingStatus, setAddingStatus] = useState(false);

  const handleAddAdress = () => {
    if (addingStatus) return;
    setAddingStatus(true);
    addAccount(
      user?.password,
      user?.accountInfo.addresses.findIndex((item) => item == "")
    );
  };

  useEffect(() => {
    eventEmitter.on("S2C/add-account", (res) => {
      if (res.data) {
        login(res.data);
      } else {
        Toast.show({ type: "error", text1: res.data.value.display });
      }
      setModalVisible(false);
      setAddingStatus(false);
    });
  }, []);

  return (
    <>
      <HStack bgColor={bgColor} p={3} alignItems="center">
        <VStack justifyContent={"center"}>
          <Image
            source={require("@assets/icon.png")}
            w={12}
            h={12}
            alt="Image"
          />
        </VStack>
        <HStack flex={1} justifyContent={"center"} px={10}>
          <Text numberOfLines={1} ellipsizeMode="middle">
            {currentAddress}
          </Text>
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
                          onPress={() => {
                            setCurrentAddress(address);
                            setIsOpen(false);
                          }}
                        >
                          <Text
                            key={key}
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
                    Cancel
                  </Button>
                  <Button
                    onPress={() => {
                      setModalVisible(!modalVisible);
                      setIsOpen(false);
                    }}
                    w={"1/2"}
                    rounded={"md"}
                    _pressed={{ opacity: 0.6 }}
                    bgColor={main.celestialBlue}
                  >
                    Add Address
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
      <Modal
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        avoidKeyboard
        size="lg"
        _backdrop={{
          _dark: {
            bg: "coolGray.600",
          },
          _light: {
            bg: "warmGray.50",
          },
          opacity: 0.8,
        }}
      >
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Body bgColor={bgColor}>
            <VStack justifyContent={"center"} py={6}>
              <View
                bgColor={main.celestialBlue}
                rounded={"full"}
                mx={"auto"}
                p={3}
              >
                <FontAwesomeIcon
                  icon={faCheck}
                  size={42}
                  color={textColor}
                ></FontAwesomeIcon>
              </View>
              <Text fontSize={"2xl"} textAlign={"center"}>
                Create New Address
              </Text>
              <Text textAlign={"center"}>
                An Account can't have more than 10 addresses
              </Text>
            </VStack>
            <HStack justifyContent={"center"} space={3}>
              <Button
                onPress={() => {
                  setModalVisible(false);
                }}
                w={"1/2"}
                rounded={"md"}
                _pressed={{ opacity: 0.6 }}
                bgColor={"red.500"}
              >
                Cancel
              </Button>
              <Button
                onPress={handleAddAdress}
                w={"1/2"}
                rounded={"md"}
                _pressed={{ opacity: 0.6 }}
                bgColor={main.celestialBlue}
                isDisabled={addingStatus}
              >
                Confirm
              </Button>
            </HStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  );
};

export default Header;
