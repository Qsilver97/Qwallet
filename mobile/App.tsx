import { StyleSheet, ImageBackground, Dimensions, View } from "react-native";
import RootNavigation from "./src/navigation/RootNavigation";

export default function App() {
  return <RootNavigation />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: Dimensions.get("window").height,
  },
});
