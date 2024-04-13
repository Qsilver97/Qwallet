import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import {
  VStack,
  Image,
  Text,
  Input,
  Button,
  IconButton,
  Icon,
  Radio,
} from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import eventEmitter from "../api/eventEmitter";
import { create } from "../api/api";

const Create: React.FC = () => {
  const [step, setStep] = useState<"password" | "seedType">("password");
  const [passwordInputType, setPasswordInputType] = useState<
    "password" | "text"
  >("password");
  const navigation = useNavigation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState(true);
  const [seedType, setSeedType] = useState<"24words" | "55chars">("24words");
  const [creatingStatus, setCreatingStatus] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordInputType((prevType) =>
      prevType === "password" ? "text" : "password"
    );
  };
  const handleCreate = () => {
    setCreatingStatus(true);
    let passwordPrefix = "";
    if (seedType == "55chars") passwordPrefix = "Q";
    create(`login ${passwordPrefix}${password}`);
  };

  useEffect(() => {
    eventEmitter.on("S2C/create", (res) => {
      if (res.success) {
        Toast.show({ type: "success", text1: "Login Success!" });
      } else {
        setPasswordStatus(true);
        Toast.show({ type: "error", text1: res.error });
      }
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
        <Text fontSize="xl" my="4">
          Create
        </Text>

        <Text fontSize="md" mb="6">
          {step === "password"
            ? "Secure your account with a new password."
            : "There are two ways to create your account."}
        </Text>

        {step === "password" && (
          <>
            <Input
              w="100%"
              type={passwordInputType}
              value={password}
              onChangeText={(text) => setPassword(text)}
              placeholder="Password"
              InputRightElement={
                <IconButton
                  icon={
                    <Icon
                      as={
                        <MaterialIcons
                          name={
                            passwordInputType === "password"
                              ? "visibility"
                              : "visibility-off"
                          }
                        />
                      }
                      size={5}
                    />
                  }
                  onPress={togglePasswordVisibility}
                />
              }
            />
            {!passwordStatus && (
              <Text color="red.600">Password already exists.</Text>
            )}
            <Input
              w="100%"
              type={passwordInputType}
              value={confirmPassword}
              onChangeText={(text) => setConfirmPassword(text)}
              placeholder="Confirm Password"
            />
            {password !== confirmPassword && (
              <Text color="red.600">Passwords do not match.</Text>
            )}

            <Button.Group space={2} mt="4" w="80%">
              <Button onPress={() => navigation.navigate("Login")} w="50%">
                Back
              </Button>
              <Button
                onPress={() => setStep("seedType")}
                w="50%"
                isDisabled={!passwordStatus || password !== confirmPassword}
              >
                Next
              </Button>
            </Button.Group>
          </>
        )}

        {step === "seedType" && (
          <>
            <Radio.Group
              name="seedType"
              accessibilityLabel="Choose seed type"
              value={seedType}
              onChange={(nextValue) => {
                setSeedType(nextValue);
              }}
              flexDirection="row"
              justifyContent="space-evenly"
              mb="3"
              space="2"
              w="100%"
            >
              <Radio value="24words" my="1">
                24 Words
              </Radio>
              <Radio value="55chars" my="1">
                55 Chars
              </Radio>
            </Radio.Group>

            <Button.Group space={2} mt="4" w="80%">
              <Button onPress={() => setStep("password")} w="50%">
                Back
              </Button>
              <Button
                onPress={handleCreate}
                isDisabled={creatingStatus}
                w="50%"
              >
                Create
              </Button>
            </Button.Group>
          </>
        )}
      </VStack>
    </ScrollView>
  );
};

export default Create;
