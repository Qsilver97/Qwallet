import { HStack, Image, Text, VStack } from "native-base";
import { useColors } from "@app/context/ColorContex";
import LogoutButton from "./LogoutButton";
import { useAuth } from "@app/context/AuthContext";

const Header: React.FC = () => {
  const { bgColor, textColor } = useColors();
  const { currentAddress } = useAuth();
  return (
    <HStack bgColor={bgColor} p={3} justifyItems="center">
      <VStack justifyContent={"center"}>
        <Image source={require("@assets/icon.png")} w={12} h={12} alt="Image" />
      </VStack>
      <VStack flex={1} justifyContent={"center"}>
        <Text mx="auto" numberOfLines={1} ellipsizeMode="middle" px={10}>{currentAddress}</Text>
      </VStack>
      <VStack justifyContent={"center"}>
        <LogoutButton />
      </VStack>
    </HStack>
  );
};

export default Header;
