import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import Input from "../components/Input";
import Button from "../components/Button";

const CreateScreen = () => {
  const [step, setStep] = useState<"password" | "seedType">("password");
  const [passwordInputType, setPasswordInputType] = useState<
    "password" | "text"
  >("password");
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

  // Handlers for Input, Radio, and Button would be defined here...

  return (
    <ScrollView contentContainerStyle={tw`p-4 items-center justify-center`}>
      <View
        style={tw`bg-white dark:bg-black w-full max-w-[500px] p-10 rounded-lg shadow-lg text-center`}
      >
        <Image
          source={require("../path/to/your/images/logo.png")}
          style={tw`w-24 h-24 mx-auto`}
        />
        <Text style={tw`text-xl dark:text-white my-4`}>Create</Text>

        <Text style={tw`text-base dark:text-white mb-6`}>
          {step === "password"
            ? "Secure your account with a new password."
            : "There are two ways to create your account."}
        </Text>

        {step === "password" && (
          <>
            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry={passwordInputType === "password"}
            />
            {!passwordStatus && (
              <Text style={tw`text-red-600 text-left w-full`}>
                Password already exists.
              </Text>
            )}
            <Input
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              secureTextEntry={passwordInputType === "password"}
            />
            {password !== confirmPassword && (
              <Text style={tw`text-red-600 text-left w-full`}>
                Passwords do not match.
              </Text>
            )}

            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={tw`absolute right-3 top-[15px]`}
            >
              <Text style={tw`text-gray-500`}>
                {passwordInputType === "password" ? "Show" : "Hide"}
              </Text>
            </TouchableOpacity>

            <View style={tw`flex-row justify-between mt-4`}>
              <Button title="Back" onPress={() => setStep("password")} />
              <Button
                title="Next"
                onPress={() => setStep("seedType")}
                disabled={!passwordStatus || password !== confirmPassword}
              />
            </View>
          </>
        )}

        {step === "seedType" && (
          <>
            <View style={tw`flex-row justify-evenly mb-3`}>
              {/* <Radio
                label="24 Words"
                checked={seedType === "24words"}
                onChange={() => setSeedType("24words")}
              />
              <Radio
                label="55 Chars"
                checked={seedType === "55chars"}
                onChange={() => setSeedType("55chars")}
              /> */}
            </View>

            <View style={tw`flex-row justify-between mt-4`}>
              <Button title="Back" onPress={() => setStep("password")} />
              <Button
                title="Create"
                onPress={() => {}}
                disabled={creatingStatus}
              />
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default CreateScreen;
