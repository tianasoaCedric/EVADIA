import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "./types";
import ProfileScreen from "../screens/ProfileScreen";
import ReservationsScreen from "../screens/ReservationsScreen";
import ReservationChatScreen from "../screens/ReservationChatScreen";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="Reservations" component={ReservationsScreen} />
      <Stack.Screen name="ReservationChat" component={ReservationChatScreen} />
    </Stack.Navigator>
  );
}
