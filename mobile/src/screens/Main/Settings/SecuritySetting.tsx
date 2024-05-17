import CollapsibleView from "@app/components/UI/CollapsibleView";
import { useColors } from "@app/context/ColorContex";
import { FontAwesome5 } from "@expo/vector-icons";
import { Icon, Text } from "native-base";
import React from "react";

const SecuritySetting: React.FC = () => {
  const { textColor } = useColors();

  return (
    <>
      <CollapsibleView
        title="Security Settings"
        icon={
          <Icon as={FontAwesome5} name="user-lock" size="xl" color={textColor} />
        }
      >
        <Text fontSize="xl" mx="auto" color={textColor}>
          Please wait Next Version.
        </Text>
      </CollapsibleView>
    </>
  );
};

export default SecuritySetting;
