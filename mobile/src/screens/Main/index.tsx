import React, { useCallback, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Settings from "./Settings";
import Orderbook from "./Orderbook";
import Wallet from "./Wallet";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faBookOpen,
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import local from "@app/utils/locales";

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

  useEffect(() => {
    AsyncStorage.setItem("init", "false");
  });

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
      initialRouteName={local.Main.BottomTab.Wallet}
      screenOptions={{
        tabBarActiveTintColor: "white",
        header: () => <Header />,
      }}
    >
      <Tab.Screen
        name={local.Main.BottomTab.Wallet}
        component={Wallet}
        options={tabBarOptions(faWallet)}
      />
      <Tab.Screen
        name={local.Main.BottomTab.Orderbook}
        component={Orderbook}
        options={tabBarOptions(faBookOpen)}
      />
      <Tab.Screen
        name={local.Main.BottomTab.Transaction}
        component={Transaction}
        options={tabBarOptions(faClockRotateLeft)}
      />
      <Tab.Screen
        name={local.Main.BottomTab.Settings}
        component={Settings}
        options={tabBarOptions(faGear)}
      />
    </Tab.Navigator>
  );
};

export default Main;
