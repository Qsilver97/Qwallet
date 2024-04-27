import { View, Text } from "react-native";
import React from "react";
import { Button as NButton } from "native-base";
import { useColors } from "../../context/ColorContex";

interface IProps {
  title: String;
  onPress: () => void;
  type?: String;
}

const Button: React.FC<IProps> = ({ title, onPress, type }) => {
  const { btnBgColor, textColor } = useColors();
  return (
    <NButton
      bgColor={btnBgColor}
      color={textColor}
      rounded={"full"}
      onPress={onPress}
    >
      {title}
    </NButton>
  );
};

export default Button;
