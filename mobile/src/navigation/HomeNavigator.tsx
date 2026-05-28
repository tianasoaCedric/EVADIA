import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeStackParamList } from "./types";
import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import HotelDetailScreen from "../screens/HotelDetailScreen";
import DestinationHotelsScreen from "../screens/DestinationHotelsScreen";
import RoomDetailScreen from "../screens/RoomDetailScreen";
import BookingScreen from "../screens/BookingScreen";
import ReservationsScreen from "../screens/ReservationsScreen";

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="HotelDetail" component={HotelDetailScreen} />
      <Stack.Screen name="DestinationHotels" component={DestinationHotelsScreen} />
      <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="Reservations" component={ReservationsScreen} />
    </Stack.Navigator>
  );
}
