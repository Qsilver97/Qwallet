import React from "react";
import { Box, Icon, Pressable, VStack, View } from "native-base";
import { useColors } from "@app/context/ColorContex";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "@app/context/AuthContext";

interface IProps {
  onToggle: () => void;
}

const TransferButtonFab: React.FC<IProps> = ({ onToggle }) => {
  const { main } = useColors();
  const { txStatus } = useAuth();

  return (
    <View position="absolute" bottom="4" right="4">
      <Pressable onPress={onToggle} _pressed={{ opacity: 0.6 }}>
        <VStack
          bgColor={main.celestialBlue}
          rounded="full"
          p="3"
          justifyContent="center"
          alignItems="center"
        >
          <Icon as={FontAwesome5} color="white" name="share" size="xl" />
        </VStack>
      </Pressable>
      {txStatus.status == "Pending" && (
        <Box
          bgColor="green.600"
          p="2"
          rounded="full"
          style={{
            position: "absolute",
            top: -2,
            right: -1,
            zIndex: 100,
          }}
          borderColor="white"
          borderWidth="1"
        ></Box>
      )}
    </View>
  );
};

export default TransferButtonFab;
