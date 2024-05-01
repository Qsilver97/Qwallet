import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColors } from "../../../context/ColorContex";
import CreatePassword from "./CreatePassword";
import Reminder from "./Reminder";
import Confirm from "./Confirm";

type CreateStackParamList = {
  CreatePassword: undefined;
  Reminder: undefined;
  Confirm: undefined;
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
    </Stack.Navigator>
  );
};

export default Create;
