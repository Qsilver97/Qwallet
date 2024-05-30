import React from "react";
import ConfirmModal from "./ConfirmModal";
import local from "@app/utils/locales";
import { useAuth } from "@app/context/AuthContext";
import { VStack } from "native-base";
import FormLabel from "@app/components/UI/FormLabel";
import { faCheck, faShare } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { RootState } from "@app/redux/store";

interface IProps {
  isOpen: boolean;
  onToggle: () => void;
  onPress?: () => void;
}

const TxStatusModal: React.FC<IProps> = ({ isOpen, onToggle, onPress }) => {
  const { tick } = useSelector((store: RootState) => store.app);

  const lang = local.Main.Components;
  const { txStatus } = useAuth();
  return (
    <ConfirmModal
      icon={txStatus.status == "Success" ? faCheck : faShare}
      isOpen={isOpen}
      onToggle={onToggle}
      onPress={() => {
        if (onPress) onPress();
        onToggle();
      }}
    >
      <VStack fontSize={"xl"} textAlign={"center"} px={2}>
        <FormLabel label={lang.Status} value={txStatus.status} />
        <FormLabel label={lang.TransactionID} value={txStatus.txid} />
        <FormLabel label={lang.CurrentTick} value={tick} />
        <FormLabel
          label={lang.ExpectedTick}
          value={txStatus.expectedTick?.toString()}
        />
      </VStack>
    </ConfirmModal>
  );
};

export default TxStatusModal;
