import CollapsibleView from "@app/components/UI/CollapsibleView";
import { useColors } from "@app/context/ColorContex";
import { Entypo } from "@expo/vector-icons";
import { Icon, Text } from "native-base";
import React from "react";

const NetworkSetting: React.FC = () => {
  const { textColor } = useColors();

  return (
    <>
      <CollapsibleView
        title="Network Settings"
        icon={
          <Icon as={Entypo} name="network" size="xl" color={textColor} />
        }
      >
        <Text fontSize="xl" mx="auto" color={textColor}>
          Please wait Next Version.
        </Text>
      </CollapsibleView>
    </>
  );
};

export default NetworkSetting;
