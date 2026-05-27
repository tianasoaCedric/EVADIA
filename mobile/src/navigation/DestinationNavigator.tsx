import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DestinationStackParamList } from "./types";
import DestinationScreen from "../screens/DestinationScreen";
import DestinationHotelsScreen from "../screens/DestinationHotelsScreen";
import HotelDetailScreen from "../screens/HotelDetailScreen";
import RoomDetailScreen from "../screens/RoomDetailScreen";
import BookingScreen from "../screens/BookingScreen";

const Stack = createNativeStackNavigator<DestinationStackParamList>();

export default function DestinationNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DestinationList" component={DestinationScreen} />
      <Stack.Screen name="DestinationHotels" component={DestinationHotelsScreen} />
      <Stack.Screen name="HotelDetail" component={HotelDetailScreen} />
      <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
    </Stack.Navigator>
  );
}
