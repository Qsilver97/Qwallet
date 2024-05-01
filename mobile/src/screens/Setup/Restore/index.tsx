import React, { useEffect, useState } from "react";
import { Box, Link, Text, TextArea, VStack } from "native-base";
import Input from "../../../components/UI/Input";
import { useColors } from "../../../context/ColorContex";
import ButtonBox from "../../../components/UI/ButtonBox";
import PageButton from "../../../components/UI/PageButton";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { passwordAvail, restore } from "../../../api/api";
import { setPassword, setSeedType } from "../../../redux/appSlice";
import eventEmitter from "../../../api/eventEmitter";

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
    dispatch(setPassword(""));
    setConfirmPassword("");
  }, []);

  useEffect(() => {
    eventEmitter.on("S2C/passwordAvail", (res) => {
      setPasswordStatus(res);
    });
    eventEmitter.on("S2C/restore", (res) => {
      navigation.navigate("Login");
      setRecovering(false);
    });
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
            placeholder="Seed Phrase"
            onChangeText={handleRestoreSeeds}
          />
        </Box>
        <Box textAlign={"center"} px={10}>
          <Input
            onChangeText={handlePassword}
            w={"full"}
            type="password"
            placeholder="New Password"
          ></Input>
          <Text px={6} color={lengthError ? "red.500" : gray.gray40}>
            Must be at least 8 characters
          </Text>
        </Box>
        <Box textAlign={"center"} px={10}>
          <Input
            onChangeText={handleConfirmPassword}
            w={"full"}
            type="password"
            placeholder="Confirm Password"
          ></Input>
          {password !== confirmPassword && (
            <Text px={6} color={"red.400"}>
              Password does not match.
            </Text>
          )}
        </Box>
        <Box textAlign={"center"} px={16}>
          <Text>
            By proceeding, you agree to these
            <Link
              href="https://qubic.org/Terms-of-service"
              _text={{ color: main.celestialBlue, marginTop: 2 }}
              display={"inline"}
            >
              Term and Conditions
            </Link>
            .
          </Text>
        </Box>
      </VStack>
      <ButtonBox>
        <PageButton
          title="Import"
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
