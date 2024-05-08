import { useColors } from "@app/context/ColorContex";
import { Box, HStack, Image, Text } from "native-base";
import React from "react";

const Header: React.FC = () => {
  const { bgColor, textColor } = useColors();
  return (
    <HStack bgColor={bgColor} p={3} justifyItems="center">
      <Box>
        <Image source={require("@assets/icon.png")} w={12} h={12} alt="Image"/>
      </Box>
      <Box flex={1}>
        <Text mx="auto">Account1</Text>
      </Box>
      <Box>
        <Text>Languages</Text>
      </Box>
    </HStack>
  );
};

export default Header;
