import React, { useCallback, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Settings from "./Settings";
import Swap from "./Swap";
import Wallet from "./Wallet";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faClockRotateLeft,
  faGear,
  faRightLeft,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useColors } from "@app/context/ColorContex";
import Header from "./components/Header";
import Transaction from "./Transaction";
import { basicInfo } from "@app/api/api";

const Tab = createBottomTabNavigator();

const Main = () => {
  const { bgColor, main, gray } = useColors();

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     basicInfo();
  //   }, 2000);

  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, []);

  const tabBarOptions = useCallback(
    (icon: IconProp): BottomTabNavigationOptions => ({
      tabBarIcon: ({ color, size }) => (
        <FontAwesomeIcon icon={icon} color={gray.gray40} size={size} />
      ),
      tabBarActiveBackgroundColor: main.hakesBlue,
      tabBarActiveTintColor: main.darkGunmetal,
      tabBarInactiveBackgroundColor: bgColor,
    }),
    [bgColor, gray]
  );

  return (
    <Tab.Navigator
      initialRouteName="Wallet"
      screenOptions={{
        tabBarActiveTintColor: "white",
        header: () => <Header />,
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
        options={tabBarOptions(faRightLeft)}
      />
      <Tab.Screen
        name="Transaction"
        component={Transaction}
        options={tabBarOptions(faClockRotateLeft)}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={tabBarOptions(faGear)}
      />
    </Tab.Navigator>
  );
}

export default Main;
