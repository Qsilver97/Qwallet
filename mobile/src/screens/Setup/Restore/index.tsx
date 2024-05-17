import React, { useEffect, useState } from "react";
import { Box, Link, Text, TextArea, VStack } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { useColors } from "@app/context/ColorContex";
import { RootState } from "@app/redux/store";
import { setPassword, setSeedType } from "@app/redux/appSlice";
import { passwordAvail, restore } from "@app/api/api";
import eventEmitter from "@app/api/eventEmitter";
import Input from "@app/components/UI/Input";
import ButtonBox from "@app/components/UI/ButtonBox";
import PageButton from "@app/components/UI/PageButton";
import local from "@app/utils/locales";

const Restore: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { seedType, password } = useSelector((state: RootState) => state.app);
  const { bgColor, textColor, gray, main } = useColors();
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordStatus, setPasswordStatus] = useState<boolean>(false);
  const [restoreSeeds, setRestoreSeeds] = useState<string | string[]>([]);
  const [recovering, setRecovering] = useState<boolean>(false);
  const [lengthError, setLengthError] = useState(false);
  const lang = local.WalletSetup;

  const handleNext = () => {
    setRecovering(true);
    let passwordPrefix = "";
    if (seedType == "55chars") passwordPrefix = "Q";
    let _password = `${passwordPrefix}${password}`;
    restore(_password, restoreSeeds, seedType);
  };

  const handlePassword = (value: string) => {
    if (value.length < 8) setLengthError(true);
    else setLengthError(false);

    dispatch(setPassword(value));
  };

  const handleConfirmPassword = (value: string) => {
    setConfirmPassword(value);
  };

  const handleSeedType = (text: string) => {
    if (typeof text == "string") {
      const split_seed = text.split(" ");
      if (split_seed.length === 1) {
        setRestoreSeeds(split_seed[0]);
        dispatch(setSeedType("55chars"));
      } else {
        setRestoreSeeds(split_seed);
        dispatch(setSeedType("24words"));
      }
    }
  };

  const handleRestoreSeeds = (text: string) => {
    setRestoreSeeds(text);
    handleSeedType(text);
  };

  useEffect(() => {
    if (password != "") {
      passwordAvail(password);
    } else {
      setPasswordStatus(true);
    }
  }, [password, confirmPassword]);

  useEffect(() => {
    const handlePasswordAvailEvent = (res) => {
      setPasswordStatus(res);
    };
    const handleRestoreEvent = (res) => {
      navigation.navigate("Login");
      setRecovering(false);
    };
    eventEmitter.on("S2C/passwordAvail", handlePasswordAvailEvent);
    eventEmitter.on("S2C/restore", handleRestoreEvent);

    return () => {
      eventEmitter.off("S2C/passwordAvail", handlePasswordAvailEvent);
      eventEmitter.off("S2C/restore", handleRestoreEvent);
    };
  }, []);

  return (
    <VStack
      flex={1}
      justifyItems="center"
      justifyContent="end"
      space={5}
      bgColor={bgColor}
      color={textColor}
    >
      <VStack
        flex={1}
        pt={40}
        justifyItems="center"
        py={40}
        space={5}
        bgColor={bgColor}
        color={textColor}
      >
        <Box textAlign={"center"} px={10}>
          <TextArea
            autoCompleteType=""
            w={"full"}
            color={textColor}
            borderColor={gray.gray80}
            rounded={"md"}
            placeholderTextColor={gray.gray40}
            placeholder={lang.placeholder_SeedPhrase}
            onChangeText={handleRestoreSeeds}
          />
        </Box>
        <Box textAlign={"center"} px={10}>
          <Input
            onChangeText={handlePassword}
            w={"full"}
            type="password"
            placeholder={lang.placeholder_NewPassword}
          ></Input>
          <Text px={6} color={lengthError ? "red.500" : gray.gray40}>
            {lang.AtLeast8characters}
          </Text>
        </Box>
        <Box textAlign={"center"} px={10}>
          <Input
            onChangeText={handleConfirmPassword}
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
        <Box textAlign={"center"} px={16}>
          <Text>
            {lang.ByProceeding}
            <Link
              href="https://qubic.org/Terms-of-service"
              _text={{ color: main.celestialBlue, marginTop: 2 }}
              display={"inline"}
            >
              {lang.TermCondition}
            </Link>
            .
          </Text>
        </Box>
      </VStack>
      <ButtonBox>
        <PageButton
          title={lang.ImportButtonTitle}
          type="primary"
          isDisabled={
            !passwordStatus ||
            password !== confirmPassword ||
            password === "" ||
            lengthError
          }
          onPress={handleNext}
        ></PageButton>
      </ButtonBox>
    </VStack>
  );
};

export default Restore;
