import React, { useEffect, useState } from "react";
import {
  VStack,
  Text,
  Input,
  Icon,
  Button,
  Pressable,
  Image,
  ScrollView,
  IconButton,
  useToast,
} from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { resetState, setIsAuthenticated, setPassword } from "../redux/appSlice";
import { RootState } from "../redux/store";
import { NativeSyntheticEvent, TextInputKeyPressEventData } from "react-native";
// import nodejs from "nodejs-mobile-react-native";
import Toast from "react-native-toast-message";

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { password } = useSelector((state: RootState) => state.app);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [passwordStatus, setPasswordStatus] = useState<boolean>(false);
  const [loginWaiting, setLoginWaiting] = useState<boolean>(false);

  const toast = useToast();

  const handlePasswordChange = (value: string) => {
    dispatch(setPassword(value));
  };

  const handleKeyDown = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (event.nativeEvent.key === "Enter") {
      handleLogin();
    }
  };
  const handleLogin = () => {
    if (password === "") {
      Toast.show({ type: "info", text1: "Input password" });
      return;
    }

    setLoginWaiting(true);

    // Send login request to the Node.js layer
    // nodejs.channel.send(
    //   JSON.stringify({
    //     action: "login",
    //     data: { password },
    //   })
    // );

    const handleMessage = (msg: string) => {
      const data = JSON.parse(msg);

      if (data.action === "loginResponse") {
        setLoginWaiting(false);

        if (data.success) {
          // Perform success actions, e.g., navigate to Dashboard
          dispatch(setIsAuthenticated(true));
          navigation.navigate("Dashboard");
        } else {
          // Show error toast
          Toast.show({
            type: "error",
            text1: data.error || "Login failed. Please try again.",
          });
        }
      }
    };

    // Listen for a message from the Node.js layer
    // nodejs.channel.addListener("message", handleMessage);

    // Don't forget to remove the listener when the component unmounts
    // return () => {
    //   nodejs.channel.removeListener("message", handleMessage);
    // };
  };
  // const handleLogin = () => {
  //   setLoginWaiting(true);
  //   setTimeout(() => {
  //     setLoginWaiting(false);
  //     // navigation.navigate("Dashboard");
  //     setPasswordStatus(true);
  //     Toast.show({ type: "error", text1: "Login failed. Please try again." });
  //   }, 500);
  // };

  return (
    <ScrollView contentContainerStyle={{ padding: 4 }}>
      <VStack
        style={tw`items-center mx-auto pt-16`}
        w="90%"
        maxW="300px"
        space={5}
      >
        <Image source={require("../../assets/icon.png")} alt="Logo" size="xl" />
        <Text fontSize="2xl">Login</Text>
        <Text textAlign="center">
          Enter your password to access your account.{"\n"}
          Each password corresponds to a unique user account.
        </Text>
        <Input
          style={tw`w-full`}
          value={password}
          onChangeText={handlePasswordChange}
          onKeyPress={handleKeyDown}
          placeholder="Password"
          type={passwordVisible ? "text" : "password"}
          InputRightElement={
            <IconButton
              icon={
                <Icon
                  as={
                    <MaterialIcons
                      name={passwordVisible ? "visibility" : "visibility-off"}
                    />
                  }
                  size="md"
                />
              }
              onPress={() => setPasswordVisible(!passwordVisible)}
              size="md"
              style={tw`mr-2`}
            />
          }
        />
        {passwordStatus && (
          <Text color="red.600">Password does not exist.</Text>
        )}
        <Button
          onPress={handleLogin}
          isLoading={loginWaiting}
          isDisabled={password === "" || loginWaiting}
          style={tw`w-full`}
        >
          Login
        </Button>
        <Button
          onPress={() => navigation.navigate("Create")}
          variant="outline"
          style={tw`w-full`}
        >
          Create
        </Button>
        <Pressable onPress={() => navigation.navigate("Restore")}>
          <Text color="info.500" mt="2">
            Restore your wallet from your seed
          </Text>
        </Pressable>
      </VStack>
    </ScrollView>
  );
};

export default Login;
