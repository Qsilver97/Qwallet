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
import theme from "./src/ThemeCofig";
import { ColorProvider } from "./src/context/ColoreContext";

export default function App() {
  useEffect(() => {
    channelInit(RNFS.DocumentDirectoryPath);
  }, []);
  return (
    <Provider store={store}>
      <SocketCom />
      <AuthProvider>
        <NativeBaseProvider theme={theme}>
          <ColorProvider>
            <NetworkProvider defaultNetwork="mainnet">
              <RootNavigation />
              <Toast />
            </NetworkProvider>
          </ColorProvider>
        </NativeBaseProvider>
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
