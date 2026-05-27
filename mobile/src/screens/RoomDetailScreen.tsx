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

const EQUIP_LEFT: { icon: string; label: string }[] = [
  { icon: "wifi-outline", label: "Wi-Fi haut débit" },
  { icon: "tv-outline", label: "Télévision 4K" },
  { icon: "snow-outline", label: "Climatisation" },
  { icon: "water-outline", label: "Piscine privée" },
  { icon: "car-outline", label: "Parking gratuit" },
  { icon: "cafe-outline", label: "Machine à café" },
];

const EQUIP_RIGHT: { icon: string; label: string }[] = [
  { icon: "restaurant-outline", label: "Cuisine équipée" },
  { icon: "barbell-outline", label: "Salle de sport" },
  { icon: "shirt-outline", label: "Lave-linge" },
  { icon: "alert-circle-outline", label: "Détecteur de fumée" },
  { icon: "key-outline", label: "Entrée autonome" },
  { icon: "happy-outline", label: "Adapté aux enfants" },
];

export default function RoomDetailScreen({ route, navigation }: any) {
  const { name, price, beds, sdb, pers } = route.params ?? {
    name: "Suite de Luxe",
    price: "225.000ar/Nuitée",
    beds: 2,
    sdb: 2,
    pers: 4,
  };

  const { width: SW } = useWindowDimensions();
  const [photoIdx, setPhotoIdx] = useState(0);

  const onPhotoScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPhotoIdx(Math.round(e.nativeEvent.contentOffset.x / SW));
  };

  return (
    <View style={s.root}>
      {/* ── PHOTOS CAROUSEL ── */}
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

        {/* Dots */}
        <View style={s.photoDots}>
          {PHOTOS.map((_, i) => (
            <View key={i} style={[s.dot, i === photoIdx && s.dotActive]} />
          ))}
        </View>

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
          {/* Nom + localisation */}
          <View style={s.section}>
            <Text style={s.roomName}>{name}</Text>
            <View style={s.infoRow}>
              <Ionicons name="location-outline" size={14} color="#464646" />
              <Text style={s.infoText}>Lonkitsy, Sainte Marie - Madagascar</Text>
            </View>
          </View>

          {/* A propos */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>A propos</Text>
            <Text style={s.body}>
              Nichées au cœur de villas de style malagasy et du manoir, nos chambres, situées tout au long de la côte, proposent des lits jumeaux ou un lit king-size. Chaque chambre dispose d'un balcon privé. Elles peuvent accueillir soit 3 adultes, soit 2 adultes et 1 adolescent (ou 1 enfant).
            </Text>
          </View>

          {/* Details */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Details</Text>
            <View style={s.detailsRow}>
              <View style={s.detailItem}>
                <Ionicons name="bed-outline" size={29} color="#000000" />
                <Text style={s.detailLabel}>Lits :</Text>
                <Text style={s.detailVal}>{beds}</Text>
              </View>
              <View style={s.detailItem}>
                <Ionicons name="water-outline" size={24} color="#000000" />
                <Text style={s.detailLabel}>SDB :</Text>
                <Text style={s.detailVal}>{sdb}</Text>
              </View>
              <View style={s.detailItem}>
                <Ionicons name="person-outline" size={24} color="#000000" />
                <Text style={s.detailLabel}>Pers :</Text>
                <Text style={s.detailVal}>{pers}</Text>
              </View>
            </View>
          </View>

          {/* Équipements */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Équipements</Text>
            <View style={s.equipRow}>
              <View style={s.equipCol}>
                {EQUIP_LEFT.map((eq) => (
                  <View key={eq.label} style={s.equipItem}>
                    <Ionicons name={eq.icon as any} size={17} color="#464646" />
                    <Text style={s.equipText}>{eq.label}</Text>
                  </View>
                ))}
              </View>
              <View style={s.equipCol}>
                {EQUIP_RIGHT.map((eq) => (
                  <View key={eq.label} style={s.equipItem}>
                    <Ionicons name={eq.icon as any} size={17} color="#464646" />
                    <Text style={s.equipText}>{eq.label}</Text>
                  </View>
                ))}
              </View>
            </View>
            <TouchableOpacity>
              <Text style={s.showAll}>Afficher tous les équipements</Text>
            </TouchableOpacity>
          </View>

          {/* Spacer for bottom bar */}
          <View style={{ height: 90 }} />
        </ScrollView>
      </View>

      {/* ── BOTTOM BAR ── */}
      <View style={s.bottomBar}>
        <View>
          <Text style={s.barPrice}>{price}</Text>
          <Text style={s.barDates}>11 - 12 Mai</Text>
        </View>
        <TouchableOpacity
          style={s.reserveBtn}
          onPress={() => navigation.navigate("Booking", { roomName: name, price })}
        >
          <Text style={s.reserveBtnText}>Réserver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },

  // PHOTOS
  photoBox: { height: 359 },
  photo: { height: 359 },
  photoDots: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    flexDirection: "row",
    gap: 3,
  },
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

  // DOTS
  dot: { width: 8, height: 8, borderRadius: 100, backgroundColor: "#FFFFFF" },
  dotActive: { width: 28, backgroundColor: "#01BDA5" },

  // SHEET
  sheet: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
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
    paddingBottom: 16,
    gap: 30,
  },

  // SECTIONS
  section: { gap: 8, width: "100%" },
  sectionTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    lineHeight: 25,
    letterSpacing: 0.3,
    color: "#000000",
  },

  // NOM + LOC
  roomName: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    lineHeight: 17,
    letterSpacing: 0.3,
    color: "#000000",
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: 0.26,
    color: "#000000",
  },

  // A PROPOS
  body: {
    fontFamily: "Outfit_400Regular",
    fontSize: 13,
    lineHeight: 16,
    color: "#434343",
  },

  // DETAILS
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailLabel: {
    fontFamily: "Outfit_300Light",
    fontSize: 15,
    lineHeight: 19,
    color: "#383838",
  },
  detailVal: {
    fontFamily: "Outfit_400Regular",
    fontSize: 15,
    lineHeight: 19,
    color: "#000000",
  },

  // ÉQUIPEMENTS
  equipRow: { flexDirection: "row", gap: 10 },
  equipCol: { flex: 1, gap: 4 },
  equipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 25,
  },
  equipText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 13,
    lineHeight: 25,
    letterSpacing: 0.26,
    color: "#464646",
  },
  showAll: {
    fontFamily: "Outfit_400Regular",
    fontSize: 13,
    lineHeight: 34,
    letterSpacing: 0.26,
    color: "#2FC9B5",
  },

  // BOTTOM BAR
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  barPrice: {
    fontFamily: "Outfit_700Bold",
    fontSize: 15,
    lineHeight: 17,
    color: "#000000",
  },
  barDates: {
    fontFamily: "Outfit_300Light",
    fontSize: 13,
    lineHeight: 17,
    color: "#7E7E7E",
    marginTop: 2,
  },
  reserveBtn: {
    backgroundColor: "#01BDA5",
    borderRadius: 50,
    paddingHorizontal: 28,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  reserveBtnText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 15,
    lineHeight: 15,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});
