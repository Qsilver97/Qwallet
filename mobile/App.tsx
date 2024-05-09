import { StyleSheet, Dimensions, Text } from "react-native";
import RootNavigation from "./src/navigation/RootNavigation";
import { Button, NativeBaseProvider, extendTheme } from "native-base";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import { channelInit, login } from "./src/api/api";
import Toast from "react-native-toast-message";
import { AuthProvider } from "./src/context/AuthContext";
import { NetworkProvider } from "./src/context/NetworkContext";
import { SocketCom } from "./src/components/SocketComponent";
import RNFS from "react-native-fs";
import { ColorProvider } from "./src/context/ColorContex";
import theme from "./src/utils/ThemeConfig";
import local from "@app/utils/locales";

local.setLanguage("en");

export default function App() {
  const [text, setText] = useState("");
  useEffect(() => {
    channelInit(RNFS.DocumentDirectoryPath);
  }, []);
  return (
    <Provider store={store}>
      <AuthProvider>
        <SocketCom />
        <NetworkProvider defaultNetwork="mainnet">
          <NativeBaseProvider theme={theme}>
            <ColorProvider>
              <RootNavigation />
              <Toast />
            </ColorProvider>
          </NativeBaseProvider>
        </NetworkProvider>
      </AuthProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: Dimensions.get("window").height,
  },
});
