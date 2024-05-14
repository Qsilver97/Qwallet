import React, { useEffect, useMemo } from "react";
import { Box, HStack, Image, ScrollView, Text } from "native-base";
import { useColors } from "@app/context/ColorContex";
import { TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@app/redux/store";
// import tokenIcons from "@app/utils/tokens";
// import { SvgFromUri } from "react-native-svg";

interface TokenSelectProps {
  selectedToken: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
}

const TokenSelect: React.FC<TokenSelectProps> = ({
  selectedToken,
  onChange,
}) => {
  const { textColor, main } = useColors();
  const { tokens } = useSelector((store: RootState) => store.app);
  useEffect(() => {
    console.log(tokens);
  }, [tokens]);
  const TokenList = useMemo(() => {
    return (
      <HStack space={3} px="4" w="full">
        {tokens.map((token, key) => {
          // const icon = tokenIcons.find((t) => t.symbol === token)?.icon;
          return (
            <TouchableOpacity key={key} onPress={() => onChange(token)}>
              <HStack
                px="4"
                py="1"
                rounded="3xl"
                bgColor={
                  token == selectedToken ? main.celestialBlue : main.crystalBlue
                }
              >
                {/* <SvgFromUri uri={icon}></SvgFromUri> */}
                <Text color={textColor}>{token}</Text>
              </HStack>
            </TouchableOpacity>
          );
        })}
      </HStack>
    );
  }, [tokens, selectedToken]);

  return (
    <ScrollView horizontal={true} p="2">
      {TokenList}
    </ScrollView>
  );
};

export default TokenSelect;
