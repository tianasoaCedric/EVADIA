import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const MOCK_OFFERS = [
  {
    id: "1",
    badge: "Offres -20% du 01 au 05 Nov",
    name: "Ylang, Nosy Be",
    description: "Profitez de l'offre exclusive : la côte vous appelle.",
  },
  {
    id: "2",
    badge: "Offres -15% du 10 au 20 Nov",
    name: "Sakamanga, Tana",
    description: "Séjour urbain à prix réduit au cœur de la capitale.",
  },
  {
    id: "3",
    badge: "Offres -30% du 01 au 15 Déc",
    name: "Le Relais de la Reine, Isalo",
    description: "Escapade dans les canyons rouges avec réduction exclusive.",
  },
  {
    id: "4",
    badge: "Offres -25% du 20 au 31 Déc",
    name: "Princesse Bora, Sainte Marie",
    description: "Fêtez les fêtes de fin d'année les pieds dans l'eau.",
  },
];

function OfferCard({ offer, onPress }: { offer: (typeof MOCK_OFFERS)[0]; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={s.offerCard} onPress={onPress}>
      <ImageBackground
        source={require("../assets/images/hotel.jpg")}
        style={s.offerBg}
        imageStyle={s.offerImg}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(102,102,102,0)", "rgba(1,189,165,0.75)"]}
          locations={[0.375, 1]}
          style={s.offerGradient}
        >
          <View style={s.offerBadge}>
            <Text style={s.offerBadgeText}>{offer.badge}</Text>
          </View>
          <Text style={s.offerName}>{offer.name}</Text>
          <Text style={s.offerDesc}>{offer.description}</Text>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

export default function OffersScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { width: SW } = useWindowDimensions();

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* ── HERO plein largeur depuis le haut ── */}
        <ImageBackground
          source={require("../assets/images/hotel.jpg")}
          style={[s.hero, { width: SW }]}
          imageStyle={s.heroImg}
          resizeMode="cover"
        >
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(1,189,165,0.82)"]}
            locations={[0.2586, 0.9962]}
            style={s.heroGradient}
          >
            <Text style={s.heroTitle}>Offres Exclusives</Text>
          </LinearGradient>
        </ImageBackground>

        {/* ── SOUS-TITRE ── */}
        <View style={s.subtitleBox}>
          <Text style={s.subtitleText}>Découvrez toutes les offres exclusives</Text>
          <View style={s.subtitleLine} />
        </View>

        {/* ── LISTE OFFRES ── */}
        <View style={s.list}>
          {MOCK_OFFERS.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onPress={() => navigation.navigate("OfferDetail", {
                id: offer.id,
                badge: offer.badge,
                name: offer.name,
                description: offer.description,
              })}
            />
          ))}
        </View>
      </ScrollView>

      {/* ── HEADER en overlay par-dessus le hero ── */}
      <View style={[s.headerOverlay, { paddingTop: insets.top + 40 }]} pointerEvents="box-none">
        <View style={s.searchBar}>
          <Ionicons name="search-outline" size={20} color="#626262" />
          <Text style={s.searchPlaceholder}>Recherche</Text>
        </View>
        <View style={s.bell}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  scroll: { paddingBottom: 32 },

  // HEADER OVERLAY
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 12,
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
    letterSpacing: 0.24,
    color: "#464646",
    textAlign: "center",
    flex: 1,
  },
  bell: {
    width: 40,
    height: 40,
    backgroundColor: "#F5F5F5",
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  // HERO
  hero: {
    height: 298,
    overflow: "hidden",
  },
  heroImg: {
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  heroGradient: {
    flex: 1,
    justifyContent: "flex-end",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    paddingHorizontal: 21,
    paddingBottom: 21,
  },
  heroTitle: {
    fontFamily: "Outfit_400Regular",
    fontSize: 24,
    lineHeight: 23,
    letterSpacing: 0.48,
    color: "#FFFFFF",
  },

  // SOUS-TITRE
  subtitleBox: {
    paddingHorizontal: 21,
    marginTop: 18,
    marginBottom: 18,
    gap: 2,
  },
  subtitleText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 12,
    lineHeight: 23,
    color: "#464646",
  },
  subtitleLine: {
    width: 191,
    height: 1,
    backgroundColor: "#464646",
    marginLeft: 13,
  },

  // LISTE
  list: {
    paddingHorizontal: 20,
    gap: 20,
  },

  // OFFER CARD
  offerCard: {
    width: "100%",
    height: 193,
    borderRadius: 15,
    overflow: "hidden",
  },
  offerBg: { flex: 1 },
  offerImg: { borderRadius: 15 },
  offerGradient: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 15,
    gap: 8,
  },
  offerBadge: {
    backgroundColor: "#01BDA5",
    borderRadius: 50,
    paddingHorizontal: 15,
    alignSelf: "flex-start",
    height: 23,
    justifyContent: "center",
  },
  offerBadgeText: {
    fontFamily: "Outfit_500Medium",
    fontSize: 11,
    lineHeight: 23,
    letterSpacing: 0.88,
    color: "#FFFFFF",
    textAlign: "center",
  },
  offerName: {
    fontFamily: "Outfit_700Bold",
    fontSize: 12,
    lineHeight: 12,
    color: "#FFFFFF",
  },
  offerDesc: {
    fontFamily: "Outfit_400Regular",
    fontSize: 12,
    lineHeight: 15,
    color: "#FFFFFF",
  },
});
