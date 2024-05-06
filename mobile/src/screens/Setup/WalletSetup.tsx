import React from "react";
import { TouchableOpacity } from "react-native";
import { Image, VStack, Text } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { useColors } from "@app/context/ColorContex";
import ButtonBox from "@app/components/UI/ButtonBox";
import PageButton from "@app/components/UI/PageButton";


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
        <PageButton
          title="Import Using Seed Phrase"
          type="disabled"
          onPress={() => {
            navigation.navigate("Restore");
          }}
        ></PageButton>
        <PageButton
          title="Create New Wallet"
          type="primary"
          onPress={() => navigation.navigate("Create")}
        ></PageButton>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text textAlign={"center"}>Have Already Your Own Wallet?</Text>
        </TouchableOpacity>
      </ButtonBox>
    </VStack>
  );
};

export default WalletSetup;
