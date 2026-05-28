import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { s as sc, vs, ms } from "../lib/scale";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import SearchHeader from "../components/molecules/SearchHeader";
import {
  HotelItem,
  VilleItem,
  getPopularVilles,
  getSelectionHotels,
  getTypesHotels,
  getVilleHotels,
} from "../services/homeService";

function filterByType(hotels: HotelItem[], activeFilter: string): HotelItem[] {
  if (activeFilter === "Tous") return hotels;
  return hotels.filter((h) =>
    h.types.some((t) => t.nom.toLowerCase() === activeFilter.toLowerCase())
  );
}

interface VilleSection {
  ville: VilleItem;
  hotels: HotelItem[];
}

function StarRating({ rating }: { rating: number | null }) {
  const filled = rating ? Math.round(rating) : 0;
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name="star"
          size={13}
          color={i <= filled ? "#FFE100" : "#E0E0E0"}
        />
      ))}
    </View>
  );
}

function HotelCard({
  hotel,
  isFavorite,
  onFavPress,
  onPress,
}: {
  hotel: HotelItem;
  isFavorite: boolean;
  onFavPress: () => void;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardImageBox}>
        <Image
          source={
            hotel.photo
              ? { uri: hotel.photo }
              : require("../assets/images/hotel.jpg")
          }
          style={styles.cardImage}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.favBtn} onPress={onFavPress}>
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={16}
            color={isFavorite ? "#EF4444" : "#C7C7C7"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>
          {hotel.nom}, {hotel.ville}
        </Text>
        <Text style={styles.cardSubtitle}>Disponibilité</Text>
        <Text style={styles.cardPrice}>
          {hotel.prix_min.toLocaleString()} {hotel.devise}/nuité
        </Text>
        <View style={styles.cardDivider} />
        <View style={styles.ratingRow}>
          <StarRating rating={hotel.note_moyenne} />
          {hotel.note_moyenne !== null && (
            <Text style={styles.ratingText}>{hotel.note_moyenne.toFixed(2)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function HotelCarousel({
  hotels,
  sectionIdx,
  navigation,
}: {
  hotels: HotelItem[];
  sectionIdx: number;
  navigation: any;
}) {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const toggleFav = (id: string) =>
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));

  if (hotels.length === 0) {
    return (
      <Text style={styles.emptyText}>
        Aucun hébergement disponible pour ce filtre.
      </Text>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.carousel}
    >
      {hotels.map((hotel) => (
        <HotelCard
          key={hotel.id}
          hotel={hotel}
          isFavorite={favorites[`${sectionIdx}-${hotel.id}`] ?? false}
          onFavPress={() => toggleFav(`${sectionIdx}-${hotel.id}`)}
          onPress={() => navigation.navigate("HotelDetail", { id: hotel.id, name: hotel.nom })}
        />
      ))}
    </ScrollView>
  );
}

export default function HomeScreen({ navigation }: any) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tous");

  const [filters, setFilters] = useState<string[]>(["Tous"]);
  const [selectionHotels, setSelectionHotels] = useState<HotelItem[]>([]);
  const [villeSections, setVilleSections] = useState<VilleSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [selection, villes, types] = await Promise.all([
        getSelectionHotels(),
        getPopularVilles(4),
        getTypesHotels(),
      ]);

      setFilters(["Tous", ...types.map((t) => t.nom)]);

      setSelectionHotels(selection);

      const sections = await Promise.all(
        villes.map(async (ville) => ({
          ville,
          hotels: await getVilleHotels(ville.id),
        }))
      );

      setVilleSections(sections);
    } catch {
      setError("Impossible de charger les hébergements.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredSelection = filterByType(selectionHotels, activeFilter);
  const filteredSections = villeSections
    .map((s) => ({ ...s, hotels: filterByType(s.hotels, activeFilter) }))
    .filter((s) => s.hotels.length > 0);

  const isEmpty = filteredSelection.length === 0 && filteredSections.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SearchHeader
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onSearchPress={() => navigation.navigate("Search")}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#01BDA5" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Sélection par abonnement groupée par ville */}
          {Object.entries(
            filteredSelection.reduce<Record<string, HotelItem[]>>((acc, h) => {
              const key = h.ville || "Autre";
              acc[key] = [...(acc[key] ?? []), h];
              return acc;
            }, {})
          ).map(([ville, hotels], idx) => (
            <View key={`sel-${ville}`} style={styles.section}>
              <TouchableOpacity>
                <Text style={styles.sectionTitle}>
                  Sélection d'hébergement à {ville} {">"}
                </Text>
              </TouchableOpacity>
              <HotelCarousel hotels={hotels} sectionIdx={idx} navigation={navigation} />
            </View>
          ))}

          {/* Sections par ville populaire (triées par nb réservations) */}
          {filteredSections.map(({ ville, hotels }, idx) => (
            <View key={ville.id} style={styles.section}>
              <TouchableOpacity
                onPress={() =>
                  navigation?.navigate("DestinationHotels", {
                    villeId: ville.id,
                    villeName: ville.nom,
                  })
                }
              >
                <Text style={styles.sectionTitle}>
                  Hébergements à {ville.nom} {">"}
                </Text>
              </TouchableOpacity>
              <HotelCarousel hotels={hotels} sectionIdx={filteredSelection.length + idx} navigation={navigation} />
            </View>
          ))}

          {isEmpty && !loading && (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>
                Aucun hébergement de type « {activeFilter} » disponible.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: sc(24), gap: 12 },
  errorText: { fontFamily: "Outfit_400Regular", fontSize: ms(14), color: "#6B7280", textAlign: "center" },
  retryBtn: { backgroundColor: "#01BDA5", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
  retryText: { fontFamily: "Outfit_600SemiBold", color: "#FFFFFF" },

  section: { marginTop: vs(24), gap: vs(12) },
  sectionTitle: {
    fontFamily: "Outfit_700Bold",
    fontSize: ms(16),
    lineHeight: 22,
    letterSpacing: 0.32,
    color: "#000000",
    marginLeft: sc(17),
  },
  carousel: { paddingHorizontal: sc(22), paddingVertical: vs(6), gap: sc(12) },

  card: { width: sc(150), backgroundColor: "#FFFFFF", borderRadius: sc(15), paddingBottom: 10, gap: 5 },
  cardImageBox: { width: sc(150), height: sc(150), borderRadius: sc(15), overflow: "hidden" },
  cardImage: { width: sc(150), height: sc(150) },
  favBtn: {
    position: "absolute",
    top: vs(9),
    right: sc(9),
    width: sc(24),
    height: sc(24),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: sc(12),
  },
  cardInfo: { paddingHorizontal: sc(6), gap: 2 },
  cardName: { fontFamily: "Outfit_600SemiBold", fontSize: ms(12), lineHeight: 15, letterSpacing: 0.24, color: "#000000" },
  cardSubtitle: { fontFamily: "Outfit_400Regular", fontSize: ms(11), color: "#6B7280" },
  cardPrice: { fontFamily: "Outfit_600SemiBold", fontSize: ms(11), color: "#01BDA5" },
  cardDivider: { height: 1, backgroundColor: "#D9D9D9", width: "100%", marginVertical: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  starsRow: { flexDirection: "row", gap: 2 },
  ratingText: { fontFamily: "Outfit_400Regular", fontSize: ms(11), lineHeight: 14, color: "#434343" },
  emptyText: { fontFamily: "Outfit_400Regular", fontSize: ms(13), color: "#9CA3AF", marginHorizontal: 22 },
});
