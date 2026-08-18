import React, { useEffect, useState } from "react";
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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { proprietesApi } from "../lib/proprietes";
import type { ProprieteDetail } from "../lib/types";
import { colors } from "../lib/tokens";

const FALLBACK_PHOTO = require("../assets/images/hotel.jpg");

export default function RoomDetailScreen({ route, navigation }: any) {
  const { proprieteId, hotelName } = route.params;
  const { width: SW } = useWindowDimensions();
  const [photoIdx, setPhotoIdx] = useState(0);
  const [propriete, setPropriete] = useState<ProprieteDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    proprietesApi
      .detail(proprieteId)
      .then(setPropriete)
      .finally(() => setIsLoading(false));
  }, [proprieteId]);

  const onPhotoScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPhotoIdx(Math.round(e.nativeEvent.contentOffset.x / SW));
  };

  if (isLoading || !propriete) {
    return (
      <View style={[s.root, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={colors.primary.DEFAULT} />
      </View>
    );
  }

  const photos = propriete.photos.length > 0 ? propriete.photos.map((p) => p.url_photo) : null;
  const adresse = propriete.hotel.adresse
    ? `${propriete.hotel.adresse.ville}, ${propriete.hotel.adresse.pays}`
    : hotelName;
  const priceLabel = propriete.prix_mga
    ? `${propriete.prix_mga.toLocaleString("fr-FR")}Ar/nuit`
    : "Prix sur demande";

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
          {(photos ?? [null]).map((src, i) => (
            <Image
              key={i}
              source={src ? { uri: src } : FALLBACK_PHOTO}
              style={[s.photo, { width: SW }]}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {/* Dots */}
        <View style={s.photoDots}>
          {(photos ?? [null]).map((_, i) => (
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
            <Text style={s.roomName}>{propriete.nom}</Text>
            <View style={s.infoRow}>
              <Ionicons name="location-outline" size={14} color="#464646" />
              <Text style={s.infoText}>{adresse}</Text>
            </View>
          </View>

          {/* A propos */}
          {propriete.description ? (
            <View style={s.section}>
              <Text style={s.sectionTitle}>A propos</Text>
              <Text style={s.body}>{propriete.description}</Text>
            </View>
          ) : null}

          {/* Details */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Details</Text>
            <View style={s.detailsRow}>
              <View style={s.detailItem}>
                <Ionicons name="bed-outline" size={29} color="#000000" />
                <Text style={s.detailLabel}>Lits :</Text>
                <Text style={s.detailVal}>{propriete.nb_lits}</Text>
              </View>
              <View style={s.detailItem}>
                <Ionicons name="water-outline" size={24} color="#000000" />
                <Text style={s.detailLabel}>SDB :</Text>
                <Text style={s.detailVal}>{propriete.nb_salles_bain}</Text>
              </View>
              <View style={s.detailItem}>
                <Ionicons name="person-outline" size={24} color="#000000" />
                <Text style={s.detailLabel}>Pers :</Text>
                <Text style={s.detailVal}>{propriete.capacite}</Text>
              </View>
            </View>
          </View>

          {/* Équipements */}
          {propriete.equipements.length > 0 ? (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Équipements</Text>
              <View style={s.equipRow}>
                <View style={s.equipCol}>
                  {propriete.equipements.slice(0, Math.ceil(propriete.equipements.length / 2)).map((eq) => (
                    <View key={eq.id} style={s.equipItem}>
                      <Text style={s.equipText}>{eq.nom}</Text>
                    </View>
                  ))}
                </View>
                <View style={s.equipCol}>
                  {propriete.equipements.slice(Math.ceil(propriete.equipements.length / 2)).map((eq) => (
                    <View key={eq.id} style={s.equipItem}>
                      <Text style={s.equipText}>{eq.nom}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ) : null}

          {/* Spacer for bottom bar */}
          <View style={{ height: 90 }} />
        </ScrollView>
      </View>

      {/* ── BOTTOM BAR ── */}
      <View style={s.bottomBar}>
        <View>
          <Text style={s.barPrice}>{priceLabel}</Text>
        </View>
        <TouchableOpacity
          style={s.reserveBtn}
          onPress={() => navigation.navigate("Booking", { proprieteId })}
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
