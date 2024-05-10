import { Button, HStack, Modal, Text, VStack, View } from "native-base";
import { useColors } from "@app/context/ColorContex";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import TokenSelect from "@app/screens/Main/components/TokenSelect";
import Input from "@app/components/UI/Input";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { useAuth } from "@app/context/AuthContext";
import { transfer } from "@app/api/api";
import { RootState } from "@app/redux/store";
import { useSelector } from "react-redux";

interface IProps {
  modalVisible: boolean;
  toggleModal: () => void;
  onPress: () => void;
}

const TransferModal: React.FC<IProps> = ({
  modalVisible,
  toggleModal,
  onPress,
}) => {
  const { currentAddress, allAddresses } = useAuth();
  const { bgColor, main } = useColors();
  const { tick } = useSelector((state: RootState) => state.app);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [sendingStatus, setSendingStatus] = useState<
    "open" | "pending" | "closed" | "rejected"
  >("closed");
  const [transactionId, setTrasactionId] = useState<string>("");
  const [expectedTick, setExpectedTick] = useState<number>();

  const handleTransfer = () => {
    if (toAddress == "" || amount == "" || amount == "0") {
      Toast.show({ type: "error", text1: "Invalid address or amount!" });
      return;
    }
    setSendingStatus("open");
    const expectedTick = parseInt(tick) + 5;
    setExpectedTick(expectedTick);
    transfer(
      toAddress,
      allAddresses.indexOf(currentAddress),
      amount,
      expectedTick
    );
  };

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
          <VStack justifyContent={"center"} py={6} space={2}>
            {/* <TokenSelect onChnage={() => {}}></TokenSelect> */}
            <Text>Send Address</Text>
            <Input
              onChangeText={setToAddress}
              placeholder="Send to address"
              type="text"
              w={"full"}
            ></Input>
            <Text>Amount</Text>
            <Input
              onChangeText={setAmount}
              placeholder="Amount"
              type="text"
              w={"full"}
            ></Input>
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
              onPress={handleTransfer}
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

export default TransferModal;
