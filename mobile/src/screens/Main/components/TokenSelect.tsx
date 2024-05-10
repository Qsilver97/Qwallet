import React from "react";
import { HStack, Select, Text } from "native-base";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { useColors } from "@app/context/ColorContex";

interface TokenSelectProps {
  onChnage: (value: string) => void;
}

const TokenSelect: React.FC<TokenSelectProps> = ({ onChnage }) => {
  const { textColor } = useColors();
  return (
    <Select
      minWidth="200"
      accessibilityLabel="Choose Service"
      placeholder="Choose Service"
      mt={1}
      onValueChange={onChnage}
    >
      <Select.Item
        label={
          <HStack>
            <FontAwesomeIcon icon={faCoins} size={20} color={textColor} />
            <Text>{" UX Research"}</Text>
          </HStack>
        }
        value="ux"
      />
      <Select.Item label="Web Development" value="web" />
      <Select.Item label="Cross Platform Development" value="cross" />
      <Select.Item label="UI Designing" value="ui" />
      <Select.Item label="Backend Development" value="backend" />
    </Select>
  );
};

export default TokenSelect;
