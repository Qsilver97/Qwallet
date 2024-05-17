import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  Box,
  Checkbox,
  HStack,
  Link,
  ScrollView,
  Text,
  VStack,
} from "native-base";
import { useAuth } from "@app/context/AuthContext";
import { useColors } from "@app/context/ColorContex";
import {
  checkPasswordStrength,
  getPasswordStrengthProps,
} from "@app/utils/utils";
import Input from "@app/components/UI/Input";
import ButtonBox from "@app/components/UI/ButtonBox";
import PageButton from "@app/components/UI/PageButton";
import local from "@app/utils/locales";

const CreatePassword: React.FC = () => {
  const navigation = useNavigation();
  const { bgColor, textColor, gray, main } = useColors();
  const [checkAgreement, setCheckAgreement] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [lengthError, setLengthError] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    label: string;
    color: string;
  }>(getPasswordStrengthProps(0));
  const { setTempPassword } = useAuth();
  const lang = local.Create.CreatePassword;

  const handlePassword = (text: string) => {
    setPassword(text);
    setPasswordStrength(getPasswordStrengthProps(checkPasswordStrength(text)));
  };

  return (
    <VStack
      flex={1}
      justifyItems="center"
      justifyContent="end"
      space={5}
      bgColor={bgColor}
      color={textColor}
    >
      <ScrollView>
        <VStack space={5} pt={10}>
          <Text fontSize={"2xl"} color={main.jeansBlue} textAlign={"center"}>
            {lang.Create}
          </Text>
          <Text textAlign={"center"} px={16}>
            {lang.Caption}
          </Text>
        </VStack>
        <VStack flex={1} pt={28} justifyItems="center" py={40} space={5}>
          <Box textAlign={"center"} px={10}>
            <Input
              onChangeText={handlePassword}
              w={"full"}
              type="password"
              placeholder={lang.placeholder_NewPassword}
            ></Input>
            <Box p={3}>
              <Text px={2} color={lengthError ? "red.500" : gray.gray40}>
                {lang.AtLeast8Char}
              </Text>
              <Text px={2} color={passwordStrength.color}>
                {lang.PasswordStrength} : {passwordStrength.label}
              </Text>
            </Box>
          </Box>
          <Box textAlign={"center"} px={10}>
            <Input
              onChangeText={(text) => setConfirmPassword(text)}
              w={"full"}
              type="password"
              placeholder={lang.placeholder_ConfirmPassword}
            ></Input>
            {password !== confirmPassword && (
              <Text px={6} color={"red.400"}>
                {lang.NotMatch}
              </Text>
            )}
          </Box>
          <HStack px={10}>
            <Checkbox
              value={"CheckAgreement"}
              onChange={(isSelected) => setCheckAgreement(!checkAgreement)}
              mx={2}
              size={"lg"}
              color={textColor}
            >
              <Text>
                {lang.Understand}
                <Link
                  href="#"
                  _text={{
                    color: main.celestialBlue,
                    textDecoration: "none",
                  }}
                  display={"inline"}
                  colorScheme={"blue"}
                >
                  {lang.LearnMore}
                </Link>
              </Text>
            </Checkbox>
          </HStack>
        </VStack>
      </ScrollView>
      <ButtonBox>
        <PageButton
          title={lang.button_CreatePassword}
          type="primary"
          isDisabled={
            password == "" ||
            password !== confirmPassword ||
            passwordStrength.label == "Bad" ||
            passwordStrength.label == "Not Available" ||
            checkAgreement == false
          }
          onPress={() => {
            setTempPassword(password);
            navigation.navigate("Reminder");
          }}
        ></PageButton>
      </ButtonBox>
    </VStack>
  );
};

export default CreatePassword;
