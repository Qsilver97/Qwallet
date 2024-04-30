import React, { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { Box, Checkbox, HStack, Link, Text, VStack } from "native-base";
import { useColors } from "../../../context/ColorContex";
import Input from "../../../components/UI/Input";
import ButtonBox from "../../../components/UI/ButtonBox";
import Button from "../../../components/UI/Button";
import eventEmitter from "../../../api/eventEmitter";
import { setSeeds } from "../../../redux/appSlice";
import { useDispatch } from "react-redux";
import { create } from "../../../api/api";
import { checkPasswordStrength } from "../../../utils/utils";

function getPasswordStrengthProps(strength: number) {
  switch (strength) {
    case 4:
      return { label: "Perfect!", color: "green.500" };
    case 3:
      return { label: "Good", color: "green.500" };
    case 2:
      return { label: "Normal", color: "yellow.500" };
    case 1:
      return { label: "Bad", color: "red.500" };
    default:
      return { label: "Not Available", color: "gray.500" };
  }
}

const Create = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { bgColor, textColor, gray, main } = useColors();
  const [step, setStep] = useState<"password" | "seedType">("password");
  const [checkAgreement, setCheckAgreement] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState(true);
  const [seedType, setSeedType] = useState<"24words" | "55chars">("24words");
  const [creatingStatus, setCreatingStatus] = useState(false);
  const [lengthError, setLengthError] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    label: string;
    color: string;
  }>(getPasswordStrengthProps(0));

  const handlePassword = (text: string) => {
    setPassword(text);
    setPasswordStrength(getPasswordStrengthProps(checkPasswordStrength(text)));
  };

  const handleCreate = () => {
    setCreatingStatus(true);
    let passwordPrefix = "";
    if (seedType == "55chars") passwordPrefix = "Q";
    create(`login ${passwordPrefix}${password}`);
  };

  useEffect(() => {
    eventEmitter.on("S2C/create", (res) => {
      if (res.data?.value) {
        if (res.data.value.result >= 0) {
          Toast.show({ type: "success", text1: "Login Success!" });
          const seeds = res.data.value.display.split(" ");
          if (seeds.length == 1) {
            dispatch(setSeeds(seeds[0]));
          } else {
            dispatch(setSeeds(seeds));
          }
          navigation.navigate("Backup");
          setCreatingStatus(false);
        } else {
          Toast.show({ type: "error", text1: res.data.value.display });
        }
      } else {
        setPasswordStatus(true);
        Toast.show({ type: "error", text1: res.error });
      }
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
          <Input
            onChangeText={handlePassword}
            w={"full"}
            type="password"
            placeholder="New Password"
          ></Input>
          <Text px={6} color={lengthError ? "red.500" : gray.gray40}>
            Must be at least 8 characters
          </Text>
          <Text px={6} color={passwordStrength.color}>
            Password Strength : {passwordStrength.label}
          </Text>
        </Box>
        <Box textAlign={"center"} px={10}>
          <Input
            onChangeText={(text) => setConfirmPassword(text)}
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
        <HStack px={10}>
          <Checkbox
            value={"CheckAgreement"}
            onChange={(isSelected) => setCheckAgreement(!checkAgreement)}
            mx={2}
            size={"lg"}
            color={textColor}
          >
            <Text>
              I understand that DeGe cannot recover this password for me.
              <Link
                href="#"
                _text={{
                  color: main.celestialBlue,
                  textDecoration: "none",
                }}
                display={"inline"}
                colorScheme={"blue"}
              >
                Learn more
              </Link>
            </Text>
          </Checkbox>
        </HStack>
      </VStack>
      <ButtonBox>
        <Button
          title="Create Password"
          type="primary"
          isDisabled={
            password == "" ||
            password !== confirmPassword ||
            passwordStrength.label == "Bad" ||
            passwordStrength.label == "Not Available" ||
            checkAgreement == false
          }
          onPress={() => {}}
        ></Button>
      </ButtonBox>
    </VStack>
  );
};

export default Create;
