import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { hotelsApi } from "../lib/hotels";
import type { HotelSummary } from "../lib/types";
import { colors } from "../lib/tokens";

function StarRating({ note }: { note: number }) {
  const filled = Math.round(note);
  return (
    <View style={styles.starsRow}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons key={i} name="star" size={13} color={i < filled ? "#FFE100" : "#E0E0E0"} />
      ))}
    </View>
  );
}

function HotelCard({ hotel, onFavPress, onPress }: { hotel: HotelSummary; onFavPress: () => void; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.imageBox}>
        <Image
          source={hotel.photo_principale ? { uri: hotel.photo_principale } : require("../assets/images/hotel.jpg")}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.favBtn} onPress={onFavPress}>
          <Ionicons name="heart-outline" size={16} color="#BDBDBD" />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.hotelName}>{hotel.nom}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color="#434343" />
            <Text style={styles.locationText}>{hotel.ville ?? ""}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.price}>
            {hotel.prix_min_mga ? `${hotel.prix_min_mga.toLocaleString("fr-FR")}ar/Nuitée` : "Prix sur demande"}
          </Text>
          <View style={styles.ratingsRow}>
            <StarRating note={hotel.note_moyenne ?? 0} />
            <Text style={styles.ratingText}>{hotel.note_moyenne ?? "-"}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function DestinationHotelsScreen({ route, navigation }: any) {
  const { id, name } = route.params;
  const [hotels, setHotels] = useState<HotelSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});

  useEffect(() => {
    hotelsApi
      .byDestination(id)
      .then(setHotels)
      .finally(() => setIsLoading(false));
  }, [id]);

  const toggleFav = (hotelId: number) =>
    setFavorites((prev) => ({ ...prev, [hotelId]: !prev[hotelId] }));

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.head}>
        <View style={styles.headRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#626262" />
            <Text style={styles.searchPlaceholder}>Recherche</Text>
          </View>
          <View style={styles.bell}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>{name}</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary.DEFAULT} style={{ marginTop: 40 }} />
        ) : hotels.length === 0 ? (
          <Text style={{ textAlign: "center", color: "#8A8A8A", marginTop: 40 }}>
            Aucun hôtel trouvé pour cette destination.
          </Text>
        ) : (
          <View style={styles.list}>
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onFavPress={() => toggleFav(hotel.id)}
                onPress={() => navigation.navigate("HotelDetail", { id: hotel.id, name: hotel.nom })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  head: {
    backgroundColor: "#FFFFFF",
    paddingTop: 21,
    paddingBottom: 21,
    paddingHorizontal: 20,
  },
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 32,
    paddingHorizontal: 16,
    height: 40,
    gap: 10,
  },
  searchPlaceholder: {
    fontFamily: "Outfit_300Light",
    fontSize: 12,
    color: "#464646",
  },
  bell: {
    width: 40,
    height: 40,
    backgroundColor: "#F5F5F5",
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContent: { paddingBottom: 32 },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 21,
    marginBottom: 28,
  },
  title: {
    fontFamily: "Manrope_700Bold",
    fontSize: 24,
    lineHeight: 30,
    color: "#000000",
  },

  list: {
    paddingHorizontal: 21,
    gap: 28,
  },

  card: {
    width: "100%",
    gap: 14,
  },
  imageBox: {
    width: "100%",
    height: 330,
    borderRadius: 15,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 330,
  },
  favBtn: {
    position: "absolute",
    top: 11,
    right: 11,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  info: { gap: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hotelName: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    lineHeight: 17,
    letterSpacing: 0.3,
    color: "#000000",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 13,
    letterSpacing: 0.26,
    color: "#222222",
  },
  price: {
    fontFamily: "Outfit_400Regular",
    fontSize: 15,
    lineHeight: 17,
    letterSpacing: 0.3,
    color: "#222222",
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
