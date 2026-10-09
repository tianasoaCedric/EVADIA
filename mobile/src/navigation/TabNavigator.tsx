import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "./types";

import HomeScreen from "../screens/HomeScreen";
import DestinationNavigator from "./DestinationNavigator";
import FavoritesScreen from "../screens/FavoritesScreen";
import OffersNavigator from "./OffersNavigator";
import ProfileNavigator from "./ProfileNavigator";

import {
  HomeTabIcon,
  DestinationTabIcon,
  FavoritesTabIcon,
  OffersTabIcon,
} from "../components/atoms/TabIcons";
import TabAvatar from "../components/atoms/TabAvatar";

const Tab = createBottomTabNavigator<MainTabParamList>();

const ACTIVE = "#01BDA5";
const INACTIVE = "#626262";

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          height: 67,
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 8,
          borderRadius: 0,
        },
        tabBarLabelStyle: {
          fontFamily: "Outfit_300Light",
          fontSize: 11,
          lineHeight: 14,
          letterSpacing: 0.55,
        },
        tabBarItemStyle: {
          paddingVertical: 6,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Accueil",
          tabBarIcon: ({ color }) => <HomeTabIcon color={color} size={30} />,
        }}
      />
      <Tab.Screen
        name="Destination"
        component={DestinationNavigator}
        options={{
          tabBarLabel: "Destination",
          tabBarIcon: ({ color }) => <DestinationTabIcon color={color} size={30} />,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: "Favoris",
          tabBarIcon: ({ color }) => <FavoritesTabIcon color={color} size={30} />,
        }}
      />
      <Tab.Screen
        name="Offers"
        component={OffersNavigator}
        options={{
          tabBarLabel: "Offres",
          tabBarIcon: ({ color }) => <OffersTabIcon color={color} size={30} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarLabel: "Vous",
          tabBarIcon: ({ focused }) => <TabAvatar focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
