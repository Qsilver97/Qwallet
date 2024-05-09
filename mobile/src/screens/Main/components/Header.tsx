import { HStack, Image, Text, VStack } from "native-base";
import { useColors } from "@app/context/ColorContex";
import LogoutButton from "./LogoutButton";

const Header: React.FC = () => {
  const { bgColor, textColor } = useColors();
  return (
    <HStack bgColor={bgColor} p={3} justifyItems="center">
      <VStack justifyContent={"center"}>
        <Image source={require("@assets/icon.png")} w={12} h={12} alt="Image" />
      </VStack>
      <VStack flex={1} justifyContent={"center"}>
        <Text mx="auto">Account1</Text>
      </VStack>
      <VStack justifyContent={"center"}>
        <LogoutButton />
      </VStack>
    </HStack>
  );
};

export default Header;
