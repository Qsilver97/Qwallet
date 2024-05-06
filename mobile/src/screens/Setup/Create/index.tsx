import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColors } from "@app/context/ColorContex";
import CreatePassword from "./CreatePassword";
import Reminder from "./Reminder";
import Confirm from "./Confirm";
import SeedType from "./SeedType";

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
        options={{ title: "Create Password" }}
      />
      <Stack.Screen
        name="Reminder"
        component={Reminder}
        options={{ title: "Secure Alert" }}
      />
      <Stack.Screen
        name="Confirm"
        component={Confirm}
        options={{ title: "Confrim Seeds Phrase" }}
      />
      <Stack.Screen
        name="SeedType"
        component={SeedType}
        options={{ title: "Select Seed Type" }}
      />
    </Stack.Navigator>
  );
};

export default Create;
