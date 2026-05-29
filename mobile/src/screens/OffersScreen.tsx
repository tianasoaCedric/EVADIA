import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { OffreItem, getOffres } from "../services/offreService";
import { s as sc, vs, ms } from "../lib/scale";

function OfferCard({ offer, onPress }: { offer: OffreItem; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={s.offerCard} onPress={onPress}>
      <ImageBackground
        source={offer.photo ? { uri: offer.photo } : require("../assets/images/hotel.jpg")}
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
          <Text style={s.offerName}>{offer.hotel_nom}{offer.city ? `, ${offer.city}` : ""}</Text>
          <Text style={s.offerDesc}>{offer.description}</Text>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

export default function OffersScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { width: SW } = useWindowDimensions();
  const [offres, setOffres] = useState<OffreItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOffres().then(setOffres).finally(() => setLoading(false));
  }, []);

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <ImageBackground
          source={require("../assets/images/hotel.jpg")}
          style={[s.hero, { width: SW }]}
          imageStyle={s.heroImg}
          resizeMode="cover"
        >
          <View style={[s.headerOverlay, { paddingTop: insets.top + 40 }]}>
            <View style={s.searchBar}>
              <Ionicons name="search-outline" size={20} color="#626262" />
              <Text style={s.searchPlaceholder}>Recherche</Text>
            </View>
            <View style={s.bell}>
              <Ionicons name="notifications-outline" size={24} color="#000" />
            </View>
          </View>
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(1,189,165,0.82)"]}
            locations={[0.2586, 0.9962]}
            style={s.heroGradient}
          >
            <Text style={s.heroTitle}>Offres Exclusives</Text>
          </LinearGradient>
        </ImageBackground>

        <View style={s.subtitleBox}>
          <Text style={s.subtitleText}>Découvrez toutes les offres exclusives</Text>
          <View style={s.subtitleLine} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#01BDA5" style={{ marginTop: 40 }} />
        ) : (
          <View style={s.list}>
            {offres.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onPress={() => navigation.navigate("OfferDetail", {
                  id: offer.id,
                  badge: offer.badge,
                  name: `${offer.hotel_nom}${offer.city ? `, ${offer.city}` : ""}`,
                  description: offer.description,
                  photo: offer.photo,
                })}
              />
            ))}
          </View>
        )}
      </ScrollView>

    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { paddingBottom: 32 },
  headerOverlay: {
    position: "absolute", top: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", gap: sc(10),
    paddingHorizontal: sc(20), paddingBottom: vs(12),
  },
  headerFixed: {
    flexDirection: "row", alignItems: "center", gap: sc(10),
    paddingHorizontal: sc(20), paddingBottom: vs(12),
    backgroundColor: "#FFFFFF",
  },
  searchBar: {
    flex: 1, flexDirection: "row", alignItems: "center",
    backgroundColor: "#F5F5F5", borderRadius: sc(32),
    paddingHorizontal: sc(16), height: vs(40), gap: sc(10),
  },
  searchPlaceholder: { fontFamily: "Outfit_300Light", fontSize: ms(12), letterSpacing: 0.24, color: "#464646", textAlign: "center", flex: 1 },
  bell: { width: sc(40), height: vs(40), backgroundColor: "#F5F5F5", borderRadius: sc(38), alignItems: "center", justifyContent: "center" },
  hero: { height: vs(298), overflow: "hidden" },
  heroImg: { borderBottomLeftRadius: sc(15), borderBottomRightRadius: sc(15) },
  heroGradient: { flex: 1, justifyContent: "flex-end", borderBottomLeftRadius: sc(15), borderBottomRightRadius: sc(15), paddingHorizontal: sc(21), paddingBottom: vs(21) },
  heroTitle: { fontFamily: "Outfit_400Regular", fontSize: ms(24), lineHeight: 23, letterSpacing: 0.48, color: "#FFFFFF" },
  subtitleBox: { paddingHorizontal: sc(21), marginTop: vs(18), marginBottom: vs(18), gap: 2 },
  subtitleText: { fontFamily: "Outfit_400Regular", fontSize: ms(12), lineHeight: 23, color: "#464646" },
  subtitleLine: { width: sc(191), height: 1, backgroundColor: "#464646", marginLeft: sc(13) },
  list: { paddingHorizontal: sc(20), gap: vs(20) },
  offerCard: { width: "100%", height: vs(193), borderRadius: sc(15), overflow: "hidden" },
  offerBg: { flex: 1 },
  offerImg: { borderRadius: sc(15) },
  offerGradient: { flex: 1, justifyContent: "flex-end", padding: sc(15), gap: vs(8) },
  offerBadge: { backgroundColor: "#01BDA5", borderRadius: 50, paddingHorizontal: sc(15), alignSelf: "flex-start", height: vs(23), justifyContent: "center" },
  offerBadgeText: { fontFamily: "Outfit_500Medium", fontSize: ms(11), lineHeight: 23, letterSpacing: 0.88, color: "#FFFFFF", textAlign: "center" },
  offerName: { fontFamily: "Outfit_700Bold", fontSize: ms(12), lineHeight: 12, color: "#FFFFFF" },
  offerDesc: { fontFamily: "Outfit_400Regular", fontSize: ms(12), lineHeight: 15, color: "#FFFFFF" },
});
