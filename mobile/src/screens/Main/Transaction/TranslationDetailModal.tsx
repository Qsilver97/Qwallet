import React, { ReactNode } from "react";
import {
  Button,
  FormControl,
  HStack,
  IModalProps,
  Link,
  Modal,
  Text,
  VStack,
  View,
} from "native-base";
import { useColors } from "@app/context/ColorContex";
import { RootState } from "@app/redux/store";
import { useSelector } from "react-redux";
import { useAuth } from "@app/context/AuthContext";

interface IProps extends IModalProps {
  isOpen: boolean;
  onToggle: () => void;
  transaction: any;
}

const TransactionDetailModal: React.FC<IProps> = ({
  isOpen,
  onToggle,
  transaction,
}) => {
  const { bgColor, textColor, main } = useColors();
  const { currentAddress } = useAuth();
  const { marketcap } = useSelector((store: RootState) => store.app);
  const isSend = parseFloat(transaction[3]) < 0;
  var d = new Date(parseInt(`${transaction[5]}000`));
  return (
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
          <VStack justifyContent={"center"} py={6} space={2}>
            <HStack>
              <FormControl w="1/2">
                <FormControl.Label>Date</FormControl.Label>
                <Text>
                  {d.getMonth()}/{d.getDate()}, {d.getFullYear()}
                </Text>
              </FormControl>
              <FormControl w="1/2">
                <FormControl.Label>Time</FormControl.Label>
                <Text>
                  {d.getHours()}:{d.getMinutes()}
                </Text>
              </FormControl>
            </HStack>
            <FormControl>
              <FormControl.Label>Total Amount</FormControl.Label>
              <Text>{Math.abs(parseFloat(transaction[3]))} QU</Text>
            </FormControl>
            <FormControl>
              <FormControl.Label>Total Amount($)</FormControl.Label>
              <Text>
                $
                {Math.abs(
                  parseFloat(transaction[3]) * parseFloat(marketcap.price)
                )}
              </Text>
            </FormControl>
            <FormControl>
              <FormControl.Label>Transaction ID</FormControl.Label>
              <Link
                href={`http://89.38.98.214:7004/explorer/tx/${transaction[1]}`}
                colorScheme={"blue"}
                _text={{
                  color: main.celestialBlue,
                  textDecoration: "none",
                }}
              >
                <Text textAlign="center">{transaction[1]}</Text>
              </Link>
            </FormControl>
            <FormControl>
              <FormControl.Label>Status</FormControl.Label>
              <Text>{transaction[4] !== "" ? transaction[4] : "Unknown"}</Text>
            </FormControl>
            <FormControl>
              <FormControl.Label>From</FormControl.Label>
              <Text>{isSend ? currentAddress : transaction[2]}</Text>
            </FormControl>
            <FormControl>
              <FormControl.Label>To</FormControl.Label>
              <Text>{isSend ? transaction[2] : currentAddress}</Text>
            </FormControl>
          </VStack>
          <HStack justifyContent="center">
            <Button
              onPress={onToggle}
              w={"1/2"}
              rounded={"md"}
              _pressed={{ opacity: 0.6 }}
              bgColor={main.celestialBlue}
            >
              Back
            </Button>
          </HStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

export default TransactionDetailModal;
