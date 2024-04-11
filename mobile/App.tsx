import { StyleSheet, Dimensions, Text } from "react-native";
import RootNavigation from "./src/navigation/RootNavigation";
import { Button, NativeBaseProvider, extendTheme } from "native-base";
import { useEffect, useState } from "react";
import nodejs from "nodejs-mobile-react-native";
// import axios from "axios";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";

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
    nodejs.start("main.js");
    nodejs.channel.addListener("message", (msg) => {
      setText("From node: " + msg);
    });
  }, []);
  return (
    <Provider store={store}>
      <NativeBaseProvider theme={theme}>
        <RootNavigation />
        <Text>{text}</Text>
        <Button
          onPress={() =>
            nodejs.channel.send(
              JSON.stringify({ action: "C2S/login", data: { password: "123" } })
            )
          }
        >
          onPress
        </Button>
      </NativeBaseProvider>
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
