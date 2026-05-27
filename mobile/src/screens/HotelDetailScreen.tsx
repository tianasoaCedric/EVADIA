import React, { useRef, useState } from "react";
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

const ROOMS = [
  { id: "1", name: "Suite de Luxe", price: "225.000Ariary/nuit", beds: 2, sdb: 2, pers: 4 },
  { id: "2", name: "Bungalow Vue Mer", price: "185.000Ariary/nuit", beds: 1, sdb: 1, pers: 2 },
];

const EQUIPEMENTS_LEFT = ["Wi-Fi haut débit", "Télévision 4K", "Climatisation", "Piscine privée", "Parking gratuit", "Machine à café"];
const EQUIPEMENTS_RIGHT = ["Cuisine équipée", "Salle de sport", "Lave-linge", "Détecteur de fumée", "Entrée autonome", "Adapté aux enfants"];

const AVIS = [
  { id: "1", name: "Sophie Martin", rating: 4.25, stars: [true,true,true,true,false], text: "Villa absolument magnifique avec une vue spectaculaire sur l'océan. L'hôte était très accueillant et a rendu notre séjour inoubliable. La piscine privée et les équipements de luxe ont dépassé nos attentes." },
  { id: "2", name: "Jean Dupont", rating: 4.25, stars: [true,true,true,true,false], text: "Séjour exceptionnel dans un cadre idyllique. Les chambres sont spacieuses et très bien équipées. Le personnel est aux petits soins. Je recommande vivement cet établissement." },
  { id: "3", name: "Marie Claire", rating: 4.25, stars: [true,true,true,true,false], text: "Un endroit paradisiaque, calme et reposant. La vue sur la mer est à couper le souffle. Les repas servis sont délicieux et variés. Une expérience inoubliable." },
];

function StarRating({ stars }: { stars: boolean[] }) {
  return (
    <View style={s.starsRow}>
      {stars.map((filled, i) => (
        <Ionicons key={i} name="star" size={12} color={filled ? "#FFE100" : "#E0E0E0"} />
      ))}
    </View>
  );
}

