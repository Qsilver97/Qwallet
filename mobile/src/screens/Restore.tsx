import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Input, Button, Text, useToast, View, Radio, VStack } from "native-base";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"; // Adjusted for React Native
import { MaterialIcons } from "@expo/vector-icons";
import { RootState } from "../redux/store";
import { useNavigation } from "@react-navigation/native";
import tw from "tailwind-react-native-classnames";
import eventEmitter from "../api/eventEmitter";
import { setPassword, setSeedType } from "../redux/appSlice";
import { passwordAvail, restore } from "../api/api";
import { Image } from "react-native";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

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
    <>
      {step === "1" ? (
        <View
          style={tw`bg-light dark:bg-dark text-light dark:text-dark max-w-[500px] mx-auto p-[40px] rounded-[10px] shadow-[0_15px_25px_rgba(0,0,0,0.5)] text-center`}
        >
          <Image
            source={require("../../assets/icon.png")}
            style={{ width: 100, height: 100, alignSelf: "center" }}
          />
          <Text
            style={tw`my-[15px] mx-auto text-light dark:text-dark text-[2rem]`}
          >
            Restore
          </Text>
          <Text style={tw`mb-[20px] leading-[25px] text-[1rem] font-normal`}>
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
                    icon={passwordInputType === "password" ? faEye : faEyeSlash}
                    style={tw`absolute top-[15px] right-3 text-gray-500 cursor-pointer`}
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
                <View style={tw`flex gap-2`}>
                  <Button onPress={() => navigation.goBack()}>Back</Button>
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
                        <Text>24 Words</Text>
                      </View>
                      <View>
                        <Radio value="55chars" my={1}>
                          55 Chars
                        </Radio>
                        <Text>55 Chars</Text>
                      </View>
                    </VStack>
                  </Radio.Group>
                </View>
                <View style={tw`flex gap-2`}>
                  <Button onPress={() => setPasswordStep(!passwordStep)}>
                    Back
                  </Button>
                  <Button onPress={() => setStep("2")}>Next</Button>
                </View>
              </>
            )}
          </View>
        </View>
      ) : (
        <View
          style={tw`bg-light dark:bg-dark text-light dark:text-dark max-w-[500px] mx-auto p-[40px] rounded-[10px] shadow-[0_15px_25px_rgba(0,0,0,0.5)] text-center`}
        >
          <Image
            source={require("../../assets/icon.png")}
            style={{ width: 100, height: 100, alignSelf: "center" }}
          />
          <Text
            style={tw`my-[15px] mx-auto text-light dark:text-dark text-[2rem]`}
          >
            Confirm Seeds
          </Text>
          <Text style={tw`mb-[20px] leading-[25px] text-[1rem] font-normal`}>
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
              // Here you might need a more advanced setup for the grid, possibly custom styling or a FlatList
              <Text>Seed input grid goes here</Text>
            )}
            <View style={tw`flex gap-2`}>
              <Button onPress={() => setStep("1")}>Back</Button>
              <Button onPress={handleNext} isDisabled={recovering}>
                Next
              </Button>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

export default Restore;
