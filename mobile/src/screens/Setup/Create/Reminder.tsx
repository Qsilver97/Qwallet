import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Image, VStack, Text, Box, HStack, Center } from "native-base";
import { useColors } from "../../../context/ColorContex";
import ButtonBox from "../../../components/UI/ButtonBox";
import Button from "../../../components/UI/Button";
import ReminderBar from "./Components/ReminderBar";
import { getPasswordStrengthProps } from "../../../utils/utils";

interface IProps {}

const Reminder: React.FC<IProps> = () => {
  const navigation = useNavigation();
  const { bgColor, textColor, main, gray } = useColors();
  const [step, setStep] = useState<1 | 2>(1);
  const handleNext = () => {
    if (step == 1) setStep(2);
    else navigation.navigate("Confirm");
  };

  return (
    <VStack
      space={10}
      alignItems="center"
      bgColor={bgColor}
      flex={1}
      justifyContent="end"
      justifyItems="center"
    >
      {step == 1 && (
        <VStack
          space={10}
          alignItems="center"
          flex={1}
          justifyContent="center"
          justifyItems="center"
        >
          <Image
            source={require("../../../../assets/images/02/01.png")}
            style={{ width: 214, height: 220 }}
            resizeMode="contain"
            alt="Splash Image"
          />
          <Box px={12}>
            <Text color={textColor} fontSize={"3xl"} textAlign={"center"}>
              Secure Your Wallet
            </Text>
            <Text color={textColor} textAlign={"center"}>
              Don't risk losing your funds. protect your wallet by saving your
              Seed phrase in a place you trust.{"\n"}
              It's the only way to recover your wallet if you get locked out of
              the app or get a new device.
            </Text>
          </Box>
        </VStack>
      )}
      {step == 2 && (
        <VStack
          space={10}
          alignItems="center"
          flex={1}
          pt={10}
          justifyItems="center"
        >
          <VStack px={12} space={5}>
            <Text color={textColor} fontSize={"3xl"} textAlign={"center"}>
              Secure Your Wallet
            </Text>
            <Text color={gray.gray30} fontSize={"xl"} fontWeight={"bold"}>
              Secure your wallet's seeds phrase
            </Text>
            <VStack color={textColor} textAlign={"center"} space={"2"}>
              <Text fontWeight={"bold"} ml={-3}>
                Manual
              </Text>
              <Text>
                Write down your seed phrase on a piece of paper and store in a
                safe place.
              </Text>
              <Text>Security level: {getPasswordStrengthProps(1).label}</Text>
              <ReminderBar strength={1} />

              <VStack space={"2"}>
                <Text fontWeight={"bold"} ml={-3}>
                  Risks are:{" "}
                </Text>
                <Text>You lose it</Text>
                <Text>You forget where you put it</Text>
                <Text>Someone else finds it</Text>
              </VStack>
              <VStack space={2}>
                <Text>Other options: Doesn't have to be paper!</Text>
                <Text fontWeight={"bold"} ml={-3}>
                  Tips:{" "}
                </Text>
                <Text>Store in bank vault</Text>
                <Text>Store in a safe</Text>
                <Text>Store in multiple secret places</Text>
              </VStack>
            </VStack>
          </VStack>
        </VStack>
      )}
      <ButtonBox>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text
            textAlign={"center"}
            fontWeight={"bold"}
            color={main.moonStoneBlue}
          >
            Remider Later
          </Text>
        </TouchableOpacity>
        <Button
          title={step == 1 ? "Next" : step == 2 ? "Start" : ""}
          type="primary"
          onPress={handleNext}
        ></Button>
      </ButtonBox>
    </VStack>
  );
};

export default Reminder;
