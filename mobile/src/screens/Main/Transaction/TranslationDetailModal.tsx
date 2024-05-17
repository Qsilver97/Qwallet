import React from "react";
import {
  Button,
  FormControl,
  HStack,
  IModalProps,
  Link,
  Modal,
  Text,
  VStack,
} from "native-base";
import { useColors } from "@app/context/ColorContex";
import { RootState } from "@app/redux/store";
import { useSelector } from "react-redux";
import { useAuth } from "@app/context/AuthContext";
import FormLabel from "@app/components/UI/FormLabel";
import local from "@app/utils/locales";

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
  const lang = local.Main.Transaction.Details;
  const statusLang = local.Main.Transaction.Status;

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
              <FormLabel
                label={lang.Date}
                value={`${d.getMonth() + 1}/${d.getDate()}, ${d.getFullYear()}`}
                w="1/2"
              ></FormLabel>
              <FormLabel
                label={lang.Time}
                value={`${d.getHours()}:${d.getMinutes()}`}
                w="1/2"
              ></FormLabel>
            </HStack>
            <FormLabel
              label={lang.TotalAmount}
              value={`${Math.abs(parseFloat(transaction[3]))} QU`}
            ></FormLabel>
            <FormLabel
              label={lang.TotalAmountUSD}
              value={`$${Math.abs(
                parseFloat(transaction[3]) * parseFloat(marketcap.price)
              )}`}
            ></FormLabel>
            <FormControl>
              <FormControl.Label color={textColor}>
                {lang.TransactionID}
              </FormControl.Label>
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
            <FormLabel
              label={lang.Status}
              value={`${
                transaction[4] !== ""
                  ? transaction[4] == "confirmed"
                    ? statusLang.Confirmed
                    : statusLang.Failed
                  : statusLang.OldEpoch
              }`}
            ></FormLabel>
            <FormLabel
              label={lang.From}
              value={`${isSend ? currentAddress : transaction[2]}`}
            ></FormLabel>
            <FormLabel
              label={lang.To}
              value={`${isSend ? transaction[2] : currentAddress}`}
            ></FormLabel>
          </VStack>
          <HStack justifyContent="center">
            <Button
              onPress={onToggle}
              w={"1/2"}
              rounded={"md"}
              _pressed={{ opacity: 0.6 }}
              bgColor={main.celestialBlue}
            >
              {lang.Back}
            </Button>
          </HStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

export default TransactionDetailModal;
