import React from "react";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { Image, VStack, Text } from "native-base";
import { useColors } from "../../context/ColorContex";
import Button from "../../components/UI/Button";
import ButtonBox from "../../components/UI/ButtonBox";

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
      justifyContent="end"
      justifyItems="center"
    >
      <VStack
        space={10}
        alignItems="center"
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
      </VStack>
      <ButtonBox>
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
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text textAlign={"center"}>Have Already Your Own Wallet?</Text>
        </TouchableOpacity>
      </ButtonBox>
    </VStack>
  );
};

export default WalletSetup;
