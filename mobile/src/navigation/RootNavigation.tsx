import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import local from "@app/utils/locales";
import { useColors } from "@app/context/ColorContex";
import Splash from "@app/screens/Splash/Splash";
import WalletSetup from "@app/screens/Setup/WalletSetup";
import Login from "@app/screens/Login";
import Restore from "@app/screens/Setup/Restore";
import Create from "@app/screens/Setup/Create";
import Main from "@app/screens/Main";

type RootStackParamList = {
  Dashboard: undefined;
  Login: undefined;
  Create: undefined;
  Restore: undefined;
  Cli: undefined;
  CliSocket: undefined;
  Splash: undefined;
  WalletSetup: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigationProps {
  init: boolean;
}

const RootNavigation: React.FC<RootNavigationProps> = ({ init }) => {
  const { bgColor, textColor } = useColors();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={init ? "Splash" : "Login"}
        screenOptions={{
          headerStyle: {
            backgroundColor: bgColor,
          },
          headerTintColor: textColor,
        }}
      >
        <Stack.Screen
          name="Splash"
          component={Splash}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="WalletSetup"
          component={WalletSetup}
          options={{ title: local.Title.WalletSetup }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ title: local.Title.Login }}
        />
        <Stack.Screen
          name="Create"
          component={Create}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Restore"
          component={Restore}
          options={{ title: local.Title.Backup }}
        />
        <Stack.Screen
          name="Main"
          component={Main}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;
