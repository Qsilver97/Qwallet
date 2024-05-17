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
  const lang = local.Title;
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
        options={{ title: lang.CreatePassword }}
      />
      <Stack.Screen
        name="Reminder"
        component={Reminder}
        options={{ title: lang.Reminder }}
      />
      <Stack.Screen
        name="Confirm"
        component={Confirm}
        options={{ title: lang.Confirm }}
      />
      <Stack.Screen
        name="SeedType"
        component={SeedType}
        options={{ title: lang.SeedType }}
      />
    </Stack.Navigator>
  );
};

export default Create;
