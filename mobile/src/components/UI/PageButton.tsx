import { View, Text } from "react-native";
import React from "react";
import { Button, IButtonProps } from "native-base";
import { useColors } from "../../context/ColorContex";

interface IProps extends IButtonProps {
  title: String;
  onPress: () => void;
  type?: "primary" | "disabled";
}

const PageButton: React.FC<IProps> = ({ title, onPress, type, ...props }) => {
  const { btnBgColor, textColor, main, gray } = useColors();

  return (
    <Button
      bgColor={type == "primary" ? btnBgColor : gray.gray60}
      color={textColor}
      rounded={"full"}
      _pressed={{
        bgColor: type == "primary" ? main.jeansBlue : gray.gray80,
      }}
      onPress={onPress}
      {...props}
    >
      {title}
    </Button>
  );
};

export default PageButton;
