import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PHOTOS = [
  require("../assets/images/hotel.jpg"),
  require("../assets/images/hotel.jpg"),
  require("../assets/images/hotel.jpg"),
];

const SERVICES = [
  "Pétit déjeuner buffet",
  "Forfait All-Inclusive pendant tout le séjour",
  "Transfert gratuit de l'aéroport à l'hôtel",
  "Accès à toutes les activités de l'hôtel",
];

const INFOS = [
  "Offre valable uniquement sur réservation",
  "Annulation du réservation non remboursable",
];

export default function OfferDetailScreen({ route, navigation }: any) {
  const { width: SW } = useWindowDimensions();
  const { badge, name, description } = route.params ?? {
    badge: "Offres -20% du 01 au 05 Nov",
    name: "Ylang, Nosy Be",
    description: "Profitez de l'offre exclusive : la côte vous appelle.",
  };

  const [photoIdx, setPhotoIdx] = useState(0);

  const onPhotoScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPhotoIdx(Math.round(e.nativeEvent.contentOffset.x / SW));
  };

  return (
    <View style={s.root}>
      {/* ── PHOTO CAROUSEL ── */}
      <View style={[s.photoBox, { width: SW }]}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onPhotoScroll}
        >
          {PHOTOS.map((src, i) => (
            <Image key={i} source={src} style={[s.photo, { width: SW }]} resizeMode="cover" />
          ))}
        </ScrollView>

        {/* Header overlay */}
        <View style={s.photoHeader}>
          <TouchableOpacity style={s.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn}>
            <Ionicons name="share-social" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── BOTTOM SHEET ── */}
      <View style={s.sheet}>
        <View style={s.handle} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.sheetContent}
        >
          {/* Badge + nom + description */}
          <View style={s.topSection}>
            <View style={s.badge}>
              <Text style={s.badgeText}>{badge}</Text>
            </View>
            
            <Text style={s.offerName}>{name}</Text>
            <Text style={s.offerDesc}>{description}</Text>
          </View>

          {/* Services inclus */}
          <View style={s.detailSection}>
            <Text style={s.detailTitle}>Services inclus</Text>
            {SERVICES.map((item) => (
              <Text key={item} style={s.bulletItem}>{"• " + item}</Text>
            ))}
          </View>

          {/* Informations supplémentaires */}
          <View style={s.detailSection}>
            <Text style={s.detailTitle}>Informations supplémentaires</Text>
            {INFOS.map((item) => (
              <Text key={item} style={s.bulletItem}>{"• " + item}</Text>
            ))}
          </View>

          {/* Bouton Réserver */}
          <TouchableOpacity style={s.reserveBtn}>
            <Text style={s.reserveBtnText}>Réserver</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },

  // PHOTO
  photoBox: { height: 382 },
  photo: { height: 382 },
  photoHeader: {
    position: "absolute",
    top: 61,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  // SHEET
  sheet: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -44,
    paddingTop: 10,
  },
  handle: {
    width: 61,
    height: 8,
    borderRadius: 100,
    backgroundColor: "#D7D7D7",
    marginBottom: 10,
    alignSelf: "center",
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 32,
  },

  // TOP SECTION
  topSection: { gap: 10 },
  badge: {
    backgroundColor: "#01BDA5",
    borderRadius: 50,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  badgeText: {
    fontFamily: "Outfit_500Medium",
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 1.6,
    color: "#FFFFFF",
    textAlign: "center",
  },
  offerName: {
    fontFamily: "Outfit_700Bold",
    fontSize: 13,
    lineHeight: 18,
    color: "#000000",
  },
  offerDesc: {
    fontFamily: "Outfit_400Regular",
    fontSize: 13,
    lineHeight: 16,
    color: "#000000",
  },

  // DETAIL SECTIONS
  detailSection: { gap: 8 },
  detailTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 13,
    lineHeight: 23,
    letterSpacing: 0.39,
    color: "#464646",
  },
  bulletItem: {
    fontFamily: "Outfit_400Regular",
    fontSize: 13,
    lineHeight: 32,
    letterSpacing: 0.26,
    color: "#464646",
  },

  // RÉSERVER
  reserveBtn: {
    backgroundColor: "#01BDA5",
    borderRadius: 25,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  reserveBtnText: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.28,
    color: "#FFFFFF",
    textAlign: "center",
  },
});
