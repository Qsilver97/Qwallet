import React from "react";
import {
  Icon,
  Pressable,
  Spinner,
  VStack,
  View,
  useDisclose,
} from "native-base";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@app/context/AuthContext";
import { useColors } from "@app/context/ColorContex";
import TxStatusModal from "../components/TxStatusModal";

interface IProps {
  onToggle?: () => void;
}

const TransferStatusFab: React.FC<IProps> = ({ onToggle }) => {
  const { main } = useColors();
  const { txStatus, setTxStatus } = useAuth();
  const modal = useDisclose();

  const getStatusIcon = () => {
    switch (txStatus.status) {
      case "Success":
        return <Icon as={FontAwesome5} name="check" size="xl" color="white" />;
      case "Failed":
        return (
          <Icon
            as={MaterialCommunityIcons}
            name="close-thick"
            size="xl"
            color="white"
          />
        );
      case "Waiting":
        return <Spinner size="lg" color="white" />;
      case "Pending":
        return <Spinner size="lg" color="white" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (txStatus.status) {
      case "Success":
        return "green.500";
      case "Failed":
        return "red.500";
      default:
        return main.celestialBlue;
    }
  };

  return (
    <>
      {txStatus.status !== "Closed" ? (
        <View position="absolute" bottom="16" right="4">
          <Pressable onPress={modal.onToggle} _pressed={{ opacity: 0.6 }}>
            <VStack
              bgColor={getBackgroundColor()}
              rounded="full"
              p="2"
              justifyContent="center"
              alignItems="center"
            >
              {getStatusIcon()}
            </VStack>
          </Pressable>
        </View>
      ) : (
        <></>
      )}
      <TxStatusModal
        isOpen={modal.isOpen}
        onToggle={modal.onToggle}
        onPress={() => {
          if (txStatus.status == "Success" || txStatus.status == "Failed") {
            setTxStatus((prev) => {
              return { ...prev, status: "Closed" };
            });
          }
        }}
      />
    </>
  );
};

export default TransferStatusFab;
