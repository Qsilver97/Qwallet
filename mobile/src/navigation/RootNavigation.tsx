import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Dashboard from "../screens/Dashboard";
import Login from "../screens/Login";
import Create from "../screens/Create";
import Backup from "../screens/Backup";
import Confirm from "../screens/Confirm";
import Restore from "../screens/Restore";

type RootStackParamList = {
  Dashboard: undefined;
  Login: undefined;
  Create: undefined;
  Backup: undefined;
  Confirm: undefined;
  Restore: undefined;
  Cli: undefined;
  CliSocket: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigation: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Create" component={Create} />
        <Stack.Screen name="Backup" component={Backup} />
        <Stack.Screen name="Confirm" component={Confirm} />
        <Stack.Screen name="Restore" component={Restore} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;
