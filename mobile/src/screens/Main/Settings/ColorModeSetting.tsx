import CollapsibleView from "@app/components/UI/CollapsibleView";
import { useColors } from "@app/context/ColorContex";
import { HStack, Icon, Text, useColorMode } from "native-base";
import React from "react";
import {
  MaterialCommunityIcons,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import local from "@app/utils/locales";


const ColorModeSetting: React.FC = () => {
  const { textColor } = useColors();
  const { setColorMode } = useColorMode();
  const lang = local.Main.Settings;

  return (
    <CollapsibleView
      title={lang.ColorModeSetting}
      icon={
        <Icon
          as={MaterialCommunityIcons}
          name="theme-light-dark"
          size="xl"
          color={textColor}
        />
      }
    >
      <HStack w="full" p={2}>
        {/* <Text fontSize="xl">Please wait Next Version.</Text> */}
        <TouchableOpacity
          style={{ width: "50%" }}
          onPress={() => {
            setColorMode("light");
            AsyncStorage.setItem("color", "light");
          }}
        >
          <HStack textAlign="center" alignItems="center" space={2}>
            <Icon
              as={MaterialIcons}
              name="light-mode"
              size="2xl"
              color={textColor}
            />
            <Text fontSize="xl" color={textColor}>
              {lang.LightMode}
            </Text>
          </HStack>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ width: "50%" }}
          onPress={() => {
            setColorMode("dark");
            AsyncStorage.setItem("color", "dark");
          }}
        >
          <HStack textAlign={"center"} space={2}>
            <Icon
              as={Ionicons}
              name="moon-sharp"
              size="2xl"
              color={textColor}
            />
            <Text fontSize="xl" color={textColor}>
              {lang.DarkMode}
            </Text>
          </HStack>
        </TouchableOpacity>
      </HStack>
    </CollapsibleView>
  );
};

export default ColorModeSetting;
