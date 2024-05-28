import React, { useEffect, useMemo, useState } from "react";
import { Box, HStack, ScrollView, Text } from "native-base";
import { useColors } from "@app/context/ColorContex";
import { TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@app/redux/store";
import tokenIcons from "@app/utils/tokens";

interface TokenSelectProps {
  selectedToken: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  includeQU?: boolean;
}

const TokenSelect: React.FC<TokenSelectProps> = ({
  selectedToken,
  onChange,
  includeQU,
}) => {
  const { textColor, main, panelBgColor } = useColors();
  const { tokens } = useSelector((store: RootState) => store.app);
  const [dispTokens, setDispTokens] = useState<string[]>(tokens);

  useEffect(() => {
    if (includeQU) setDispTokens(["QU", ...tokens]);
    else setDispTokens(tokens)
  }, [includeQU, tokens]);

  const TokenList = useMemo(() => {
    return (
      <HStack space={3} px="4" w="full">
        {dispTokens.map((token, key) => {
          const Icon = tokenIcons.find((t) => t.symbol === token)?.icon;
          return (
            <TouchableOpacity key={key} onPress={() => onChange(token)}>
              <HStack
                px="3"
                py="1"
                rounded="3xl"
                bgColor={
                  token == selectedToken ? main.celestialBlue : panelBgColor
                }
                space="2"
                alignItems="center"
              >
                {Icon && <Icon width={24} height={24} />}
                <Text color={textColor}>{token}</Text>
              </HStack>
            </TouchableOpacity>
          );
        })}
      </HStack>
    );
  }, [tokens, selectedToken, textColor, main]);

  return (
    <ScrollView horizontal={true} p="2">
      {TokenList}
    </ScrollView>
  );
};

export default TokenSelect;
