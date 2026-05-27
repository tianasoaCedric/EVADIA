import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../components/atoms/AppText";
import { colors } from "../lib/tokens";

export default function ReservationsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-6">
        <AppText variant="h3" weight="bold">Mes réservations</AppText>
      </View>
      <View className="flex-1 items-center justify-center gap-3">
        <Ionicons name="calendar-outline" size={56} color={colors.neutral[300]} />
        <AppText variant="body" className="text-neutral-400">Aucune réservation pour l'instant</AppText>
      </View>
    </SafeAreaView>
  );
}
