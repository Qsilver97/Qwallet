import CollapsibleView from "@app/components/UI/CollapsibleView";
import { useColors } from "@app/context/ColorContex";
import { HStack, Icon, Text, useColorMode } from "native-base";
import React from "react";
import { MaterialCommunityIcons, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

const ColorModeSelecter: React.FC = () => {
  const { textColor } = useColors();
  const { setColorMode } = useColorMode();
  return (
    <CollapsibleView
      title="Select Color Mode"
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
        <TouchableOpacity
          style={{ width: "50%" }}
          onPress={() => setColorMode("light")}
        >
          <HStack textAlign="center" alignItems="center" space={2}>
            <Icon as={MaterialIcons} name="light-mode" size="2xl" />
            <Text fontSize="xl" color={textColor}>
              Light Mode
            </Text>
          </HStack>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ width: "50%" }}
          onPress={() => setColorMode("dark")}
        >
          <HStack textAlign={"center"} space={2}>
            <Icon as={Ionicons} name="moon-sharp" size="2xl" />
            <Text fontSize="xl" color={textColor}>
              Dark Mode
            </Text>
          </HStack>
        </TouchableOpacity>
      </HStack>
    </CollapsibleView>
  );
};

export default ColorModeSelecter;
