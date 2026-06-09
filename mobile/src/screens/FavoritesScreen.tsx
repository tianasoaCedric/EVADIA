import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import SearchHeader from "../components/molecules/SearchHeader";

const FILTERS = ["Filtres", "All", "Hotel de Luxe", "Lodge", "Villa"];

const MOCK_FAVORITES = Array(8).fill(null).map((_, i) => ({
  id: String(i + 1),
  name: "Aara Antananarivo",
  subtitle: "Disponibilité",
  price: "225.000Ar/nuité",
  rating: 4.25,
  stars: [true, true, true, true, false],
  isFav: true,
}));

function StarRating({ stars }: { stars: boolean[] }) {
  return (
    <View style={s.starsRow}>
      {stars.map((filled, i) => (
        <Ionicons key={i} name="star" size={13} color={filled ? "#FFE100" : "#E0E0E0"} />
      ))}
    </View>
  );
}

function FavCard({
  item,
  onUnfav,
}: {
  item: (typeof MOCK_FAVORITES)[0];
  onUnfav: () => void;
}) {
  return (
    <View style={s.card}>
      {/* Image */}
      <View style={s.imageBox}>
        <Image
          source={require("../assets/images/hotel.jpg")}
          style={s.image}
          resizeMode="cover"
        />
        <TouchableOpacity style={s.heartBtn} onPress={onUnfav}>
          <Ionicons name="heart" size={20} color="#FF1F66" />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={s.info}>
        <Text style={s.cardText}>
          {item.name}{"\n"}
          {item.subtitle}{"\n"}
          {item.price}
        </Text>
        <View style={s.divider} />
        <View style={s.ratingsRow}>
          <StarRating stars={item.stars} />
          <Text style={s.ratingText}>{item.rating}</Text>
        </View>
      </View>
    </View>
  );
}

export default function FavoritesScreen() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Filtres");
  const [favs, setFavs] = useState<Record<string, boolean>>(
    Object.fromEntries(MOCK_FAVORITES.map((f) => [f.id, true]))
  );

  const toggleFav = (id: string) =>
    setFavs((prev) => ({ ...prev, [id]: !prev[id] }));

  const visible = MOCK_FAVORITES.filter((f) => favs[f.id]);

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <SearchHeader
        search={search}
        onSearchChange={setSearch}
        filters={FILTERS}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        <Text style={s.title}>Vos Favoris</Text>

        <View style={s.grid}>
          {visible.map((item) => (
            <FavCard
              key={item.id}
              item={item}
              onUnfav={() => toggleFav(item.id)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  scrollContent: {
    paddingBottom: 32,
  },

  title: {
    fontFamily: "Manrope_700Bold",
    fontSize: 24,
    lineHeight: 30,
    color: "#000000",
    marginTop: 21,
    marginBottom: 16,
    paddingHorizontal: 29,
  },

  grid: {
    paddingHorizontal: 29,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 26,
  },

  // CARD
  card: {
    width: 150,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    paddingBottom: 10,
    gap: 5,
  },
  imageBox: {
    width: 150,
    height: 150,
    borderRadius: 15,
    overflow: "hidden",
  },
  image: {
    width: 150,
    height: 150,
  },
  heartBtn: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  info: {
    paddingHorizontal: 6,
    gap: 6,
  },
  cardText: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: 0.24,
    color: "#000000",
  },
  divider: {
    height: 1,
    backgroundColor: "#D9D9D9",
  },
  ratingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  ratingText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 11,
    lineHeight: 14,
    color: "#434343",
  },
});
