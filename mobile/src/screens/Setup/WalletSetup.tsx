import React from "react";
import { TouchableOpacity } from "react-native";
import { Image, VStack, Text } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { useColors } from "@app/context/ColorContex";
import ButtonBox from "@app/components/UI/ButtonBox";
import PageButton from "@app/components/UI/PageButton";
import local from "@app/utils/locales";

interface IProps {}

const WalletSetup: React.FC<IProps> = () => {
  const navigation = useNavigation();
  const { bgColor, textColor } = useColors();
  const lang = local.WalletSetup;

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
          source={require("@assets/images/01/04.png")}
          style={{ width: 214, height: 220 }}
          resizeMode="contain"
          alt="Splash Image"
        />
        <Text color={textColor} fontSize={40} textAlign={"center"} px={10}>
          {lang.WalletSetup}
        </Text>
      </VStack>
      <ButtonBox>
        <PageButton
          title={lang.button_ImportUsingSeedPhrase}
          type="disabled"
          onPress={() => {
            navigation.navigate("Restore");
          }}
        ></PageButton>
        <PageButton
          title={lang.button_CreateNewWallet}
          type="primary"
          onPress={() => navigation.navigate("Create")}
        ></PageButton>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text textAlign={"center"}>{lang.HaveAlreadyYourOwnWallet}</Text>
        </TouchableOpacity>
      </ButtonBox>
    </VStack>
  );
};

export default WalletSetup;
