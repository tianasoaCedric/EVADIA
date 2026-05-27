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

const FILTERS = ["Hotel de Luxe", "Ecolodge", "Bungalows", "Lodge", "Villa"];

const MOCK_HOTELS = Array(8).fill(null).map((_, i) => ({
  id: String(i + 1),
  name: "Aara Antananarivo",
  subtitle: "Disponibilité",
  price: "225.000Ar/nuité",
  rating: 4.25,
  stars: [true, true, true, true, false],
  isFavorite: false,
}));

const SECTIONS = [
  { title: "Selection d'hebergement a Nosy Be", hotels: MOCK_HOTELS },
  { title: "Selection d'hebergement a Isalo", hotels: MOCK_HOTELS },
  { title: "Selection d'hebergement a Morondava", hotels: MOCK_HOTELS },
];

function StarRating({ stars }: { stars: boolean[] }) {
  return (
    <View style={styles.starsRow}>
      {stars.map((filled, i) => (
        <Ionicons
          key={i}
          name="star"
          size={13}
          color={filled ? "#FFE100" : "#E0E0E0"}
        />
      ))}
    </View>
  );
}

function HotelCard({ hotel, onFavPress }: { hotel: any; onFavPress: () => void }) {
  return (
    <View style={styles.card}>
      {/* Image */}
      <View style={styles.cardImageBox}>
        <Image
          source={require("../assets/images/hotel.jpg")}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.favBtn} onPress={onFavPress}>
          <Ionicons
            name={hotel.isFavorite ? "heart" : "heart-outline"}
            size={16}
            color={hotel.isFavorite ? "#EF4444" : "#C7C7C7"}
          />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>
          {hotel.name}{"\n"}{hotel.subtitle}{"\n"}{hotel.price}
        </Text>
        <View style={styles.cardDivider} />
        <View style={styles.ratingRow}>
          <StarRating stars={hotel.stars} />
          <Text style={styles.ratingText}>{hotel.rating}</Text>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen({ navigation }: any) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Hotel de Luxe");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFav = (sectionIdx: number, hotelId: string) => {
    const key = `${sectionIdx}-${hotelId}`;
    setFavorites((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SearchHeader
        search={search}
        onSearchChange={setSearch}
        filters={FILTERS}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* CONTENU */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {SECTIONS.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            {/* Titre section */}
            <TouchableOpacity>
              <Text style={styles.sectionTitle}>{section.title} {">"}</Text>
            </TouchableOpacity>

            {/* Carrousel */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
            >
              {section.hotels.map((hotel, hIdx) => (
                <HotelCard
                  key={hIdx}
                  hotel={{ ...hotel, isFavorite: favorites[`${sIdx}-${hotel.id}`] }}
                  onFavPress={() => toggleFav(sIdx, hotel.id)}
                />
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  // SECTIONS
  section: {
    marginTop: 24,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: "Outfit_700Bold",
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.32,
    color: "#000000",
    marginLeft: 17,
  },
  carousel: {
    paddingHorizontal: 22,
    paddingVertical: 6,
    gap: 12,
  },

  // CARD
  card: {
    width: 150,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    paddingBottom: 10,
    gap: 5,
  },
  cardImageBox: {
    width: 150,
    height: 150,
    borderRadius: 15,
    overflow: "hidden",
  },
  cardImage: {
    width: 150,
    height: 150,
  },
  favBtn: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 12,
  },
  cardInfo: {
    paddingHorizontal: 6,
    gap: 6,
  },
  cardName: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: 0.24,
    color: "#000000",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#D9D9D9",
    width: "100%",
  },
  ratingRow: {
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
