import React, { useEffect, useState } from "react";
import { VStack, Text, Icon, Image, IconButton } from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  TouchableOpacity,
} from "react-native";
// import nodejs from "nodejs-mobile-react-native";
import Toast from "react-native-toast-message";
import ButtonBox from "@app/components/UI/ButtonBox";
import PageButton from "@app/components/UI/PageButton";
import local from "@app/utils/locales";
import { UserDetailType, useAuth } from "@app/context/AuthContext";
import { login } from "@app/api/api";
import { useColors } from "@app/context/ColorContex";
import {
  resetState,
  setIsAuthenticated,
  setPassword,
} from "@app/redux/appSlice";
import { RootState } from "@app/redux/store";
import eventEmitter from "@app/api/eventEmitter";
import Input from "@app/components/UI/Input";

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { bgColor } = useColors();
  const { password } = useSelector((state: RootState) => state.app);
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
        navigation.navigate("Main");
      } else {
        setPasswordStatus(true);
        dispatch(setIsAuthenticated(false));
        Toast.show({ type: "error", text1: res.error });
      }
      setLoginWaiting(false);
    });
  }, []);

  return (
    <VStack
      space={10}
      alignItems="center"
      bgColor={bgColor}
      flex={1}
      justifyContent="center"
      justifyItems="center"
    >
      <VStack
        space={10}
        alignItems="center"
        flex={1}
        justifyContent="center"
        justifyItems="center"
      >
        <Image source={require("@assets/icon.png")} alt="Logo" size="xl" />
        <Text fontSize="5xl">{local.Login.Login}</Text>
        <Input
          value={password}
          onChangeText={handlePasswordChange}
          onKeyPress={handleKeyDown}
          placeholder={local.Login.placeholder_Password}
          type="password"
        />
        {passwordStatus && <Text color="red.600">{local.Login.NotExist}</Text>}
      </VStack>
      <ButtonBox>
        <PageButton
          title={local.Login.button_Login}
          type="primary"
          isDisabled={loginWaiting}
          onPress={handleLogin}
        ></PageButton>
        <PageButton
          title={local.Login.button_CreateNewWallet}
          type="disabled"
          onPress={() => navigation.navigate("Create")}
        ></PageButton>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Restore");
          }}
        >
          <Text textAlign={"center"}>
            {local.Login.button_ImportUsingSeedPhrase}
          </Text>
        </TouchableOpacity>
      </ButtonBox>
    </VStack>
  );
};

export default Login;
