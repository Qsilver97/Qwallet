import { StyleSheet, Dimensions, Text } from "react-native";
import RootNavigation from "./src/navigation/RootNavigation";
import { Button, NativeBaseProvider, extendTheme } from "native-base";
import { useEffect, useState } from "react";
import nodejs from "nodejs-mobile-react-native";

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
    <NativeBaseProvider theme={theme}>
      <RootNavigation />
      <Text>{text}</Text>
      <Button
        onPress={() =>
          nodejs.channel.send(JSON.stringify({ type: "C2S", data: "REQ" }))
        }
      >
        onPress
      </Button>
    </NativeBaseProvider>
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
