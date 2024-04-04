import { StyleSheet, ImageBackground, Dimensions, View } from "react-native";
import RootNavigation from "./src/navigation/RootNavigation";

export default function App() {
  return (
    <View style={styles.container}>
      <RootNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: Dimensions.get("window").height,
  },
});
