import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Input,
  Button,
  Text,
  Image,
  View,
  Radio,
  VStack,
  ScrollView,
} from "native-base";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"; // Adjusted for React Native
import { RootState } from "../redux/store";
import { useNavigation } from "@react-navigation/native";
import tw from "tailwind-react-native-classnames";
import eventEmitter from "../api/eventEmitter";
import { setPassword, setSeedType } from "../redux/appSlice";
import { passwordAvail, restore } from "../api/api";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import PageWrapper from "../components/PageWrapper";
import { TextInput } from "react-native";

const Restore: React.FC = () => {
  // Adjustments for React Native
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { seedType, password } = useSelector((state: RootState) => state.app);

  const [passwordInputType, setPasswordInputType] =
    useState<string>("password");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordStatus, setPasswordStatus] = useState<boolean>(false);
  const [step, setStep] = useState<"1" | "2">("1");
  const [passwordStep, setPasswordStep] = useState<boolean>(true);
  const [restoreSeeds, setRestoreSeeds] = useState<string | string[]>([]);
  const [recovering, setRecovering] = useState<boolean>(false);

  // Handlers and effects remain largely the same, with adjustments for navigation and React Native UI elements
  const handleNext = () => {
    setRecovering(true);
    let passwordPrefix = "";
    if (seedType == "55chars") passwordPrefix = "Q";
    let _password = `${passwordPrefix}${password}`;
    console.log(_password, restoreSeeds);
    restore(_password, restoreSeeds, seedType);
  };

  const handlePassword = (value: string) => {
    dispatch(setPassword(value));
  };

  const handleConfirmPassword = (value: string) => {
    setConfirmPassword(value);
  };

  const handleSeedType = (value: string) => {
    if (value == "24words") {
      setRestoreSeeds([]);
    } else {
      value == "55chars";
    }
    {
      setRestoreSeeds("");
    }
    dispatch(setSeedType(value));
  };

  const handleEye = () => {
    setPasswordInputType((prev) => {
      if (prev == "text") return "password";
      else return "text";
    });
  };

  const handleRestoreSeeds = (value: string) => {
    setRestoreSeeds(value);
  };

  const handleRestoreSeedsFor24 = (value: string, idx: number) => {
    if (seedType == "24words") {
      setRestoreSeeds((prev) => {
        let _prev = [...prev];
        _prev[idx] = value;
        return _prev;
      });
    }
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
    <ScrollView contentContainerStyle={{ padding: 4 }}>
      <VStack
        space={5}
        w="90%"
        maxW="300px"
        style={tw`items-center mx-auto pt-16`}
      >
        <Image source={require("../../assets/icon.png")} alt="Logo" size="xl" />
        {step === "1" ? (
          <View style={tw`items-center mx-auto`}>
            <Text style={tw`my-4 mx-auto text-2xl`}>Restore</Text>
            <Text style={tw`mb-4 font-normal`}>
              {passwordStep
                ? "Secure your account with a new password."
                : "There are two ways to restore your account."}
            </Text>
            <View style={tw`relative`}>
              {passwordStep ? (
                <>
                  <View style={tw`relative`}>
                    <Input
                      // type={passwordInputType}
                      onChangeText={handlePassword}
                      placeholder="Password"
                    />
                    {!passwordStatus && (
                      <Text style={tw`w-full text-left text-red-600`}>
                        Password already exist.
                      </Text>
                    )}
                    <FontAwesomeIcon
                      icon={
                        passwordInputType === "password" ? faEye : faEyeSlash
                      }
                      style={tw`absolute top-4 right-3 text-gray-500`}
                      // onPress={() => handleEye()}
                    />
                    <Input
                      // type={passwordInputType}
                      onChangeText={handleConfirmPassword}
                      placeholder="Confirm password"
                    />
                    {password !== confirmPassword && (
                      <Text style={tw`w-full text-left text-red-600`}>
                        Password does not match.
                      </Text>
                    )}
                  </View>
                  <View style={tw`flex justify-center`}>
                    <Button.Group space={2} mt="4" w="80%" style={tw`mx-auto`}>
                      <Button onPress={() => navigation.goBack()} w="50%">
                        Back
                      </Button>
                      <Button
                        onPress={() => setPasswordStep(!passwordStep)}
                        isDisabled={
                          !passwordStatus ||
                          password !== confirmPassword ||
                          password === ""
                        }
                        w="1/2"
                      >
                        Next
                      </Button>
                    </Button.Group>
                  </View>
                </>
              ) : (
                <>
                  <View style={tw`flex justify-evenly mb-3`}>
                    <Radio.Group
                      name="options"
                      accessibilityLabel="options"
                      value={seedType}
                      onChange={handleSeedType}
                    >
                      <VStack
                        space={4}
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <View>
                          <Radio value="24words" my={1}>
                            24 Words
                          </Radio>
                        </View>
                        <View>
                          <Radio value="55chars" my={1}>
                            55 Chars
                          </Radio>
                        </View>
                      </VStack>
                    </Radio.Group>
                  </View>
                  <Button.Group space={2} mt="4" w="80%">
                    <Button
                      onPress={() => setPasswordStep(!passwordStep)}
                      w="50%"
                    >
                      Back
                    </Button>
                    <Button
                      onPress={() => setStep("2")}
                      w="50%"
                      isDisabled={
                        !passwordStatus || password !== confirmPassword
                      }
                    >
                      Next
                    </Button>
                  </Button.Group>
                </>
              )}
            </View>
          </View>
        ) : (
          <View style={tw` mx-auto text-center`}>
            <Text style={tw`my-4 mx-auto text-base`}>Confirm Seeds</Text>
            <Text style={tw`mb-4 text-base font-normal`}>
              Please enter the backup seeds you have saved.
            </Text>
            <View style={tw`relative`}>
              {seedType === "55chars" && (
                <Input
                  type="text"
                  onChangeText={handleRestoreSeeds}
                  placeholder="Input seeds you've just created."
                />
              )}
              {seedType === "24words" && (
                <View style={tw`p-2.5 text-center`}>
                  {Array.from({ length: 24 }).map((_, idx) => (
                    <View
                      key={`seed${idx}`}
                      style={tw`flex-row items-center border-b border-white`}
                    >
                      <Text style={tw`w-4 text-center mx-2`}>{idx + 1}</Text>
                      <TextInput
                        onChangeText={(text) =>
                          handleRestoreSeedsFor24(text, idx)
                        }
                        style={tw`flex-1 text-center m-0 p-0`}
                        placeholderTextColor="white"
                      />
                    </View>
                  ))}
                </View>
              )}
              <Button.Group space={2} mt="4" w="80%">
                <Button onPress={() => setStep("1")} w="50%">
                  Back
                </Button>
                <Button
                  onPress={handleNext}
                  w="50%"
                  isDisabled={!passwordStatus || password !== confirmPassword}
                >
                  Next
                </Button>
              </Button.Group>
            </View>
          </View>
        )}
      </VStack>
    </ScrollView>
  );
};

export default Restore;
