import { transfer } from "@app/api/api";
import FormLabel from "@app/components/UI/FormLabel";
import Input from "@app/components/UI/Input";
import { useAuth } from "@app/context/AuthContext";
import { useColors } from "@app/context/ColorContex";
import { RootState } from "@app/redux/store";
import local from "@app/utils/locales";
import { FontAwesome5 } from "@expo/vector-icons";
import { faQuestion } from "@fortawesome/free-solid-svg-icons";
import {
  Button,
  HStack,
  Icon,
  KeyboardAvoidingView,
  Modal,
  Text,
  VStack,
  useDisclose,
} from "native-base";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import ConfirmModal from "./ConfirmModal";
import TokenSelect from "./TokenSelect";
import TxStatusModal from "./TxStatusModal";

interface IProps {
  isOpen: boolean;
  onToggle: () => void;
  onPress: () => void;
}

const TransferModal: React.FC<IProps> = ({ isOpen, onToggle, onPress }) => {
  const { currentAddress, user, balances, txStatus, setTxStatus } = useAuth();
  const { bgColor, main } = useColors();
  const { tick } = useSelector((state: RootState) => state.app);
  const [currentToken, setCurrentToken] = useState("QU");
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
        text1: "E-02: " + lang.InvalidAddressOrAmount,
      });
      return;
    }
    if (parseInt(amount) > balances[currentAddress]) {
      Toast.show({
        type: "error",
        text1: "E-03: " + lang.toast_QUInsufficient,
      });
      return;
    }
    if (toAddress.length !== 60) {
      Toast.show({
        type: "error",
        text1: "E-04: " + lang.toast_InvalidPassword,
      });
      return;
    }
    const expectedTick = parseInt(tick) + 5;
    setTxStatus({ ...txStatus, expectedTick, status: "Closed" });
    transfer(
      toAddress,
      user.accountInfo.addresses.indexOf(currentAddress),
      amount,
      expectedTick,
      currentToken
    );
    modal2.onToggle();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onToggle}
        animationPreset="fade"
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
                  <TokenSelect
                    selectedToken={currentToken}
                    onChange={setCurrentToken}
                  ></TokenSelect>
                </VStack>
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
        </KeyboardAvoidingView>
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
      <TxStatusModal
        isOpen={modal2.isOpen}
        onToggle={modal2.onToggle}
      ></TxStatusModal>
    </>
  );
};

export default TransferModal;
