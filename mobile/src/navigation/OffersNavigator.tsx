import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { OffersStackParamList } from "./types";
import OffersScreen from "../screens/OffersScreen";
import OfferDetailScreen from "../screens/OfferDetailScreen";

const Stack = createNativeStackNavigator<OffersStackParamList>();

export default function OffersNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OffersList" component={OffersScreen} />
      <Stack.Screen name="OfferDetail" component={OfferDetailScreen} />
    </Stack.Navigator>
  );
}
