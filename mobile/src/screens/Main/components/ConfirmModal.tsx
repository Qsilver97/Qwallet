import React, { ReactNode } from "react";
import {
  Button,
  Center,
  HStack,
  IModalProps,
  KeyboardAvoidingView,
  Modal,
  VStack,
  View,
} from "native-base";
import { useColors } from "@app/context/ColorContex";
import { IconDefinition, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import local from "@app/utils/locales";

interface IProps extends IModalProps {
  isOpen: boolean;
  onToggle: () => void;
  onPress?: () => void;
  icon?: ReactNode | IconDefinition;
  buttons?: ReactNode;
  children: ReactNode;
}

const ConfirmModal: React.FC<IProps> = ({
  isOpen,
  onToggle,
  onPress,
  icon,
  buttons,
  children,
}) => {
  const lang = local.Main.Components;
  const { bgColor, textColor, main } = useColors();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onToggle}
      avoidKeyboard
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
      <KeyboardAvoidingView behavior="padding">
        <Modal.Content w="80">
          <Modal.CloseButton />
          <Modal.Body bgColor={bgColor}>
            <VStack justifyContent={"center"} py={6}>
              {icon && (
                <View
                  bgColor={main.celestialBlue}
                  rounded={"full"}
                  mx={"auto"}
                  p={5}
                  my={6}
                >
                  <FontAwesomeIcon
                    icon={icon as IconDefinition}
                    size={72}
                    color="white"
                  ></FontAwesomeIcon>
                </View>
              )}
              {children}
            </VStack>
            {buttons == null && (
              <HStack justifyContent={"center"} space={3}>
                <Button
                  onPress={onToggle}
                  w={"1/2"}
                  rounded={"md"}
                  _pressed={{ opacity: 0.6 }}
                  bgColor={"red.500"}
                >
                  {lang.Cancel}
                </Button>
                <Button
                  onPress={onPress}
                  w={"1/2"}
                  rounded={"md"}
                  _pressed={{ opacity: 0.6 }}
                  bgColor={main.celestialBlue}
                  //   isDisabled={addingStatus}
                >
                  {lang.Confirm}
                </Button>
              </HStack>
            )}
          </Modal.Body>
        </Modal.Content>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ConfirmModal;
