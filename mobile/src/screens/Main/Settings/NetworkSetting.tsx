import CollapsibleView from "@app/components/UI/CollapsibleView";
import { useColors } from "@app/context/ColorContex";
import { Entypo } from "@expo/vector-icons";
import { Icon, Text } from "native-base";
import React from "react";
import local from "@app/utils/locales";


const NetworkSetting: React.FC = () => {
  const { textColor } = useColors();
  const lang = local.Main.Settings;

  return (
    <>
      <CollapsibleView
        title={lang.NetworkSetting}
        icon={
          <Icon as={Entypo} name="network" size="xl" color={textColor} />
        }
      >
        <Text fontSize="xl" mx="auto" color={textColor}>
          {lang.PleaseWaitNextVersion}
        </Text>
      </CollapsibleView>
    </>
  );
};

export default NetworkSetting;
