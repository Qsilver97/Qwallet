import React from "react";
import { useNavigation } from "@react-navigation/native";
import { Image, VStack, Text, Box, Flex } from "native-base";
import { useColors } from "../../context/ColorContex";
import Button from "../../components/UI/Button";

interface IProps {}

const WalletSetup: React.FC<IProps> = () => {
  const navigation = useNavigation();
  const { bgColor, textColor } = useColors();

  return (
    <VStack
      space={10}
      alignItems="center"
      bgColor={bgColor}
      flex={1}
      justifyContent="center"
      justifyItems="center"
    >
      <Image
        source={require("../../../assets/images/01/04.png")}
        style={{ width: 214, height: 220 }}
        resizeMode="contain"
        alt="Splash Image"
      />
      <Text color={textColor} fontSize={40}>
        Wallet Setup
      </Text>
      <VStack
        px={5}
        pt={4}
        pb={8}
        bgColor={bgColor}
        w="full"
        position={"absolute"}
        bottom={"0"}
        space={4}
      >
        <Button
          title="Import Using Seed Phrase"
          type="disabled"
          onPress={() => {
            navigation.navigate("Restore");
          }}
        ></Button>
        <Button
          title="Create New Wallet"
          type="primary"
          onPress={() => navigation.navigate("Create")}
        ></Button>
      </VStack>
    </VStack>
  );
};

export default WalletSetup;
