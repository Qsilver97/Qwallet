import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Keyboard,
} from "react-native";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import tw from "tailwind-react-native-classnames";

const Login: React.FC = () => {
  const navigation = useNavigation(); // Using React Navigation's hook

  const [passwordInputType, setPasswordInputType] =
    useState<string>("password");
  const [loginWaiting, setLoginWaiting] = useState<boolean>(false);

  const handleLogin = () => {};

  // Other functions remain largely the same, with adjustments for React Native as needed

  return (
    <View style={tw`bg-gray-200 mx-auto p-10 rounded-lg shadow-2xl`}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={tw`w-24 h-24 mx-auto`}
      />
      <Text style={tw`my-4 text-xl text-center text-gray-800`}>Login</Text>
      <View style={tw`relative mb-4`}>
        <TextInput
          secureTextEntry={passwordInputType === "password"}
          style={tw`w-full p-2 border-b border-gray-300 bg-transparent text-gray-800 text-lg`}
          placeholder="Password"
          onChangeText={(text) => {}}
          onSubmitEditing={handleLogin}
        />
        <TouchableOpacity
          onPress={() =>
            setPasswordInputType((prev) =>
              prev === "text" ? "password" : "text"
            )
          }
          style={tw`absolute inset-y-0 right-0 flex items-center pr-3`}
        >
          <FontAwesomeIcon
            icon={passwordInputType === "password" ? faEye : faEyeSlash}
            size={20}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={handleLogin}
        disabled={loginWaiting}
        style={tw`my-2 bg-blue-500 py-2 rounded-lg`}
      >
        <Text style={tw`text-center text-white text-lg`}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;
