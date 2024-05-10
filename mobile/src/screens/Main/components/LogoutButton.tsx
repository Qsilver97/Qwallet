import { useState } from "react";
import { TouchableOpacity } from "react-native";
import { faSignOut } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useAuth } from "@app/context/AuthContext";
import { useColors } from "@app/context/ColorContex";
import { useNavigation } from "@react-navigation/native";
import { Text } from "native-base";
import local from "@app/utils/locales";
import ConfirmModal from "./ConfirmModal";

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
      <ConfirmModal
        modalVisible={modalVisible}
        toggleModal={() => setModalVisible(!modalVisible)}
        onPress={handleLogout}
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
        <Text fontSize={"xl"} textAlign={"center"}>
          {local.Main.Header.ReallyLogout}
        </Text>
      </ConfirmModal>
    </>
  );
};

export default LogoutButton;
