import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AvisItem, HotelDetail, getHotelAvis, getHotelDetail } from "../services/homeService";
import { API_BASE_URL } from "../lib/api";

function normalizeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}/storage/${url}`;
}

function StarRating({ rating }: { rating: number | null }) {
  const filled = rating ? Math.round(rating) : 0;
  return (
    <View style={s.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons key={i} name="star" size={12} color={i <= filled ? "#FFE100" : "#E0E0E0"} />
      ))}
    </View>
  );
}

export default function HotelDetailScreen({ route, navigation }: any) {
  const { id, name: initialName } = route.params ?? {};
  const { width: SW } = useWindowDimensions();

  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [avis, setAvis] = useState<AvisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [roomIdx, setRoomIdx] = useState(0);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getHotelDetail(id), getHotelAvis(id)])
      .then(([h, a]) => { setHotel(h); setAvis(a); })
      .finally(() => setLoading(false));
  }, [id]);

  const onPhotoScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setPhotoIdx(Math.round(e.nativeEvent.contentOffset.x / SW));
  const onRoomScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setRoomIdx(Math.round(e.nativeEvent.contentOffset.x / (SW - 40)));

  const photos = hotel?.photos ?? [];
  const displayPhotos = photos.length > 0 ? photos : [null];

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#01BDA5" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* ── PHOTOS CAROUSEL ── */}
      <View style={[s.photoBox, { width: SW }]}>
        <ScrollView
          horizontal pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onPhotoScroll}
        >
          {displayPhotos.map((p, i) => (
            <Image
              key={i}
              source={p?.url_photo ? { uri: p.url_photo } : require("../assets/images/hotel.jpg")}
              style={[s.photo, { width: SW }]}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        <View style={s.photoDots}>
          {displayPhotos.map((_, i) => (
            <View key={i} style={[s.dot, i === photoIdx && s.dotActive]} />
          ))}
        </View>

        <View style={s.photoHeader}>
          <TouchableOpacity style={s.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={s.headerRight}>
            <TouchableOpacity style={s.iconBtn}>
              <Ionicons name="share-social" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn} onPress={() => setIsFav(!isFav)}>
              <Ionicons name={isFav ? "heart" : "heart-outline"} size={22} color={isFav ? "#FF4141" : "#FFFFFF"} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── BOTTOM SHEET ── */}
      <View style={s.sheet}>
        <View style={s.handle} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.sheetContent}>

          {/* ── INFO HOTEL ── */}
          <View style={s.section}>
            <Text style={s.hotelName}>{hotel?.nom ?? initialName}</Text>
            {hotel?.adresse && (
              <View style={s.infoRow}>
                <Ionicons name="location-outline" size={14} color="#464646" />
                <Text style={s.infoText}>
                  {hotel.adresse.adresse_ligne1 ? `${hotel.adresse.adresse_ligne1}, ` : ""}
                  {hotel.adresse.ville} - {hotel.adresse.pays}
                </Text>
              </View>
            )}
            {hotel?.note_moyenne != null && (
              <View style={s.infoRow}>
                <Ionicons name="star" size={14} color="#464646" />
                <Text style={s.ratingBold}>
                  {hotel.note_moyenne.toFixed(1)}{"  "}
                  <Text style={s.ratingLight}>{hotel.nb_avis} avis</Text>
                </Text>
              </View>
            )}
          </View>

          {/* ── À PROPOS ── */}
          {hotel?.description ? (
            <View style={s.section}>
              <Text style={s.sectionTitle}>A propos</Text>
              <Text style={s.body}>{hotel.description}</Text>
            </View>
          ) : null}

          {/* ── CHAMBRES ── */}
          {hotel?.chambres && hotel.chambres.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Chambres et disponibilité</Text>
              <ScrollView
                horizontal pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onRoomScroll}
                contentContainerStyle={{ gap: 0 }}
              >
                {hotel.chambres.map((room) => {
                  const priceStr = room.prix_par_nuit
                    ? `${room.prix_par_nuit.toLocaleString()} ${room.devise ?? "Ar"}/nuit`
                    : "Prix sur demande";
                  return (
                    <View key={room.id} style={[s.roomCard, { width: SW - 40 }]}>
                      <Image
                        source={
                          room.photos[0]
                            ? { uri: room.photos[0] }
                            : require("../assets/images/hotel.jpg")
                        }
                        style={s.roomImg}
                        resizeMode="cover"
                      />
                      <View style={s.roomInfo}>
                        <View style={s.roomTopRow}>
                          <Text style={s.roomName} numberOfLines={1}>{room.nom}</Text>
                          <Text style={s.roomPrice}>{priceStr}</Text>
                        </View>
                        <View style={s.roomMeta}>
                          <View style={s.metaItem}>
                            <Ionicons name="bed-outline" size={16} color="#383838" />
                            <Text style={s.metaLabel}>Lits :</Text>
                            <Text style={s.metaVal}>{room.nb_lits}</Text>
                          </View>
                          <View style={s.metaItem}>
                            <Ionicons name="water-outline" size={16} color="#383838" />
                            <Text style={s.metaLabel}>SDB :</Text>
                            <Text style={s.metaVal}>{room.nb_salles_bain}</Text>
                          </View>
                          <View style={s.metaItem}>
                            <Ionicons name="person-outline" size={16} color="#383838" />
                            <Text style={s.metaLabel}>Pers :</Text>
                            <Text style={s.metaVal}>{room.capacite}</Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={s.reserveBtn}
                          onPress={() =>
                            navigation.navigate("RoomDetail", {
                              id: String(room.id),
                              name: room.nom,
                              price: priceStr,
                              beds: room.nb_lits,
                              sdb: room.nb_salles_bain,
                              pers: room.capacite,
                            })
                          }
                        >
                          <Text style={s.reserveBtnText}>Reserver</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
              <View style={s.roomDots}>
                {hotel.chambres.map((_, i) => (
                  <View key={i} style={[s.dot, i === roomIdx && s.dotActive]} />
                ))}
              </View>
            </View>
          )}

          {/* ── ÉQUIPEMENTS / SERVICES ── */}
          {hotel?.services && hotel.services.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Équipements</Text>
              <View style={s.equipRow}>
                <View style={s.equipCol}>
                  {hotel.services
                    .filter((_, i) => i % 2 === 0)
                    .map((svc) => (
                      <Text key={svc.id} style={s.equipText}>{svc.nom}</Text>
                    ))}
                </View>
                <View style={s.equipCol}>
                  {hotel.services
                    .filter((_, i) => i % 2 !== 0)
                    .map((svc) => (
                      <Text key={svc.id} style={s.equipText}>{svc.nom}</Text>
                    ))}
                </View>
              </View>
            </View>
          )}

          {/* ── AVIS ── */}
          {avis.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Avis des voyageurs</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 25 }}>
                {avis.map((a) => (
                  <View key={a.id} style={s.avisCard}>
                    <View style={s.avisHeader}>
                      {a.client.photo_profil ? (
                        <Image
                          source={{ uri: normalizeUrl(a.client.photo_profil) }}
                          style={s.avisAvatar}
                        />
                      ) : (
                        <View style={s.avisAvatar} />
                      )}
                      <View>
                        <Text style={s.avisName}>{a.client.prenom} {a.client.nom}</Text>
                        <View style={s.avisRating}>
                          <StarRating rating={a.note} />
                          <Text style={s.avisRatingText}>{a.note.toFixed(1)}</Text>
                        </View>
                      </View>
                    </View>
                    <Text style={s.avisText}>{a.commentaire}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  photoBox: { height: 359 },
  photo: { height: 359 },
  photoDots: {
    position: "absolute", bottom: 16,
    alignSelf: "center", flexDirection: "row", gap: 3,
  },
  photoHeader: {
    position: "absolute", top: 61, left: 20, right: 20,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  headerRight: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 42, height: 42, borderRadius: 38,
    alignItems: "center", justifyContent: "center",
  },

  dot: { width: 8, height: 8, borderRadius: 100, backgroundColor: "#FFFFFF" },
  dotActive: { width: 28, backgroundColor: "#01BDA5" },

  sheet: {
    flex: 1, backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    marginTop: -32, paddingTop: 10,
  },
  handle: {
    width: 61, height: 8, borderRadius: 100,
    backgroundColor: "#D7D7D7", marginBottom: 10,
    alignSelf: "center",
  },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 30 },

  section: { gap: 10, width: "100%" },
  sectionTitle: {
    fontFamily: "Outfit_600SemiBold", fontSize: 15,
    lineHeight: 19, color: "#000000",
  },

  hotelName: {
    fontFamily: "Outfit_600SemiBold", fontSize: 15,
    lineHeight: 17, letterSpacing: 0.3, color: "#000000",
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoText: {
    fontFamily: "Outfit_400Regular", fontSize: 13,
    lineHeight: 17, letterSpacing: 0.26, color: "#000000",
  },
  ratingBold: {
    fontFamily: "Outfit_700Bold", fontSize: 15,
    lineHeight: 17, letterSpacing: 0.3, color: "#000000",
  },
  ratingLight: { fontFamily: "Outfit_400Regular", fontWeight: "400" },

  body: {
    fontFamily: "Outfit_400Regular", fontSize: 13,
    lineHeight: 17, letterSpacing: 0.26, color: "#464646",
  },

  roomCard: { flexDirection: "row", alignItems: "center", gap: 16 },
  roomImg: { width: 95, height: 95, borderRadius: 15 },
  roomInfo: { flex: 1, height: 95, justifyContent: "space-between" },
  roomTopRow: { flexDirection: "row", justifyContent: "space-between" },
  roomName: {
    fontFamily: "Outfit_500Medium", fontSize: 13,
    lineHeight: 16, color: "#4B4D42", flex: 1, marginRight: 4,
  },
  roomPrice: {
    fontFamily: "Outfit_600SemiBold", fontSize: 11,
    lineHeight: 16, color: "#434343",
  },
  roomMeta: { flexDirection: "row", justifyContent: "space-between" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaLabel: {
    fontFamily: "Outfit_300Light", fontSize: 13,
    lineHeight: 16, color: "#383838",
  },
  metaVal: {
    fontFamily: "Outfit_400Regular", fontSize: 13,
    lineHeight: 16, color: "#000000",
  },
  reserveBtn: {
    backgroundColor: "#01BDA5", borderRadius: 50,
    height: 29, alignItems: "center", justifyContent: "center",
  },
  reserveBtnText: {
    fontFamily: "Outfit_400Regular", fontSize: 15,
    lineHeight: 15, color: "#FFFFFF", letterSpacing: 0.3,
  },
  roomDots: { flexDirection: "row", gap: 3, alignSelf: "center", marginTop: 6 },

  equipRow: { flexDirection: "row", gap: 10 },
  equipCol: { flex: 1, gap: 8 },
  equipText: {
    fontFamily: "Outfit_400Regular", fontSize: 13,
    lineHeight: 25, letterSpacing: 0.26, color: "#464646",
  },

  avisCard: { width: 327, gap: 8 },
  avisHeader: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  avisAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#D9D9D9" },
  avisName: {
    fontFamily: "Outfit_600SemiBold", fontSize: 13,
    lineHeight: 17, letterSpacing: 0.26, color: "#464646",
  },
  avisRating: { flexDirection: "row", alignItems: "center", gap: 3 },
  avisRatingText: {
    fontFamily: "Outfit_400Regular", fontSize: 11,
    lineHeight: 14, color: "#434343",
  },
  avisText: {
    fontFamily: "Outfit_400Regular", fontSize: 12,
    lineHeight: 17, letterSpacing: 0.24, color: "#464646",
  },
  starsRow: { flexDirection: "row", gap: 2 },
});
