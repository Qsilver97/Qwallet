import { useColors } from "@app/context/ColorContex";
import { VStack } from "native-base";
import React, { ReactNode } from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";

interface Iprops extends TouchableOpacityProps {
  icon: ReactNode;
  title: string;
  onPress?: () => void;
  bgColor?: string;
}

const TransferButton: React.FC<Iprops> = ({
  icon,
  title,
  onPress,
  bgColor,
  ...props
}) => {
  const { main } = useColors();
  return (
    <TouchableOpacity onPress={onPress} {...props}>
      <VStack p={2} space={2} alignItems={"center"}>
        <VStack
          bgColor={bgColor || main.celestialBlue}
          p={2}
          rounded={"full"}
          justifyItems={"center"}
          justifyContent={"center"}
        >
          {icon}
        </VStack>
        {/* <Text color={textColor}>{title}</Text> */}
      </VStack>
    </TouchableOpacity>
  );
};

export default TransferButton;
