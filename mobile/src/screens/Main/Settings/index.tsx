import { useColors } from "@app/context/ColorContex";
import { Feather } from "@expo/vector-icons";
import {
  HStack,
  Icon,
  ScrollView,
  Text,
  VStack,
  useColorMode,
} from "native-base";
import React, { useMemo, useState } from "react";
import ColorModeSetting from "./ColorModeSetting";
import LanguageSetting from "./LanguageSetting";
import NetworkSetting from "./NetworkSetting";
import SecuritySetting from "./SecuritySetting";
import local from "@app/utils/locales";
import { Image } from "react-native";
import About from "./About";

const Settings: React.FC = () => {
  const { bgColor, textColor } = useColors();
  const [language, setLanguage] = useState("");
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
      <ScrollView>
        <LanguageSetting setLanguage={setLanguage} />
        <ColorModeSetting />
        <SecuritySetting />
        <NetworkSetting />
        <About />
      </ScrollView>
    </VStack>
  );
};

export default Settings;
