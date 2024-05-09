import { useState } from "react";
import { TouchableOpacity } from "react-native";
import { faSignOut } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useAuth } from "@app/context/AuthContext";
import { useColors } from "@app/context/ColorContex";
import { useNavigation } from "@react-navigation/native";
import { Button, HStack, Modal, Text, VStack } from "native-base";
import local from "@app/utils/locales";

const LogoutButton: React.FC = () => {
  const { textColor, main } = useColors();
  const { logout } = useAuth();
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = () => {
    logout();
    navigation.navigate("Login");
  };
  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
        <FontAwesomeIcon
          icon={faSignOut}
          color={textColor}
          size={24}
        ></FontAwesomeIcon>
      </TouchableOpacity>
      <Modal
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        avoidKeyboard
        bottom="4"
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
          <Modal.Body bgColor={main.darkGunmetal}>
            <VStack justifyContent={"center"} py={6}>
              <Text fontSize={"xl"} textAlign={"center"}>
                {local.Main.Header.ReallyLogout}
              </Text>
            </VStack>
            <HStack justifyContent={"center"} space={3}>
              <Button
                onPress={handleLogout}
                w={"1/2"}
                bgColor={main.celestialBlue}
              >
                {local.Main.Header.button_Confirm}
              </Button>
              <Button
                onPress={() => {
                  setModalVisible(false);
                }}
                w={"1/2"}
                bgColor={"red.500"}
              >
                {local.Main.Header.buttom_Cancel}
              </Button>
            </HStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  );
};

export default LogoutButton;
