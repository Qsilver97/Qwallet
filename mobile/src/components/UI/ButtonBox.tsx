import React, { ReactNode } from "react";
import { VStack } from "native-base";
import { useColors } from "../../context/ColorContex";
import { IVStackProps } from "native-base/lib/typescript/components/primitives/Stack/VStack";

interface IButtonBoxProps extends IVStackProps {
  children: ReactNode;
}

const ButtonBox: React.FC<IButtonBoxProps> = ({ children, ...props }) => {
  const { textColor, bgColor } = useColors();
  return (
    <VStack
      px={5}
      pt={4}
      pb={8}
      color={textColor}
      w="full"
      space={4}
      {...props}
    >
      {children}
    </VStack>
  );
};

export default ButtonBox;
