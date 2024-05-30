import { useColors } from "@app/context/ColorContex";
import local from "@app/utils/locales";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faBookOpen,
  faClockRotateLeft,
  faGear,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import React, { useCallback, useEffect } from "react";
import Orderbook from "./Orderbook";
import Settings from "./Settings";
import Transaction from "./Transaction";
import Wallet from "./Wallet";
import Header from "./components/Header";
import TransferStatusFab from "./Wallet/TransferStatusFab";

const Tab = createBottomTabNavigator();

const Main = () => {
  const { bgColor, main, gray, textColor, panelBgColor } = useColors();

  useEffect(() => {
    AsyncStorage.setItem("init", "false");
  }, []);

  const tabBarOptions = useCallback(
    (icon: IconProp): BottomTabNavigationOptions => ({
      tabBarIcon: ({ color, size }) => (
        <FontAwesomeIcon icon={icon} color={textColor} size={size} />
      ),
      tabBarActiveBackgroundColor: panelBgColor,
      tabBarActiveTintColor: panelBgColor,
      tabBarInactiveBackgroundColor: bgColor,
      tabBarLabelStyle: { color: textColor },
      tabBarShowLabel: false,
    }),
    [bgColor, gray, panelBgColor]
  );

  return (
    <>
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
      <TransferStatusFab />
    </>
  );
};

export default Main;
