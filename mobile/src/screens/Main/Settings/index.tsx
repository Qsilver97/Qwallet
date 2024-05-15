import React from "react";
import { Text, VStack } from "native-base";
import { useColors } from "@app/context/ColorContex";
import LanguageSelector from "./LanguageSelecter";
import ColorModeSelecter from "./ColorModeSelecter";

const Settings: React.FC = () => {
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
      <VStack>
        <Text fontSize="3xl" w="full" textAlign="center">
          Settings
        </Text>
      </VStack>
      <VStack>
        <LanguageSelector />
        <ColorModeSelecter />
      </VStack>
    </VStack>
  );
};

export default Settings;
