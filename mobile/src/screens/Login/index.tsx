import React, { useEffect, useMemo, useState } from "react";
import { VStack, Text, useColorMode, KeyboardAvoidingView } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {
  Image,
  NativeSyntheticEvent,
  Platform,
  TextInputKeyPressEventData,
  TouchableOpacity,
} from "react-native";
// import nodejs from "nodejs-mobile-react-native";
import Toast from "react-native-toast-message";
import ButtonBox from "@app/components/UI/ButtonBox";
import PageButton from "@app/components/UI/PageButton";
import local from "@app/utils/locales";
import { UserDetailType, useAuth } from "@app/context/AuthContext";
import { login, passwordAvail } from "@app/api/api";
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
  const lang = local.Login;
  const { colorMode } = useColorMode();

  const logoSource = useMemo(() => {
    return colorMode === "dark"
      ? require("@assets/icon.png")
      : require("@assets/favicon.png");
  }, [colorMode]);

  const handlePasswordChange = (value: string) => {
    passwordAvail(value);
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
      Toast.show({ type: "error", text1: "E11: " + "Input password!" });
      return;
    }

    setLoginWaiting(true);
    login(password);
    // setTimeout(() => {
    //   setLoginWaiting(false);
    //   setPasswordStatus(true);
    //   Toast.show({
    //     type: "error",
    //     text1: "E12: Login failed. Please try again.",
    //   });
    // }, 5000);
  };

  useEffect(() => {
    const handleLoginEvent = (res: any) => {
      if (res.success) {
        Toast.show({ type: "success", text1: lang.toast_LoginSuccess });
        const userInfo: UserDetailType = res.data;
        auth.login(userInfo);
        dispatch(resetState());
        dispatch(setIsAuthenticated(true));
        navigation.navigate("Main");
      } else {
        setPasswordStatus(true);
        dispatch(setIsAuthenticated(false));
        Toast.show({ type: "info", text1: res.error });
      }
      setLoginWaiting(false);
    };
    const handlePasswordAvailEvent = (res: any) => {
      setPasswordStatus(res.data);
    };
    eventEmitter.on("S2C/login", handleLoginEvent);
    eventEmitter.on("S2C/passwordAvail", handlePasswordAvailEvent);
    return () => {
      eventEmitter.off("S2C/login", handleLoginEvent);
      eventEmitter.off("S2C/passwordAvail", handlePasswordAvailEvent);
    };
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
      <KeyboardAvoidingView
        alignItems="center"
        flex={1}
        justifyContent="center"
        justifyItems="center"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Image
          source={logoSource}
          alt="Logo"
          style={{ width: 160, height: 160 }}
        />
        <Text fontSize="5xl">{lang.Login}</Text>
        <Input
          value={password}
          onChangeText={handlePasswordChange}
          onKeyPress={handleKeyDown}
          placeholder={lang.placeholder_Password}
          type="password"
          error={passwordStatus ? lang.NotExist : ""}
        />
      </KeyboardAvoidingView>
      <ButtonBox>
        <PageButton
          title={lang.button_Login}
          type="primary"
          isLoading={loginWaiting}
          onPress={handleLogin}
        ></PageButton>
        <PageButton
          title={lang.button_CreateNewWallet}
          type="disabled"
          onPress={() => navigation.navigate("Create")}
        ></PageButton>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Restore");
          }}
        >
          <Text textAlign={"center"}>{lang.button_ImportUsingSeedPhrase}</Text>
        </TouchableOpacity>
      </ButtonBox>
    </VStack>
  );
};

export default Login;
