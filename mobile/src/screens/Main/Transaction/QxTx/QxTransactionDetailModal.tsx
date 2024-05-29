import React, { useMemo } from "react";
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
import { QxTxItem } from "@app/types";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";

interface IProps extends IModalProps {
  isOpen: boolean;
  onToggle: () => void;
  tx: QxTxItem;
}

const QxTransactionDetailModal: React.FC<IProps> = ({
  isOpen,
  onToggle,
  tx,
}) => {
  const { bgColor, textColor, main } = useColors();
  const { currentAddress } = useAuth();
  const { marketcap } = useSelector((store: RootState) => store.app);
  //   const isSend = parseFloat(tx[3]) < 0;
  var d = new Date(parseInt(`${tx.utc}000`));
  const lang = local.Main.Transaction.Details;
  const statusLang = local.Main.Transaction.Status;

  const action = useMemo(() => {
    if (tx.action === "transfer") {
      return tx.dest !== currentAddress ? "Send" : "Receive";
    }
    if (tx.action === "addbid") return "Bid";
    if (tx.action === "addask") return "Ask";
    return "Cancel";
  }, [tx, currentAddress]);

  const iconProps = useMemo(() => {
    if (action === "Send")
      return { name: "share", color: "red.600", as: FontAwesome5 };
    if (action === "Receive")
      return { name: "reply", color: "green.600", as: FontAwesome5 };
    if (action === "Bid")
      return {
        name: "add-shopping-cart",
        color: "green.400",
        as: MaterialIcons,
      };
    if (action === "Ask")
      return {
        name: "shopping-cart-checkout",
        color: "blue.400",
        as: MaterialIcons,
      };
    return {
      name: "remove-shopping-cart",
      color: "red.400",
      as: MaterialIcons,
    };
  }, [action]);

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
            <FormLabel label={lang.Action} value={action}></FormLabel>
            <FormLabel
              label={lang.TotalAmount}
              value={
                tx.amount + " " + (tx.action == "transfer" ? tx.token : tx.name)
              }
            ></FormLabel>
            {tx.action != "transfer" && (
                <FormLabel label={"Price"} value={`${tx.price as string} QU`}></FormLabel>
            )}
            <FormLabel label={lang.TransactionID} value={tx.txid}></FormLabel>
            <FormLabel
              label={lang.Status}
              value={`${
                tx.status !== ""
                  ? tx.status == "confirmed"
                    ? statusLang.Confirmed
                    : statusLang.Failed
                  : statusLang.OldEpoch
              }`}
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

export default QxTransactionDetailModal;
