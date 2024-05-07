import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColors } from "@app/context/ColorContex";
import CreatePassword from "./CreatePassword";
import Reminder from "./Reminder";
import Confirm from "./Confirm";
import SeedType from "./SeedType";
import local from "@app/utils/locales";

type CreateStackParamList = {
  CreatePassword: undefined;
  Reminder: undefined;
  Confirm: undefined;
  SeedType: undefined;
};

const Stack = createNativeStackNavigator<CreateStackParamList>();

const Create: React.FC = () => {
  const { bgColor, textColor } = useColors();

  return (
    <Stack.Navigator
      initialRouteName="CreatePassword"
      screenOptions={{
        headerStyle: {
          backgroundColor: bgColor,
        },
        headerTintColor: textColor,
      }}
    >
      <Stack.Screen
        name="CreatePassword"
        component={CreatePassword}
        options={{ title: local.Title.CreatePassword }}
      />
      <Stack.Screen
        name="Reminder"
        component={Reminder}
        options={{ title: local.Title.Reminder }}
      />
      <Stack.Screen
        name="Confirm"
        component={Confirm}
        options={{ title: local.Title.Confirm }}
      />
      <Stack.Screen
        name="SeedType"
        component={SeedType}
        options={{ title: local.Title.SeedType }}
      />
    </Stack.Navigator>
  );
};

export default Create;
