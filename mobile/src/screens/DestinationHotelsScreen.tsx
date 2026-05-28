import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Image, StyleSheet,
  Dimensions, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { HotelItem } from "../services/homeService";
import { getDestinationHotels, getVilleHotelsById } from "../services/destinationService";

const CARD_WIDTH = Dimensions.get("window").width - 42;

function StarRating({ rating }: { rating: number | null }) {
  const filled = rating ? Math.round(rating) : 0;
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons key={i} name="star" size={13} color={i <= filled ? "#FFE100" : "#E0E0E0"} />
      ))}
    </View>
  );
}

function HotelCard({ hotel, isFavorite, onFavPress, onPress }: { hotel: HotelItem; isFavorite: boolean; onFavPress: () => void; onPress: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const photos = hotel.photo ? [hotel.photo] : [];

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH));

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.imageBox}>
        <ScrollView
          horizontal pagingEnabled showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll} scrollEventThrottle={16}
        >
          {photos.length > 0 ? photos.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.image} resizeMode="cover" />
          )) : (
            <Image source={require("../assets/images/hotel.jpg")} style={styles.image} resizeMode="cover" />
          )}
        </ScrollView>

        {photos.length > 1 && (
          <View style={styles.dots}>
            {photos.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.favBtn} onPress={onFavPress}>
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={16} color={isFavorite ? "#EF4444" : "#BDBDBD"} />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.hotelName}>{hotel.nom}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color="#434343" />
            <Text style={styles.locationText}>{hotel.ville}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.price}>{hotel.prix_min.toLocaleString()} {hotel.devise}/Nuitée</Text>
          <View style={styles.ratingsRow}>
            <StarRating rating={hotel.note_moyenne} />
            {hotel.note_moyenne !== null && <Text style={styles.ratingText}>{hotel.note_moyenne.toFixed(1)}</Text>}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function DestinationHotelsScreen({ route, navigation }: any) {
  const { id, name, type } = route.params ?? {};
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetch = type === "ville" ? getVilleHotelsById(id) : getDestinationHotels(id);
    fetch.then(setHotels).finally(() => setLoading(false));
  }, [id, type]);

  const toggleFav = (hotelId: string) =>
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

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>{name}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#01BDA5" style={{ marginTop: 40 }} />
        ) : hotels.length === 0 ? (
          <Text style={styles.emptyText}>Aucun hébergement disponible.</Text>
        ) : (
          <View style={styles.list}>
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                isFavorite={favorites[hotel.id] ?? false}
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
  head: { backgroundColor: "#FFFFFF", paddingTop: 21, paddingBottom: 21, paddingHorizontal: 20 },
  headRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  searchBar: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#F5F5F5", borderRadius: 32, paddingHorizontal: 16, height: 40, gap: 10 },
  searchPlaceholder: { fontFamily: "Outfit_300Light", fontSize: 12, color: "#464646" },
  bell: { width: 40, height: 40, backgroundColor: "#F5F5F5", borderRadius: 38, alignItems: "center", justifyContent: "center" },
  scrollContent: { paddingBottom: 32 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 21, marginBottom: 28 },
  title: { fontFamily: "Manrope_700Bold", fontSize: 24, lineHeight: 30, color: "#000000" },
  emptyText: { fontFamily: "Outfit_400Regular", fontSize: 14, color: "#9CA3AF", textAlign: "center", marginTop: 40 },
  list: { paddingHorizontal: 21, gap: 28 },
  card: { width: "100%", gap: 14 },
  imageBox: { width: "100%", height: 330, borderRadius: 15, overflow: "hidden" },
  image: { width: CARD_WIDTH, height: 330 },
  dots: { position: "absolute", bottom: 16, alignSelf: "center", flexDirection: "row", gap: 3 },
  dot: { width: 8, height: 8, borderRadius: 100, backgroundColor: "#FFFFFF" },
  dotActive: { width: 28, backgroundColor: "#01BDA5" },
  favBtn: { position: "absolute", top: 11, right: 11, width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  info: { gap: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  hotelName: { fontFamily: "Outfit_600SemiBold", fontSize: 15, lineHeight: 17, letterSpacing: 0.3, color: "#000000" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontFamily: "Outfit_400Regular", fontSize: 13, letterSpacing: 0.26, color: "#222222" },
  price: { fontFamily: "Outfit_400Regular", fontSize: 15, lineHeight: 17, letterSpacing: 0.3, color: "#222222" },
  ratingsRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  starsRow: { flexDirection: "row", gap: 2 },
  ratingText: { fontFamily: "Outfit_400Regular", fontSize: 11, lineHeight: 14, color: "#434343" },
});
