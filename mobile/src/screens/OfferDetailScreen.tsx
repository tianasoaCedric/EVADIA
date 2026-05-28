import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Image, StyleSheet,
  useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OffreDetail, getOffreDetail } from "../services/offreService";

export default function OfferDetailScreen({ route, navigation }: any) {
  const { width: SW } = useWindowDimensions();
  const { id, badge, name, description, photo } = route.params ?? {};
  const [photoIdx, setPhotoIdx] = useState(0);
  const [detail, setDetail] = useState<OffreDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) getOffreDetail(id).then(setDetail).finally(() => setLoading(false));
    else setLoading(false);
  }, [id]);

  const onPhotoScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setPhotoIdx(Math.round(e.nativeEvent.contentOffset.x / SW));

  const displayPhoto = detail?.photo ?? photo;
  const displayBadge = detail?.badge ?? badge ?? "";
  const displayName = detail ? `${detail.hotel_nom}${detail.city ? `, ${detail.city}` : ""}` : (name ?? "");
  const displayDesc = detail?.description ?? description ?? "";
  const terms = detail?.terms ?? [];

  return (
    <View style={s.root}>
      {/* ── PHOTO ── */}
      <View style={[s.photoBox, { width: SW }]}>
        <Image
          source={displayPhoto ? { uri: displayPhoto } : require("../assets/images/hotel.jpg")}
          style={[s.photo, { width: SW }]}
          resizeMode="cover"
        />
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

        {loading ? (
          <ActivityIndicator size="large" color="#01BDA5" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.sheetContent}>
            <View style={s.topSection}>
              <View style={s.badge}>
                <Text style={s.badgeText}>{displayBadge}</Text>
              </View>
              <Text style={s.offerName}>{displayName}</Text>
              <Text style={s.offerDesc}>{displayDesc}</Text>
            </View>

            {terms.length > 0 && (
              <View style={s.detailSection}>
                <Text style={s.detailTitle}>Informations supplémentaires</Text>
                {terms.map((item, i) => (
                  <Text key={i} style={s.bulletItem}>{"• " + item}</Text>
                ))}
              </View>
            )}

            {detail?.phone || detail?.email ? (
              <View style={s.detailSection}>
                <Text style={s.detailTitle}>Contact</Text>
                {detail.phone ? <Text style={s.bulletItem}>{"• " + detail.phone}</Text> : null}
                {detail.email ? <Text style={s.bulletItem}>{"• " + detail.email}</Text> : null}
              </View>
            ) : null}

            <TouchableOpacity style={s.reserveBtn}>
              <Text style={s.reserveBtnText}>Réserver</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  photoBox: { height: 382 },
  photo: { height: 382 },
  photoHeader: { position: "absolute", top: 61, left: 20, right: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  iconBtn: { width: 42, height: 42, borderRadius: 38, alignItems: "center", justifyContent: "center" },
  sheet: { flex: 1, backgroundColor: "#FFFFFF", borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -44, paddingTop: 10 },
  handle: { width: 61, height: 8, borderRadius: 100, backgroundColor: "#D7D7D7", marginBottom: 10, alignSelf: "center" },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 32 },
  topSection: { gap: 10 },
  badge: { backgroundColor: "#01BDA5", borderRadius: 50, alignSelf: "stretch", alignItems: "center", justifyContent: "center", paddingVertical: 8, paddingHorizontal: 15 },
  badgeText: { fontFamily: "Outfit_500Medium", fontSize: 20, lineHeight: 24, letterSpacing: 1.6, color: "#FFFFFF", textAlign: "center" },
  offerName: { fontFamily: "Outfit_700Bold", fontSize: 13, lineHeight: 18, color: "#000000" },
  offerDesc: { fontFamily: "Outfit_400Regular", fontSize: 13, lineHeight: 16, color: "#000000" },
  detailSection: { gap: 8 },
  detailTitle: { fontFamily: "Outfit_600SemiBold", fontSize: 13, lineHeight: 23, letterSpacing: 0.39, color: "#464646" },
  bulletItem: { fontFamily: "Outfit_400Regular", fontSize: 13, lineHeight: 32, letterSpacing: 0.26, color: "#464646" },
  reserveBtn: { backgroundColor: "#01BDA5", borderRadius: 25, height: 38, alignItems: "center", justifyContent: "center" },
  reserveBtnText: { fontFamily: "Outfit_600SemiBold", fontSize: 14, lineHeight: 18, letterSpacing: 0.28, color: "#FFFFFF", textAlign: "center" },
});
