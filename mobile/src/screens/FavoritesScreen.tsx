import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import SearchHeader from "../components/molecules/SearchHeader";
import { FavoriItem, getFavoris, removeFavori } from "../services/favoriService";

const FILTERS = ["Tous", "Favoris"];

function StarRating({ rating }: { rating: number | null }) {
  const filled = rating ? Math.round(rating) : 0;
  return (
    <View style={s.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons key={i} name="star" size={13} color={i <= filled ? "#FFE100" : "#E0E0E0"} />
      ))}
    </View>
  );
}

function FavCard({ item, onUnfav }: { item: FavoriItem; onUnfav: () => void }) {
  return (
    <View style={s.card}>
      <View style={s.imageBox}>
        <Image
          source={item.photo ? { uri: item.photo } : require("../assets/images/hotel.jpg")}
          style={s.image}
          resizeMode="cover"
        />
        <TouchableOpacity style={s.heartBtn} onPress={onUnfav}>
          <Ionicons name="heart" size={20} color="#FF1F66" />
        </TouchableOpacity>
      </View>
      <View style={s.info}>
        <Text style={s.cardText}>
          {item.nom}{"\n"}
          {item.ville}{"\n"}
          {item.prix_min.toLocaleString()} {item.devise}/nuité
        </Text>
        <View style={s.divider} />
        <View style={s.ratingsRow}>
          <StarRating rating={item.note_moyenne} />
          {item.note_moyenne !== null && <Text style={s.ratingText}>{item.note_moyenne.toFixed(2)}</Text>}
        </View>
      </View>
    </View>
  );
}

export default function FavoritesScreen() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [favs, setFavs] = useState<FavoriItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getFavoris().then(setFavs).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUnfav = async (hotelId: number) => {
    setFavs((prev) => prev.filter((f) => f.hotelId !== hotelId));
    try { await removeFavori(hotelId); } catch { load(); }
  };

  const visible = search.trim()
    ? favs.filter((f) => f.nom.toLowerCase().includes(search.toLowerCase()))
    : favs;

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <SearchHeader
        search={search}
        onSearchChange={setSearch}
        filters={FILTERS}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color="#01BDA5" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          <Text style={s.title}>Vos Favoris</Text>
          {visible.length === 0 ? (
            <View style={s.centered}>
              <Ionicons name="heart-outline" size={48} color="#D1D5DB" />
              <Text style={s.emptyText}>Aucun favori pour l'instant</Text>
            </View>
          ) : (
            <View style={s.grid}>
              {visible.map((item) => (
                <FavCard key={item.favoriId} item={item} onUnfav={() => handleUnfav(item.hotelId)} />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, marginTop: 40 },
  scrollContent: { paddingBottom: 32 },
  title: { fontFamily: "Manrope_700Bold", fontSize: 24, lineHeight: 30, color: "#000000", marginTop: 21, marginBottom: 16, paddingHorizontal: 29 },
  emptyText: { fontFamily: "Outfit_400Regular", fontSize: 14, color: "#9CA3AF" },
  grid: { paddingHorizontal: 29, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 26 },
  card: { width: 150, borderRadius: 15, backgroundColor: "#FFFFFF", paddingBottom: 10, gap: 5 },
  imageBox: { width: 150, height: 150, borderRadius: 15, overflow: "hidden" },
  image: { width: 150, height: 150 },
  heartBtn: { position: "absolute", top: 9, right: 9, width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  info: { paddingHorizontal: 6, gap: 6 },
  cardText: { fontFamily: "Outfit_600SemiBold", fontSize: 12, lineHeight: 15, letterSpacing: 0.24, color: "#000000" },
  divider: { height: 1, backgroundColor: "#D9D9D9" },
  ratingsRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  starsRow: { flexDirection: "row", gap: 2 },
  ratingText: { fontFamily: "Outfit_400Regular", fontSize: 11, lineHeight: 14, color: "#434343" },
});
