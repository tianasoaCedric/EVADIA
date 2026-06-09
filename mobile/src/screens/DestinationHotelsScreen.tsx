import React, { useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const CARD_WIDTH = Dimensions.get("window").width - 42;

const MOCK_PHOTOS = [
  require("../assets/images/hotel.jpg"),
  require("../assets/images/hotel.jpg"),
  require("../assets/images/hotel.jpg"),
];

const MOCK_HOTELS = Array(4).fill(null).map((_, i) => ({
  id: String(i + 1),
  name: "Aara Ecolodge",
  location: "Lonkitsy, Sainte Marie",
  price: "225.000ar/Nuitée",
  rating: 4.25,
  stars: [true, true, true, true, false],
  isFavorite: false,
  photos: MOCK_PHOTOS,
}));

function StarRating({ stars }: { stars: boolean[] }) {
  return (
    <View style={styles.starsRow}>
      {stars.map((filled, i) => (
        <Ionicons key={i} name="star" size={13} color={filled ? "#FFE100" : "#E0E0E0"} />
      ))}
    </View>
  );
}

function HotelCard({ hotel, onFavPress, onPress }: { hotel: any; onFavPress: () => void; onPress: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    setActiveIndex(index);
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      {/* Carousel photos */}
      <View style={styles.imageBox}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
          scrollEventThrottle={16}
        >
          {hotel.photos.map((src: any, i: number) => (
            <Image key={i} source={src} style={styles.image} resizeMode="cover" />
          ))}
        </ScrollView>

        {/* Dots */}
        <View style={styles.dots}>
          {hotel.photos.map((_: any, i: number) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>

        {/* Favori */}
        <TouchableOpacity style={styles.favBtn} onPress={onFavPress}>
          <Ionicons
            name={hotel.isFavorite ? "heart" : "heart-outline"}
            size={16}
            color={hotel.isFavorite ? "#EF4444" : "#BDBDBD"}
          />
        </TouchableOpacity>
      </View>

      {/* Infos */}
      <View style={styles.info}>
        {/* Ligne 1 : nom + localisation */}
        <View style={styles.row}>
          <Text style={styles.hotelName}>{hotel.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color="#434343" />
            <Text style={styles.locationText}>{hotel.location}</Text>
          </View>
        </View>
        {/* Ligne 2 : prix + étoiles */}
        <View style={styles.row}>
          <Text style={styles.price}>{hotel.price}</Text>
          <View style={styles.ratingsRow}>
            <StarRating stars={hotel.stars} />
            <Text style={styles.ratingText}>{hotel.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function DestinationHotelsScreen({ route, navigation }: any) {
  const { name } = route.params;
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFav = (id: string) =>
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header searchbar sans filtres */}
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
        {/* Titre avec retour */}
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>{name}</Text>
        </View>

        {/* Liste hôtels */}
        <View style={styles.list}>
          {MOCK_HOTELS.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={{ ...hotel, isFavorite: favorites[hotel.id] }}
              onFavPress={() => toggleFav(hotel.id)}
              onPress={() => navigation.navigate("HotelDetail", { id: hotel.id, name: hotel.name })}
            />
          ))}
        </View>
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

  // CARD
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
    width: CARD_WIDTH,
    height: 330,
  },
  dots: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    flexDirection: "row",
    gap: 3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 100,
    backgroundColor: "#FFFFFF",
  },
  dotActive: {
    width: 28,
    backgroundColor: "#01BDA5",
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
