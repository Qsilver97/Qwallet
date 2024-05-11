import React from "react";
import { Text, VStack } from "native-base";
import { useColors } from "@app/context/ColorContex";

const Swap: React.FC = () => {
  const { bgColor, textColor } = useColors();
  return (
    <VStack
      flex={1}
      justifyItems="center"
      justifyContent="end"
      space={5}
      bgColor={bgColor}
      color={textColor}
    >
      <Text>Swap</Text>
    </VStack>
  );
};

export default Swap;
