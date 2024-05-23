import { passwordAvail, restore } from "@app/api/api";
import eventEmitter from "@app/api/eventEmitter";
import ButtonBox from "@app/components/UI/ButtonBox";
import Input from "@app/components/UI/Input";
import PageButton from "@app/components/UI/PageButton";
import { useColors } from "@app/context/ColorContex";
import { setPassword, setSeedType } from "@app/redux/appSlice";
import { RootState } from "@app/redux/store";
import local from "@app/utils/locales";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAvoidingView, Text, TextArea, VStack } from "native-base";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux";

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
  const lang = local.Restore;

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
    const handlePasswordAvailEvent = (res: any) => {
      setPasswordStatus(res);
    };
    const handleRestoreEvent = (res: any) => {
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
    <KeyboardAvoidingView
      flex={1}
      justifyItems="center"
      bgColor={bgColor}
      color={textColor}
      behavior={Platform.OS === "ios" ? "height" : "height"}
    >
      <Text fontSize="4xl" p="5" textAlign="center">
        {lang.BackupfromSeed}
      </Text>
      <VStack flex={1} px="10">
        <TextArea
          autoCompleteType=""
          w={"full"}
          color={textColor}
          borderColor={gray.gray80}
          rounded={"md"}
          placeholderTextColor={textColor}
          placeholder={lang.placeholder_SeedPhrase}
          onChangeText={handleRestoreSeeds}
        />
        <Input
          onChangeText={handlePassword}
          w={"full"}
          type="password"
          placeholder={lang.placeholder_NewPassword}
          helper={lang.AtLeast8characters}
        ></Input>
        <Input
          onChangeText={handleConfirmPassword}
          w={"full"}
          type="password"
          placeholder={lang.placeholder_ConfirmPassword}
          error={password !== confirmPassword ? lang.NotMatch : ""}
        ></Input>
        <Text>
          {lang.ByProceeding}
          {/* <Link
            href="https://qubic.org/Terms-of-service"
            _text={{ color: main.celestialBlue, marginTop: 2 }}
            display={"inline"}
          >
            {lang.TermCondition}
          </Link> */}
          .
        </Text>
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
    </KeyboardAvoidingView>
  );
};

export default Restore;
