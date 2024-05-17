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
  FormControl,
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

  const modal1 = useDisclose();
  const modal2 = useDisclose();

  const handleTransfer = () => {
    if (toAddress == "" || amount == "" || amount == "0") {
      Toast.show({
        type: "error",
        text1: "E02: " + "Invalid address or amount!",
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
                color={textColor}
                size={"6xl"}
              ></Icon>
            </HStack>
            <VStack>
              {/* <TokenSelect onChnage={() => {}}></TokenSelect> */}
              <VStack>
                <Input
                  label="Send Address"
                  onChangeText={setToAddress}
                  placeholder="Send to address"
                  type="text"
                  w={"full"}
                ></Input>
                <Input
                  label="Amount"
                  onChangeText={setAmount}
                  placeholder="Amount"
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
                Cancel
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
                Send
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
          modal1.onToggle();
          modal2.onToggle();
        }}
      >
        <VStack fontSize={"xl"} textAlign={"center"} px={2}>
          <FormLabel label="To Address" value={toAddress} />
          <FormLabel label="Amount" value={amount} />
          <FormLabel label="Token" value={`${amount} QU`} />
        </VStack>
      </ConfirmModal>
      <ConfirmModal
        icon={txStatus == "Success" ? faCheck : faShare}
        isOpen={modal2.isOpen}
        onToggle={modal2.onToggle}
        onPress={modal2.onToggle}
      >
        <VStack fontSize={"xl"} textAlign={"center"} px={2}>
          <FormLabel label="Status" value={txStatus} />
          <FormLabel label="Transaction ID" value={txId} />
          <FormLabel label="Current Tick" value={tick} />
          <FormLabel label="Expected Tick" value={expectedTick.toString()} />
          <FormLabel label="Status" value={txStatus} />
        </VStack>
      </ConfirmModal>
    </>
  );
};

export default TransferModal;
