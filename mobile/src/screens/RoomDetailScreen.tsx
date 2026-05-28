import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Image, StyleSheet,
  useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getPropriete, ProprieteDetail } from "../services/proprieteService";

const FALLBACK = require("../assets/images/hotel.jpg");

const EQUIP_ICON_MAP: Record<string, string> = {
  wifi: "wifi-outline",
  "wi-fi": "wifi-outline",
  tv: "tv-outline",
  télévision: "tv-outline",
  climatisation: "snow-outline",
  piscine: "water-outline",
  parking: "car-outline",
  café: "cafe-outline",
  cuisine: "restaurant-outline",
  sport: "barbell-outline",
  "lave-linge": "shirt-outline",
  fumée: "alert-circle-outline",
  entrée: "key-outline",
  enfants: "happy-outline",
};

function equipIcon(nom: string): string {
  const lower = nom.toLowerCase();
  for (const [key, icon] of Object.entries(EQUIP_ICON_MAP)) {
    if (lower.includes(key)) return icon;
  }
  return "checkmark-circle-outline";
}

export default function RoomDetailScreen({ route, navigation }: any) {
  const { id, name, price } = route.params ?? {};
  const { width: SW } = useWindowDimensions();
  const [photoIdx, setPhotoIdx] = useState(0);
  const [detail, setDetail] = useState<ProprieteDetail | null>(null);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      getPropriete(String(id))
        .then(setDetail)
        .finally(() => setLoading(false));
    }
  }, [id]);

  const onPhotoScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setPhotoIdx(Math.round(e.nativeEvent.contentOffset.x / SW));

  const photos = detail?.photos?.length ? detail.photos : [];
  const displayName = detail?.nom ?? name ?? "Chambre";
  const displayPrice = price ?? (detail?.prix_par_nuit ? `${detail.prix_par_nuit.toLocaleString()} ${detail.devise ?? "Ar"}/Nuitée` : "");
  const adresse = detail?.hotel?.adresse ? `${detail.hotel.adresse.ville}, ${detail.hotel.adresse.pays}` : "";
  const equipements = detail?.equipements ?? [];
  const half = Math.ceil(equipements.length / 2);
  const equipLeft = equipements.slice(0, half);
  const equipRight = equipements.slice(half);

  return (
    <View style={s.root}>
      <View style={[s.photoBox, { width: SW }]}>
        <ScrollView
          horizontal pagingEnabled showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onPhotoScroll}
        >
          {photos.length > 0 ? photos.map((uri, i) => (
            <Image key={i} source={{ uri }} style={[s.photo, { width: SW }]} resizeMode="cover" />
          )) : (
            <Image source={FALLBACK} style={[s.photo, { width: SW }]} resizeMode="cover" />
          )}
        </ScrollView>

        {photos.length > 1 && (
          <View style={s.photoDots}>
            {photos.map((_, i) => (
              <View key={i} style={[s.dot, i === photoIdx && s.dotActive]} />
            ))}
          </View>
        )}

        <View style={s.photoHeader}>
          <TouchableOpacity style={s.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn}>
            <Ionicons name="share-social" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.sheet}>
        <View style={s.handle} />

        {loading ? (
          <ActivityIndicator size="large" color="#01BDA5" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.sheetContent}>
            <View style={s.section}>
              <Text style={s.roomName}>{displayName}</Text>
              {adresse ? (
                <View style={s.infoRow}>
                  <Ionicons name="location-outline" size={14} color="#464646" />
                  <Text style={s.infoText}>{adresse}</Text>
                </View>
              ) : null}
            </View>

            {detail?.description ? (
              <View style={s.section}>
                <Text style={s.sectionTitle}>A propos</Text>
                <Text style={s.body}>{detail.description}</Text>
              </View>
            ) : null}

            <View style={s.section}>
              <Text style={s.sectionTitle}>Details</Text>
              <View style={s.detailsRow}>
                <View style={s.detailItem}>
                  <Ionicons name="bed-outline" size={29} color="#000000" />
                  <Text style={s.detailLabel}>Lits :</Text>
                  <Text style={s.detailVal}>{detail?.nb_lits ?? "-"}</Text>
                </View>
                <View style={s.detailItem}>
                  <Ionicons name="water-outline" size={24} color="#000000" />
                  <Text style={s.detailLabel}>SDB :</Text>
                  <Text style={s.detailVal}>{detail?.nb_salles_bain ?? "-"}</Text>
                </View>
                <View style={s.detailItem}>
                  <Ionicons name="person-outline" size={24} color="#000000" />
                  <Text style={s.detailLabel}>Pers :</Text>
                  <Text style={s.detailVal}>{detail?.capacite ?? "-"}</Text>
                </View>
              </View>
            </View>

            {equipements.length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Équipements</Text>
                <View style={s.equipRow}>
                  <View style={s.equipCol}>
                    {equipLeft.map((eq) => (
                      <View key={eq.id} style={s.equipItem}>
                        <Ionicons name={equipIcon(eq.nom) as any} size={17} color="#464646" />
                        <Text style={s.equipText}>{eq.nom}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={s.equipCol}>
                    {equipRight.map((eq) => (
                      <View key={eq.id} style={s.equipItem}>
                        <Ionicons name={equipIcon(eq.nom) as any} size={17} color="#464646" />
                        <Text style={s.equipText}>{eq.nom}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            <View style={{ height: 90 }} />
          </ScrollView>
        )}
      </View>

      <View style={s.bottomBar}>
        <View>
          <Text style={s.barPrice}>{displayPrice}</Text>
        </View>
        <TouchableOpacity
          style={s.reserveBtn}
          onPress={() => navigation.navigate("Booking", { roomName: displayName, price: displayPrice, proprieteId: id })}
        >
          <Text style={s.reserveBtnText}>Réserver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  photoBox: { height: 359 },
  photo: { height: 359 },
  photoDots: { position: "absolute", bottom: 16, alignSelf: "center", flexDirection: "row", gap: 3 },
  photoHeader: { position: "absolute", top: 61, left: 20, right: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  iconBtn: { width: 42, height: 42, borderRadius: 38, alignItems: "center", justifyContent: "center" },
  dot: { width: 8, height: 8, borderRadius: 100, backgroundColor: "#FFFFFF" },
  dotActive: { width: 28, backgroundColor: "#01BDA5" },
  sheet: { flex: 1, backgroundColor: "#FFFFFF", borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -32, paddingTop: 10 },
  handle: { width: 61, height: 8, borderRadius: 100, backgroundColor: "#D7D7D7", marginBottom: 10, alignSelf: "center" },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 16, gap: 30 },
  section: { gap: 8, width: "100%" },
  sectionTitle: { fontFamily: "Outfit_600SemiBold", fontSize: 15, lineHeight: 25, letterSpacing: 0.3, color: "#000000" },
  roomName: { fontFamily: "Outfit_600SemiBold", fontSize: 15, lineHeight: 17, letterSpacing: 0.3, color: "#000000" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoText: { fontFamily: "Outfit_400Regular", fontSize: 13, lineHeight: 17, letterSpacing: 0.26, color: "#000000" },
  body: { fontFamily: "Outfit_400Regular", fontSize: 13, lineHeight: 16, color: "#434343" },
  detailsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  detailLabel: { fontFamily: "Outfit_300Light", fontSize: 15, lineHeight: 19, color: "#383838" },
  detailVal: { fontFamily: "Outfit_400Regular", fontSize: 15, lineHeight: 19, color: "#000000" },
  equipRow: { flexDirection: "row", gap: 10 },
  equipCol: { flex: 1, gap: 4 },
  equipItem: { flexDirection: "row", alignItems: "center", gap: 8, height: 25 },
  equipText: { fontFamily: "Outfit_400Regular", fontSize: 13, lineHeight: 25, letterSpacing: 0.26, color: "#464646" },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#FFFFFF", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28, borderTopWidth: 1, borderTopColor: "#F0F0F0" },
  barPrice: { fontFamily: "Outfit_700Bold", fontSize: 15, lineHeight: 17, color: "#000000" },
  reserveBtn: { backgroundColor: "#01BDA5", borderRadius: 50, paddingHorizontal: 28, height: 40, alignItems: "center", justifyContent: "center" },
  reserveBtnText: { fontFamily: "Outfit_400Regular", fontSize: 15, lineHeight: 15, color: "#FFFFFF", letterSpacing: 0.3 },
});
