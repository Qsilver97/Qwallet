import React, { ReactNode } from "react";
import { VStack } from "native-base";
import { useColors } from "../../context/ColorContex";

interface IButtonBoxProps {
  children: ReactNode;
}

const ButtonBox: React.FC<IButtonBoxProps> = ({ children }) => {
  const { textColor, bgColor } = useColors();
  return (
    <VStack
      px={5}
      pt={4}
      pb={8}
      color={textColor}
      w="full"
      space={4}
    >
      {children}
    </VStack>
  );
};

export default ButtonBox;
