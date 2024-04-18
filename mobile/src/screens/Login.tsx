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
import { login } from "../api/api";
import eventEmitter from "../api/eventEmitter";
import { UserDetailType, useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { password } = useSelector((state: RootState) => state.app);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [passwordStatus, setPasswordStatus] = useState<boolean>(false);
  const [loginWaiting, setLoginWaiting] = useState<boolean>(false);
  const auth = useAuth();

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
      Toast.show({ type: "error", text1: "Input password" });
      return;
    }

    setLoginWaiting(true);
    login(password);
    // setTimeout(() => {
    //   setLoginWaiting(false);
    //   setPasswordStatus(true);
    //   Toast.show({ type: "error", text1: "Login failed. Please try again." });
    // }, 5000);
  };
  useEffect(() => {
    eventEmitter.on("S2C/login", (res) => {
      if (res.success) {
        Toast.show({ type: "success", text1: "Login Success!" });
        const userInfo: UserDetailType = res.data;
        auth.login(userInfo);
        dispatch(resetState());
        dispatch(setIsAuthenticated(true));
        navigation.navigate("Dashboard")
      } else {
        setPasswordStatus(true);
        dispatch(setIsAuthenticated(false));
        Toast.show({ type: "error", text1: res.error });
      }
      setLoginWaiting(false);
    });
  }, []);

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
          // isDisabled={password === "" || loginWaiting}
          isDisabled={loginWaiting}
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