export default function HotelDetailScreen({ route, navigation }: any) {
  const { name } = route.params ?? { name: "Aara Ecolodge" };
  const { width: SW } = useWindowDimensions();
  const [photoIdx, setPhotoIdx] = useState(0);
  const [roomIdx, setRoomIdx] = useState(0);
  const [isFav, setIsFav] = useState(false);

  const onPhotoScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPhotoIdx(Math.round(e.nativeEvent.contentOffset.x / SW));
  };
  const onRoomScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setRoomIdx(Math.round(e.nativeEvent.contentOffset.x / (SW - 40)));
  };

  return (
    <View style={s.container}>
      {/* ── PHOTOS CAROUSEL (full screen) ── */}
      <View style={[s.photoBox, { width: SW }]}>
        <ScrollView
          horizontal pagingEnabled
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
        {/* Handle */}
        <View style={s.handle} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.sheetContent}>

          {/* ── INFO HOTEL ── */}
          <View style={s.section}>
            <Text style={s.hotelName}>{name}</Text>
            <View style={s.infoRow}>
              <Ionicons name="location-outline" size={14} color="#464646" />
              <Text style={s.infoText}>Lonkitsy, Sainte Marie - Madagascar</Text>
            </View>
            <View style={s.infoRow}>
              <Ionicons name="star" size={14} color="#464646" />
              <Text style={s.ratingBold}>4,5  <Text style={s.ratingLight}>125 avis</Text></Text>
            </View>
          </View>

          {/* ── À PROPOS ── */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>A propos</Text>
            <Text style={s.body}>
              Détendez-vous dans notre établissement confortable avec 3 villas indépendantes et 5 bungalows. Calme, familial et à quelque pas de la mer. A proximité des marchés et des activités.
            </Text>
          </View>

          {/* ── CHAMBRES ── */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Chambres et disponibilité</Text>
            <ScrollView
              horizontal pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onRoomScroll}
              contentContainerStyle={{ gap: 0 }}
            >
              {ROOMS.map((room) => (
                <View key={room.id} style={[s.roomCard, { width: SW - 40 }]}>
                  <Image source={require("../assets/images/hotel.jpg")} style={s.roomImg} resizeMode="cover" />
                  <View style={s.roomInfo}>
                    <View style={s.roomTopRow}>
                      <Text style={s.roomName}>{room.name}</Text>
                      <Text style={s.roomPrice}>{room.price}</Text>
                    </View>
                    <View style={s.roomMeta}>
                      <View style={s.metaItem}>
                        <Ionicons name="bed-outline" size={16} color="#383838" />
                        <Text style={s.metaLabel}>Lits :</Text>
                        <Text style={s.metaVal}>{room.beds}</Text>
                      </View>
                      <View style={s.metaItem}>
                        <Ionicons name="water-outline" size={16} color="#383838" />
                        <Text style={s.metaLabel}>SDB :</Text>
                        <Text style={s.metaVal}>{room.sdb}</Text>
                      </View>
                      <View style={s.metaItem}>
                        <Ionicons name="person-outline" size={16} color="#383838" />
                        <Text style={s.metaLabel}>Pers :</Text>
                        <Text style={s.metaVal}>{room.pers}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={s.reserveBtn}
                      onPress={() => navigation.navigate("RoomDetail", {
                        id: room.id,
                        name: room.name,
                        price: room.price,
                        beds: room.beds,
                        sdb: room.sdb,
                        pers: room.pers,
                      })}
                    >
                      <Text style={s.reserveBtnText}>Reserver</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Room dots */}
            <View style={s.roomDots}>
              {ROOMS.map((_, i) => (
                <View key={i} style={[s.dot, i === roomIdx && s.dotActive]} />
              ))}
            </View>
          </View>

          {/* ── ÉQUIPEMENTS ── */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Équipements</Text>
            <View style={s.equipRow}>
              <View style={s.equipCol}>
                {EQUIPEMENTS_LEFT.map((eq) => (
                  <Text key={eq} style={s.equipText}>{eq}</Text>
                ))}
              </View>
              <View style={s.equipCol}>
                {EQUIPEMENTS_RIGHT.map((eq) => (
                  <Text key={eq} style={s.equipText}>{eq}</Text>
                ))}
              </View>
            </View>
            <TouchableOpacity>
              <Text style={s.showAll}>Afficher tous les équipements</Text>
            </TouchableOpacity>
          </View>

          {/* ── AVIS ── */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Avis des voyageurs</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 25 }}>
              {AVIS.map((avis) => (
                <View key={avis.id} style={s.avisCard}>
                  <View style={s.avisHeader}>
                    <View style={s.avisAvatar} />
                    <View>
                      <Text style={s.avisName}>{avis.name}</Text>
                      <View style={s.avisRating}>
                        <StarRating stars={avis.stars} />
                        <Text style={s.avisRatingText}>{avis.rating}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={s.avisText}>{avis.text}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  // PHOTOS
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

  // DOTS
  dot: { width: 8, height: 8, borderRadius: 100, backgroundColor: "#FFFFFF" },
  dotActive: { width: 28, backgroundColor: "#01BDA5" },

  // SHEET
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

  // SECTIONS
  section: { gap: 10, width: "100%" },
  sectionTitle: {
    fontFamily: "Outfit_600SemiBold", fontSize: 15,
    lineHeight: 19, color: "#000000",
  },

  // HOTEL INFO
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

  // À PROPOS
  body: {
    fontFamily: "Outfit_400Regular", fontSize: 13,
    lineHeight: 17, letterSpacing: 0.26, color: "#464646",
  },

  // CHAMBRES
  roomCard: {
    flexDirection: "row",
    alignItems: "center", gap: 16,
  },
  roomImg: { width: 95, height: 95, borderRadius: 15 },
  roomInfo: { flex: 1, height: 95, justifyContent: "space-between" },
  roomTopRow: { flexDirection: "row", justifyContent: "space-between" },
  roomName: {
    fontFamily: "Outfit_500Medium", fontSize: 13,
    lineHeight: 16, color: "#4B4D42",
  },
  roomPrice: {
    fontFamily: "Outfit_600SemiBold", fontSize: 13,
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
  roomDots: {
    flexDirection: "row", gap: 3,
    alignSelf: "center", marginTop: 6,
  },

  // ÉQUIPEMENTS
  equipRow: { flexDirection: "row", gap: 10 },
  equipCol: { flex: 1, gap: 8 },
  equipText: {
    fontFamily: "Outfit_400Regular", fontSize: 13,
    lineHeight: 25, letterSpacing: 0.26, color: "#464646",
  },
  showAll: {
    fontFamily: "Outfit_400Regular", fontSize: 13,
    lineHeight: 34, letterSpacing: 0.26, color: "#2FC9B5",
  },

  // AVIS
  avisCard: { width: 327, gap: 8 },
  avisHeader: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  avisAvatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: "#D9D9D9",
  },
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
