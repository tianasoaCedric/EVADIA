import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { s as sc, vs, ms } from "../lib/scale";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/tokens";
import AppText from "../components/atoms/AppText";
import { ReservationItem, getReservations, cancelReservation, statutLabel } from "../services/reservationService";

function formatPrice(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const [intPart, decPart] = rounded.toFixed(2).split(".");
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return decPart === "00" ? intFormatted : `${intFormatted},${decPart}`;
}

const STATUT_COLORS: Record<string, string> = {
  confirmee: "#01BDA5",
  terminee: "#6B7280",
  annulee: "#EF4444",
  draft: "#F59E0B",
};

function ReservationCard({ item, onCancel }: { item: ReservationItem; onCancel: () => void }) {
  const color = STATUT_COLORS[item.statut] ?? "#6B7280";
  const dateDebut = new Date(item.date_debut).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  const dateFin = new Date(item.date_fin).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={s.hotelName}>{item.hotel_nom}</Text>
          {item.ville ? <Text style={s.ville}>{item.ville}</Text> : null}
        </View>
        <View style={[s.statutBadge, { backgroundColor: color + "20" }]}>
          <Text style={[s.statutText, { color }]}>{statutLabel(item.statut)}</Text>
        </View>
      </View>

      <View style={s.divider} />

      <View style={s.row}>
        <View style={s.dateBox}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={s.dateText}>{dateDebut}</Text>
        </View>
        <Ionicons name="arrow-forward" size={14} color="#9CA3AF" />
        <View style={s.dateBox}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={s.dateText}>{dateFin}</Text>
        </View>
      </View>

      <View style={s.row}>
        <Text style={s.codeText}>#{item.code_reservation}</Text>
        <Text style={s.priceText}>
          {formatPrice(item.prix_total)} {item.devise}
        </Text>
      </View>

      {item.statut === "confirmee" && (
        <TouchableOpacity style={s.cancelBtn} onPress={onCancel}>
          <Text style={s.cancelText}>Annuler</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function ReservationsScreen() {
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getReservations().then(setReservations).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id: number) => {
    try {
      await cancelReservation(id);
      setReservations((prev) => prev.map((r) => r.id === id ? { ...r, statut: "annulee" } : r));
    } catch {}
  };

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.header}>
        <AppText variant="h3" weight="bold">Mes réservations</AppText>
      </View>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color="#01BDA5" />
        </View>
      ) : reservations.length === 0 ? (
        <View style={s.centered}>
          <Ionicons name="calendar-outline" size={56} color={colors.neutral[300]} />
          <AppText variant="body" className="text-neutral-400">Aucune réservation pour l'instant</AppText>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          {reservations.map((item) => (
            <ReservationCard key={item.id} item={item} onCancel={() => handleCancel(item.id)} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { paddingHorizontal: sc(20), paddingTop: vs(24), paddingBottom: vs(16) },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: vs(12) },
  scrollContent: { padding: sc(20), gap: vs(16) },
  card: { backgroundColor: "#FFFFFF", borderRadius: sc(16), padding: sc(16), gap: vs(12), shadowColor: "#000", shadowOffset: { width: 0, height: vs(2) }, shadowOpacity: 0.07, shadowRadius: sc(8), elevation: 3 },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: sc(10) },
  hotelName: { fontFamily: "Outfit_600SemiBold", fontSize: ms(15), color: "#000000" },
  ville: { fontFamily: "Outfit_400Regular", fontSize: ms(12), color: "#6B7280", marginTop: vs(2) },
  statutBadge: { borderRadius: sc(20), paddingHorizontal: sc(10), paddingVertical: vs(4) },
  statutText: { fontFamily: "Outfit_500Medium", fontSize: ms(12) },
  divider: { height: 1, backgroundColor: "#F3F4F6" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dateBox: { flexDirection: "row", alignItems: "center", gap: sc(4) },
  dateText: { fontFamily: "Outfit_400Regular", fontSize: ms(13), color: "#6B7280" },
  codeText: { fontFamily: "Outfit_300Light", fontSize: ms(12), color: "#9CA3AF" },
  priceText: { fontFamily: "Outfit_700Bold", fontSize: ms(15), color: "#01BDA5" },
  cancelBtn: { alignSelf: "flex-end", paddingHorizontal: sc(16), paddingVertical: vs(6), borderRadius: sc(20), borderWidth: 1, borderColor: "#EF4444" },
  cancelText: { fontFamily: "Outfit_400Regular", fontSize: ms(12), color: "#EF4444" },
});
