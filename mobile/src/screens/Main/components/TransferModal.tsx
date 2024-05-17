import { transfer } from "@app/api/api";
import Input from "@app/components/UI/Input";
import { useAuth } from "@app/context/AuthContext";
import { useColors } from "@app/context/ColorContex";
import { RootState } from "@app/redux/store";
import {
  faCheck,
  faQuestion,
  faShare,
} from "@fortawesome/free-solid-svg-icons";
import {
  Button,
  HStack,
  Icon,
  Modal,
  Text,
  VStack,
  useDisclose,
} from "native-base";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import ConfirmModal from "./ConfirmModal";
import { FontAwesome5 } from "@expo/vector-icons";
import FormLabel from "@app/components/UI/FormLabel";
import local from "@app/utils/locales";

interface IProps {
  isOpen: boolean;
  onToggle: () => void;
  onPress: () => void;
}

const TransferModal: React.FC<IProps> = ({ isOpen, onToggle, onPress }) => {
  const {
    currentAddress,
    allAddresses,
    balances,
    txId,
    txStatus,
    txResult,
    expectedTick,
    setExpectedTick,
    setTxStatus,
  } = useAuth();
  const { bgColor, textColor, main } = useColors();
  const { tick } = useSelector((state: RootState) => state.app);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const lang = local.Main.Components;

  const modal1 = useDisclose();
  const modal2 = useDisclose();

  const handleTransfer = () => {
    modal1.onToggle();
    if (toAddress == "" || amount == "" || amount == "0") {
      Toast.show({
        type: "error",
        text1: "E02: " + lang.InvalidAddressOrAmount,
      });
      return;
    }
    setTxStatus("Open");
    const expectedTick = parseInt(tick) + 5;
    setExpectedTick(expectedTick);
    transfer(
      toAddress,
      allAddresses.indexOf(currentAddress),
      amount,
      expectedTick
    );
    modal2.onToggle();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onToggle}
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
            <HStack
              bgColor={main.celestialBlue}
              rounded={"full"}
              mx={"auto"}
              p={5}
              my={6}
            >
              <Icon
                as={FontAwesome5}
                name="hand-holding-usd"
                color="white"
                size={"6xl"}
              ></Icon>
            </HStack>
            <VStack>
              <VStack>
                <Input
                  label={lang.SendAddress}
                  onChangeText={setToAddress}
                  placeholder={lang.SendToAddress}
                  type="text"
                  w={"full"}
                ></Input>
                <Input
                  label={lang.Amount}
                  onChangeText={setAmount}
                  placeholder={lang.Amount}
                  type="text"
                  w={"full"}
                ></Input>
              </VStack>
              <VStack>
                <Text textAlign="right">{balances[currentAddress]} QU</Text>
              </VStack>
            </VStack>
            <HStack mt={3} justifyContent={"center"} space={3}>
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
                onPress={() => {
                  onToggle();
                  modal1.onToggle();
                }}
                w={"1/2"}
                rounded={"md"}
                _pressed={{ opacity: 0.6 }}
                bgColor={main.celestialBlue}
              >
                {lang.Send}
              </Button>
            </HStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <ConfirmModal
        icon={faQuestion}
        isOpen={modal1.isOpen}
        onToggle={modal1.onToggle}
        onPress={() => {
          handleTransfer();
        }}
      >
        <VStack fontSize={"xl"} textAlign={"center"} px={2}>
          <FormLabel label={lang.ToAddress} value={toAddress} />
          <FormLabel label={lang.Amount} value={amount} />
          <FormLabel label={lang.Token} value={`${amount} QU`} />
        </VStack>
      </ConfirmModal>
      <ConfirmModal
        icon={txStatus == "Success" ? faCheck : faShare}
        isOpen={modal2.isOpen}
        onToggle={modal2.onToggle}
        onPress={modal2.onToggle}
      >
        <VStack fontSize={"xl"} textAlign={"center"} px={2}>
          <FormLabel label={lang.Status} value={txStatus} />
          <FormLabel label={lang.TransactionID} value={txId} />
          <FormLabel label={lang.CurrentTick} value={tick} />
          <FormLabel
            label={lang.ExpectedTick}
            value={expectedTick.toString()}
          />
          <FormLabel label={lang.Status} value={txStatus} />
        </VStack>
      </ConfirmModal>
    </>
  );
};

export default TransferModal;
