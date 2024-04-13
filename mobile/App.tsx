import { StyleSheet, Dimensions, Text } from "react-native";
import RootNavigation from "./src/navigation/RootNavigation";
import { Button, NativeBaseProvider, extendTheme } from "native-base";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import { channelInit, login } from "./src/api/api";
import Toast from "react-native-toast-message";
import { AuthProvider } from "./src/context/AuthContext";

const config = {
  useSystemColorMode: true,
  components: {
    Button: {
      defaultProps: {
        colorScheme: "info",
      },
    },
    IconButton: {
      defaultProps: {
        colorScheme: "info",
      },
    },
    Input: {
      defaultProps: {
        colorScheme: "info",
      },
    },
  },
};

const theme = extendTheme({ ...config });

export default function App() {
  const [text, setText] = useState("");
  useEffect(() => {
    channelInit();
  }, []);
  return (
    <Provider store={store}>
      <AuthProvider>
        <NativeBaseProvider theme={theme}>
          <RootNavigation />
          <Toast />
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
