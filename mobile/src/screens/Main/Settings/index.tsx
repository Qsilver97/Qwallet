import { useColors } from "@app/context/ColorContex";
import { Feather } from "@expo/vector-icons";
import { HStack, Icon, Text, VStack } from "native-base";
import React from "react";
import ColorModeSetting from "./ColorModeSetting";
import LanguageSetting from "./LanguageSetting";
import NetworkSetting from "./NetworkSetting";
import SecuritySetting from "./SecuritySetting";
import local from "@app/utils/locales";


const Settings: React.FC = () => {
  const { bgColor, textColor } = useColors();
  const lang = local.Main.Settings;

  return (
    <VStack
      flex={1}
      justifyItems="center"
      space={5}
      bgColor={bgColor}
      color={textColor}
    >
      <VStack>
        <HStack justifyContent="center" alignItems="center" space="3" p="2">
          <Icon as={Feather} name="settings" size="3xl" color={textColor} />
          <Text fontSize="4xl">{lang.Settings}</Text>
        </HStack>
      </VStack>
      <VStack>
        <LanguageSetting />
        <ColorModeSetting />
        <SecuritySetting />
        <NetworkSetting />
      </VStack>
    </VStack>
  );
};

export default Settings;
