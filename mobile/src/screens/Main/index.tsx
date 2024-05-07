import React, { useCallback } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Settings from "./Settings";
import Swap from "./Swap";
import Wallet from "./Wallet";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faGear, faRefresh, faWallet } from "@fortawesome/free-solid-svg-icons";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useColors } from "@app/context/ColorContex";

const Tab = createBottomTabNavigator();

function MyTabs() {
  const { bgColor, textColor, gray } = useColors();

  const tabBarOptions = useCallback(
    (icon: IconProp): BottomTabNavigationOptions => ({
      tabBarIcon: ({ color, size }) => (
        <FontAwesomeIcon icon={icon} color={gray.gray40} size={size} />
      ),
      tabBarActiveBackgroundColor: bgColor,
      tabBarInactiveBackgroundColor: bgColor,
    }),
    [bgColor, gray]
  );

  return (
    <Tab.Navigator
      initialRouteName="Wallet"
      screenOptions={{
        tabBarActiveTintColor: "white",
      }}
    >
      <Tab.Screen
        name="Wallet"
        component={Wallet}
        options={tabBarOptions(faWallet)}
      />
      <Tab.Screen
        name="Swap"
        component={Swap}
        options={tabBarOptions(faRefresh)}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={tabBarOptions(faGear)}
      />
    </Tab.Navigator>
  );
}

export default MyTabs;
