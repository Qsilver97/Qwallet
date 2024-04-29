import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Dashboard from "../screens/Dashboard";
import Login from "../screens/Login";
import Create from "../screens/Setup/Create";
import Backup from "../screens/Backup";
import Confirm from "../screens/Confirm";
import Restore from "../screens/Setup/Restore";
import Splash from "../screens/Splash/Splash";
import WalletSetup from "../screens/Setup/WalletSetup";
import { useColors } from "../context/ColorContex";

type RootStackParamList = {
  Dashboard: undefined;
  Login: undefined;
  Create: undefined;
  Backup: undefined;
  Confirm: undefined;
  Restore: undefined;
  Cli: undefined;
  CliSocket: undefined;
  Splash: undefined;
  WalletSetup: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigation: React.FC = () => {
  const { bgColor, textColor } = useColors();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
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
          options={{ title: "Setup Wallet" }}
        />
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{ title: "Dashboard" }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ title: "Login" }}
        />
        <Stack.Screen
          name="Create"
          component={Create}
          options={{ title: "Create New Wallet" }}
        />
        <Stack.Screen
          name="Backup"
          component={Backup}
          options={{ title: "Backup Wallet" }}
        />
        <Stack.Screen
          name="Confirm"
          component={Confirm}
          options={{ title: "Confirm Action" }}
        />
        <Stack.Screen
          name="Restore"
          component={Restore}
          options={{ title: "Import Using Seed Phrase" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;
