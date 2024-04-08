import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Image,
  StyleSheet,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import tw from "tailwind-react-native-classnames";
import Button from "../components/Button";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const Login: React.FC<{
  navigation: NativeStackNavigationProp<any>;
}> = ({ navigation }) => {
  const [password, setPassword] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<boolean>(false);
  const [loginWaiting, setLoginWaiting] = useState<boolean>(false);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
  };

  const handleKeyDown = () => {};
  const handleCreate = () => {
    navigation.navigate("Dashboard");
  };
  const handleRestore = () => {
    navigation.navigate("Restore");
  };
  const handleLogin = () => {
    navigation.navigate("Dashboard");
  };

  return (
    <View style={[tw`mx-auto text-center my-auto`, styles.container]}>
      <Image
        source={require("../../assets/icon.png")}
        style={tw`w-20 h-20 mx-auto`}
      />
      <Text style={[tw`text-xl font-bold my-4 mx-auto`, styles.text]}>
        Login
      </Text>
      <Text
        style={[tw`mb-5 text-base font-normal mx-auto`, styles.description]}
      >
        Enter your password to access your account.
        {"\n"}Each password corresponds to a unique user account.
      </Text>
      <View style={tw`relative`}>
        <View style={tw`relative mb-4`}>
          <TextInput
            secureTextEntry={!passwordVisible}
            style={tw`w-full p-2 border-b border-gray-300 bg-transparent text-gray-800 text-lg`}
            placeholder="Password"
            onChangeText={handlePasswordChange}
            onSubmitEditing={handleLogin}
          />
          <Pressable
            onPress={() => setPasswordVisible(!passwordVisible)}
            style={[tw`absolute inset-y-4 right-0 flex items-center pr-3`]}
          >
            <FontAwesomeIcon
              icon={passwordVisible ? faEyeSlash : faEye}
              size={20}
            />
          </Pressable>
        </View>{" "}
        {passwordStatus && (
          <Text style={tw`w-full text-left text-red-600`}>
            Password does not exist.
          </Text>
        )}
        <Button
          title="Login"
          onPress={handleLogin}
          disabled={passwordStatus || password === "" || loginWaiting}
        />
        <Button title="Create" onPress={handleCreate} />
        <Pressable onPress={handleRestore}>
          <Text style={tw`text-blue-500`}>
            Restore your wallet from your seed
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8fafc",
    padding: 40,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
  },
  text: {
    color: "#374151",
  },
  description: {
    lineHeight: 25,
  },
  iconPosition: {
    top: 15,
  },
});

export default Login;
