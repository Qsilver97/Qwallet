import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import local from "@app/utils/locales";
import { useColors } from "@app/context/ColorContex";
import Splash from "@app/screens/Splash/Splash";
import WalletSetup from "@app/screens/Setup/WalletSetup";
import Dashboard from "@app/screens/Dashboard";
import Login from "@app/screens/Login";
import Backup from "@app/screens/Backup";
import Confirm from "@app/screens/Confirm";
import Restore from "@app/screens/Setup/Restore";
import Create from "@app/screens/Setup/Create";
import Main from "@app/screens/Main";

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
  Main: undefined;
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
          options={{ title: local.Title.WalletSetup }}
        />
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{ title: local.Title.Dashboard }}
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
          name="Backup"
          component={Backup}
          options={{ title: local.Title.Backup }}
        />
        <Stack.Screen
          name="Confirm"
          component={Confirm}
          options={{ title: local.Title.Confirm }}
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
