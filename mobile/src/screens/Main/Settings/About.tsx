import CollapsibleView from "@app/components/UI/CollapsibleView";
import { useColors } from "@app/context/ColorContex";
import { Entypo } from "@expo/vector-icons";
import { Icon, Text } from "native-base";
import React from "react";
import local from "@app/utils/locales";

const About: React.FC = () => {
  const { textColor } = useColors();
  const lang = local.Main.Settings;

  return (
    <>
      <CollapsibleView
        title="About"
        icon={<Icon as={Entypo} name="info-with-circle" size="xl" color={textColor} />}
      >
        <Text fontSize="xl" mx="auto" color={textColor}>
          QWallet version 0.1.4
        </Text>
      </CollapsibleView>
    </>
  );
};

export default About;
