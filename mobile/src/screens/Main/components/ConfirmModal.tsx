import React, { ReactNode } from "react";
import { Button, HStack, IModalProps, Modal, VStack, View } from "native-base";
import { useColors } from "@app/context/ColorContex";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";

interface IProps extends IModalProps {
  modalVisible: boolean;
  toggleModal: () => void;
  onPress: () => void;
  children: ReactNode;
}

const ConfirmModal: React.FC<IProps> = ({
  modalVisible,
  toggleModal,
  onPress,
  children,
}) => {
  const { bgColor, textColor, main } = useColors();
  return (
    <Modal
      isOpen={modalVisible}
      onClose={toggleModal}
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
            {children}
          </VStack>
          <HStack justifyContent={"center"} space={3}>
            <Button
              onPress={toggleModal}
              w={"1/2"}
              rounded={"md"}
              _pressed={{ opacity: 0.6 }}
              bgColor={"red.500"}
            >
              Cancel
            </Button>
            <Button
              onPress={onPress}
              w={"1/2"}
              rounded={"md"}
              _pressed={{ opacity: 0.6 }}
              bgColor={main.celestialBlue}
              //   isDisabled={addingStatus}
            >
              Confirm
            </Button>
          </HStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

export default ConfirmModal;
