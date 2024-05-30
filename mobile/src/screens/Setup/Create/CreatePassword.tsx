import React, { useEffect, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Box, Checkbox, KeyboardAvoidingView, Text, VStack } from "native-base";
import { useColors } from "@app/context/ColorContex";
import {
  checkPasswordStrength,
  getPasswordStrengthProps,
} from "@app/utils/utils";
import Input from "@app/components/UI/Input";
import ButtonBox from "@app/components/UI/ButtonBox";
import PageButton from "@app/components/UI/PageButton";
import local from "@app/utils/locales";
import { Platform } from "react-native";
import eventEmitter from "@app/api/eventEmitter";
import { passwordAvail } from "@app/api/api";
import { setPassword as setGlobalPwd } from "@app/redux/appSlice";
import { useDispatch } from "react-redux";

const CreatePassword: React.FC = () => {
  const navigation = useNavigation();
  const { bgColor, textColor, gray, main } = useColors();
  const [checkAgreement, setCheckAgreement] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<{
    label: string;
    color: string;
  }>(getPasswordStrengthProps(0));
  const dispatch = useDispatch();
  const lang = local.Create.CreatePassword;

  const handlePassword = (text: string) => {
    setPassword(text);
    setPasswordStrength(getPasswordStrengthProps(checkPasswordStrength(text)));
    // passwordAvail(text);
  };

  useEffect(() => {
    const handlePasswordAvailEvent = (res: any) => {
      console.log(res);
      if (!res.data) setErrorMessage(lang.PasswordExist);
      else setErrorMessage("");
    };
    eventEmitter.on("S2C/passwordAvail", handlePasswordAvailEvent);
    return () => {
      eventEmitter.off("S2C/passwordAvail", handlePasswordAvailEvent);
    };
  }, []);

  useFocusEffect(() => {
    passwordAvail(password);
  });
  return (
    <KeyboardAvoidingView
      flex={1}
      justifyItems="center"
      justifyContent="end"
      bgColor={bgColor}
      color={textColor}
      behavior={Platform.OS == "ios" ? "padding" : "height"}
    >
      <VStack flex={1}>
        <VStack space={5} pt={10}>
          <Text fontSize={"4xl"} textAlign={"center"}>
            {lang.Create}
          </Text>
          <Text textAlign={"center"} px={16}>
            {lang.Caption}
          </Text>
        </VStack>
        <VStack flex={1} space={5} px={10}>
          <Box>
            <Input
              onChangeText={handlePassword}
              w={"full"}
              type="password"
              placeholder={lang.placeholder_NewPassword}
              helper={lang.AtLeast8Char}
              error={errorMessage}
            ></Input>
            <Text px={3} color={passwordStrength.color}>
              {lang.PasswordStrength} : {passwordStrength.label}
            </Text>
          </Box>
          <Input
            onChangeText={(text) => setConfirmPassword(text)}
            w={"full"}
            type="password"
            placeholder={lang.placeholder_ConfirmPassword}
            error={password !== confirmPassword ? lang.NotMatch : ""}
          ></Input>
          <Box>
            <Checkbox
              value={"CheckAgreement"}
              onChange={(isSelected) => setCheckAgreement(!checkAgreement)}
              mx={2}
              size={"lg"}
              color={textColor}
            >
              <Text pr="2">
                {lang.Understand}
                {/* <Link
                  href="#"
                  _text={{
                    color: main.celestialBlue,
                    textDecoration: "none",
                  }}
                  display={"inline"}
                  colorScheme={"blue"}
                >
                  {lang.LearnMore}
                </Link> */}
              </Text>
            </Checkbox>
          </Box>
        </VStack>
      </VStack>
      <ButtonBox>
        <PageButton
          title={lang.button_CreatePassword}
          type="primary"
          isDisabled={
            password == "" ||
            password !== confirmPassword ||
            errorMessage != "" ||
            passwordStrength.label == "Bad" ||
            passwordStrength.label == "Not Available" ||
            checkAgreement == false
          }
          onPress={() => {
            dispatch(setGlobalPwd(password));
            navigation.navigate("Reminder");
          }}
        ></PageButton>
      </ButtonBox>
    </KeyboardAvoidingView>
  );
};

export default CreatePassword;
