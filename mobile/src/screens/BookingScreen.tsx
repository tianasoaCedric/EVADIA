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

function BookingRow({
  label,
  icon,
  value,
}: {
  label: string;
  icon: string;
  value: string;
}) {
  return (
    <View style={s.bookingRow}>
      <Text style={s.bookingLabel}>{label}</Text>
      <View style={s.valuePill}>
        <Ionicons name={icon as any} size={20} color="#000000" />
        <Text style={s.valueText}>{value}</Text>
      </View>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={s.summaryRow}>
      <Text style={[s.summaryLabel, bold && s.summaryBold]}>{label}</Text>
      <Text style={[s.summaryValue, bold && s.summaryValueBold]}>{value}</Text>
    </View>
  );
}

export default function BookingScreen({ route, navigation }: any) {
  const { width: SW } = useWindowDimensions();
  const { roomName, price } = route.params ?? {
    roomName: "Suite de Luxe",
    price: "225.000ar/nuit",
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
        </View>
      </View>

      {/* ── BOTTOM SHEET ── */}
      <View style={s.sheet}>
        <View style={s.handle} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.sheetContent}
        >
          {/* Prix + badge offre */}
          <View style={s.priceRow}>
            <Text style={s.priceText}>{price}</Text>
            <View style={s.offreBadge}>
              <Text style={s.offreText}>Offre 20%</Text>
            </View>
          </View>

          {/* Séparateur */}
          <View style={s.divider} />

          {/* Dates + voyageurs */}
          <View style={s.section}>
            <BookingRow label="Check In" icon="calendar-outline" value="01/01/2026" />
            <BookingRow label="Check Out" icon="calendar-outline" value="03/01/2026" />
            <BookingRow label="Nombre de voyageurs" icon="person-outline" value="2 personnes" />
          </View>

          <View style={s.divider} />

          {/* Récapitulatif */}
          <View style={s.section}>
            <SummaryRow label="Sejour" value="675.000ar" />
            <SummaryRow label="Frais de services" value="0ar" />
            <SummaryRow label="Reduction" value="135.000ar" />
          </View>

          <View style={s.divider} />

          {/* Total */}
          <View style={s.totalSection}>
            <SummaryRow label="Total" value="540.000ar" bold />
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
  photoBox: { height: 359 },
  photo: { height: 359 },
  photoHeader: {
    position: "absolute",
    top: 61,
    left: 20,
    flexDirection: "row",
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
    marginTop: -99,
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
    paddingBottom: 60,
    gap: 0,
  },

  // PRIX
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
  },
  priceText: {
    fontFamily: "Outfit_500Medium",
    fontSize: 24,
    lineHeight: 30,
    color: "#000000",
  },
  offreBadge: {
    backgroundColor: "#01BDA5",
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  offreText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
    lineHeight: 18,
    color: "#FFFFFF",
    textAlign: "center",
  },

  divider: {
    height: 1,
    backgroundColor: "#5A5A5A",
  },

  // SECTIONS
  section: {
    paddingVertical: 15,
    gap: 10,
  },

  // BOOKING ROWS
  bookingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 35,
  },
  bookingLabel: {
    fontFamily: "Outfit_300Light",
    fontSize: 13,
    lineHeight: 16,
    color: "#4E4E4E",
  },
  valuePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    backgroundColor: "#FFFEFE",
    borderRadius: 50,
    width: 121,
    height: 35,
    paddingHorizontal: 8,
  },
  valueText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 15,
    lineHeight: 34,
    letterSpacing: 0.3,
    color: "#737373",
  },

  // SUMMARY
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 19,
  },
  summaryLabel: {
    fontFamily: "Outfit_300Light",
    fontSize: 13,
    lineHeight: 16,
    color: "#4E4E4E",
  },
  summaryBold: {
    fontFamily: "Outfit_700Bold",
    fontSize: 13,
  },
  summaryValue: {
    fontFamily: "Outfit_500Medium",
    fontSize: 15,
    lineHeight: 19,
    color: "#4E4E4E",
  },
  summaryValueBold: {
    fontFamily: "Outfit_700Bold",
    fontSize: 24,
    lineHeight: 30,
  },

  totalSection: {
    paddingVertical: 8,
    gap: 10,
  },

  // RÉSERVER
  reserveBtn: {
    backgroundColor: "#01BDA5",
    borderRadius: 25,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
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
