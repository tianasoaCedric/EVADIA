import React, { useCallback, useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AppText from "../components/atoms/AppText";
import { colors } from "../lib/tokens";
import { reservationsApi } from "../lib/reservations";
import type { Reservation } from "../lib/types";
import type { ProfileStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<ProfileStackParamList, "Reservations">;

function ReservationCard({ reservation, onPress }: { reservation: Reservation; onPress: () => void }) {
  const hotelName = reservation.propriete?.hotel?.nom ?? reservation.propriete?.nom ?? "Hôtel";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{
      backgroundColor: "#F5F5F5",
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
        <AppText variant="body" weight="semibold">{hotelName}</AppText>
        <StatutBadge statut={reservation.statut} />
      </View>
      <AppText variant="caption" className="text-neutral-500">{reservation.code_reservation}</AppText>
      <AppText variant="caption" className="text-neutral-500">
        {reservation.date_debut} → {reservation.date_fin}
      </AppText>
    </TouchableOpacity>
  );
}

function StatutBadge({ statut }: { statut: Reservation["statut"] }) {
  const map: Record<Reservation["statut"], { label: string; bg: string; fg: string }> = {
    en_attente: { label: "En attente", bg: "#FEF3C7", fg: "#92400E" },
    acceptee: { label: "Confirmée", bg: "#D1FAE5", fg: "#065F46" },
    refusee: { label: "Refusée", bg: "#FEE2E2", fg: "#991B1B" },
    annulee: { label: "Annulée", bg: "#F3F4F6", fg: "#4B5563" },
    terminee: { label: "Terminée", bg: "#E5E7EB", fg: "#374151" },
  };
  const s = map[statut];
  return (
    <View style={{ backgroundColor: s.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
      <AppText variant="caption" style={{ color: s.fg }}>{s.label}</AppText>
    </View>
  );
}

export default function ReservationsScreen() {
  const navigation = useNavigation<Nav>();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await reservationsApi.list();
      setReservations(data);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setIsRefreshing(true);
    load();
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="px-5 pt-6 pb-2">
        <AppText variant="h3" weight="bold">Mes réservations</AppText>
      </View>

      {!isLoading && reservations.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3">
          <Ionicons name="calendar-outline" size={56} color={colors.neutral[300]} />
          <AppText variant="body" className="text-neutral-400">Aucune réservation pour l'instant</AppText>
        </View>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <ReservationCard
              reservation={item}
              onPress={() => navigation.navigate("ReservationChat", { reservationId: item.id })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
