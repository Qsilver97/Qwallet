import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  useToast,
  IconButton,
  Icon,
} from "native-base";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"; // Adjusted for React Native
import { MaterialIcons } from "@expo/vector-icons";
// import { RootState } from "../redux/store";
import { useNavigation } from "@react-navigation/native";
import tw from "tailwind-react-native-classnames";

const Restore: React.FC = () => {
  // Adjustments for React Native
  const navigation = useNavigation();
  // const dispatch = useDispatch();
  // const { seedType, password } = useSelector((state: RootState) => state.app);

  const [passwordInputType, setPasswordInputType] =
    useState<string>("password");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordStatus, setPasswordStatus] = useState<boolean>(false);
  const [step, setStep] = useState<"1" | "2">("1");
  const [passwordStep, setPasswordStep] = useState<boolean>(true);
  const [restoreSeeds, setRestoreSeeds] = useState<string | string[]>([]);
  const [recovering, setRecovering] = useState<boolean>(false);

  // Handlers and effects remain largely the same, with adjustments for navigation and React Native UI elements
  const handlePassword = () => {};

  return (
    <Box safeArea p="5" style={tw`max-w-xs mx-auto`}>
      {step === "1" ? (
        <VStack space={4}>
          <Text fontSize="xl" bold>
            Restore
          </Text>
          <Text>
            {passwordStep
              ? "Secure your account with a new password."
              : "There are two ways to restore your account."}
          </Text>
          {passwordStep ? (
            <>
              <Input
                // type={passwordInputType}
                onChangeText={handlePassword}
                placeholder="Password"
                InputRightElement={
                  <IconButton
                    size="xs"
                    rounded="none"
                    w="1/6"
                    h="full"
                    icon={
                      <Icon
                        as={
                          <MaterialIcons
                            name={
                              passwordInputType
                                ? "visibility"
                                : "visibility-off"
                            }
                          />
                        }
                        size="md"
                      />
                    }
                    onPress={() => {}}
                    style={tw`mr-2`}
                  />
                }
              />

              {/* {password !== confirmPassword && (
                <Text color="red.500">Password does not match.</Text>
              )}
              <HStack space={2}>
                <Button onPress={handleBack} variant="outline">
                  Back
                </Button>
                <Button
                  onPress={() => setPasswordStep(!passwordStep)}
                  isDisabled={
                    !passwordStatus ||
                    password !== confirmPassword ||
                    password === ""
                  }
                >
                  Next
                </Button>
              </HStack> */}
            </>
          ) : (
            // Adjust Radio buttons with NativeBase components or custom logic
            <HStack space={2}>
              <Button onPress={() => setStep("2")}>Next</Button>
            </HStack>
          )}
        </VStack>
      ) : (
        <VStack space={4}>
          <Text fontSize="xl" bold>
            Confirm Seeds
          </Text>
          <Text>Please enter the backup seeds you have saved.</Text>
          {/* Custom input logic for seeds */}
          <Button.Group space={2} mt="4" w="80%">
            <Button onPress={() => setStep("password")} w="50%">
              Back
            </Button>
            <Button
              onPress={() => {
                navigation.navigate("Confirm");
              }}
              w="50%"
            >
              Next
            </Button>
          </Button.Group>
        </VStack>
      )}
    </Box>
  );
};

export default Restore;
