import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColors } from "../../../context/ColorContex";
import CreatePassword from "./CreatePassword";
import Reminder from "./Reminder";

type CreateStackParamList = {
  CreatePassword: undefined;
  Reminder: undefined;
};

const Stack = createNativeStackNavigator<CreateStackParamList>();

const Create: React.FC = () => {
  const { bgColor, textColor } = useColors();

  return (
    <Stack.Navigator
      initialRouteName="Reminder"
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
    </Stack.Navigator>
  );
};

export default Create;
