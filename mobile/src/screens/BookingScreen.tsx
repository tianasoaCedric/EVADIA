import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar, DateData } from "react-native-calendars";
import { proprietesApi } from "../lib/proprietes";
import { reservationsApi } from "../lib/reservations";
import type { ProprieteDetail } from "../lib/types";
import { colors } from "../lib/tokens";

const FALLBACK_PHOTO = require("../assets/images/hotel.jpg");
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatDisplay(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function buildPeriodMarking(start: Date, end: Date): Record<string, any> {
  const marks: Record<string, any> = {};
  const startISO = toISODate(start);
  const endISO = toISODate(end);
  for (let t = start.getTime(); t <= end.getTime(); t += MS_PER_DAY) {
    const iso = toISODate(new Date(t));
    marks[iso] = {
      color: colors.primary.DEFAULT,
      textColor: "#fff",
      startingDay: iso === startISO,
      endingDay: iso === endISO,
    };
  }
  return marks;
}

function DateRangePicker({
  dateDebut,
  dateFin,
  minDate,
  onChange,
}: {
  dateDebut: Date;
  dateFin: Date;
  minDate: Date;
  onChange: (debut: Date, fin: Date) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [pendingStart, setPendingStart] = useState<Date | null>(null);

  const openPicker = () => {
    setPendingStart(null);
    setVisible(true);
  };

  const onDayPress = (day: DateData) => {
    const picked = new Date(`${day.dateString}T00:00:00`);

    if (!pendingStart) {
      setPendingStart(picked);
      return;
    }

    if (picked.getTime() <= pendingStart.getTime()) {
      // Nouvelle sélection de check-in si la date choisie précède le début en cours
      setPendingStart(picked);
      return;
    }

    onChange(pendingStart, picked);
    setVisible(false);
  };

  const markedDates = pendingStart
    ? { [toISODate(pendingStart)]: { color: colors.primary.DEFAULT, textColor: "#fff", startingDay: true, endingDay: true } }
    : buildPeriodMarking(dateDebut, dateFin);

  return (
    <>
      <TouchableOpacity onPress={openPicker} style={s.bookingRow}>
        <Text style={s.bookingLabel}>Dates du séjour</Text>
        <View style={s.dateDisplayRow}>
          <Ionicons name="calendar-outline" size={16} color="#000" />
          <Text style={s.dateDisplayText}>
            {formatDisplay(dateDebut)} → {formatDisplay(dateFin)}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>
                {pendingStart ? "Sélectionnez la date de départ" : "Sélectionnez la date d'arrivée"}
              </Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={22} color="#000" />
              </TouchableOpacity>
            </View>
            <Calendar
              minDate={toISODate(minDate)}
              markingType="period"
              markedDates={markedDates}
              onDayPress={onDayPress}
              theme={{
                todayTextColor: colors.primary.DEFAULT,
                arrowColor: colors.primary.DEFAULT,
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={s.summaryRow}>
      <Text style={[s.summaryLabel, bold && s.summaryBold]}>{label}</Text>
      <Text style={[s.summaryValue, bold && s.summaryValueBold]}>{value}</Text>
    </View>
  );
}

export default function BookingScreen({ route, navigation }: any) {
  const { proprieteId } = route.params;
  const { width: SW } = useWindowDimensions();

  const [propriete, setPropriete] = useState<ProprieteDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tomorrow = useMemo(() => new Date(Date.now() + MS_PER_DAY), []);
  const [dateDebut, setDateDebut] = useState(tomorrow);
  const [dateFin, setDateFin] = useState(new Date(tomorrow.getTime() + MS_PER_DAY));
  const [nbAdultes, setNbAdultes] = useState(2);

  useEffect(() => {
    proprietesApi
      .detail(proprieteId)
      .then(setPropriete)
      .finally(() => setIsLoading(false));
  }, [proprieteId]);

  // Le check-out doit toujours rester après le check-in
  useEffect(() => {
    if (dateFin.getTime() <= dateDebut.getTime()) {
      setDateFin(new Date(dateDebut.getTime() + MS_PER_DAY));
    }
  }, [dateDebut, dateFin]);

  const nbNuits = Math.max(1, Math.round((dateFin.getTime() - dateDebut.getTime()) / MS_PER_DAY));
  const prixNuit = propriete?.prix_mga ?? 0;
  const total = prixNuit * nbNuits;

  const handleReserve = async () => {
    if (!propriete) return;
    setIsSubmitting(true);
    try {
      const reservation = await reservationsApi.create({
        propriete_id: propriete.id,
        date_debut: toISODate(dateDebut),
        date_fin: toISODate(dateFin),
        nb_adultes: nbAdultes,
        devise: "MGA",
      });
      Alert.alert(
        "Réservation envoyée",
        `Votre demande ${reservation.code_reservation} a été transmise à l'hôtel.`,
        [{ text: "OK", onPress: () => navigation.navigate("DestinationList") }]
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        (err?.response?.status === 409
          ? "Cette chambre n'est plus disponible pour ces dates."
          : "Impossible de créer la réservation. Vérifiez les informations.");
      Alert.alert("Erreur", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !propriete) {
    return (
      <View style={[s.root, { alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }]}>
        <ActivityIndicator color={colors.primary.DEFAULT} />
      </View>
    );
  }

  const photo = propriete.photos[0]?.url_photo;

  return (
    <View style={s.root}>
      {/* ── PHOTO ── */}
      <View style={[s.photoBox, { width: SW }]}>
        <Image
          source={photo ? { uri: photo } : FALLBACK_PHOTO}
          style={[s.photo, { width: SW }]}
          resizeMode="cover"
        />
        <View style={s.photoHeader}>
          <TouchableOpacity style={s.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── BOTTOM SHEET ── */}
      <View style={s.sheet}>
        <View style={s.handle} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.sheetContent}>
          <Text style={s.roomTitle}>{propriete.nom}</Text>

          {/* Prix */}
          <View style={s.priceRow}>
            <Text style={s.priceText}>
              {prixNuit ? `${prixNuit.toLocaleString("fr-FR")}Ar/nuit` : "Prix sur demande"}
            </Text>
          </View>

          <View style={s.divider} />

          {/* Dates + voyageurs */}
          <View style={s.section}>
            <DateRangePicker
              dateDebut={dateDebut}
              dateFin={dateFin}
              minDate={tomorrow}
              onChange={(debut, fin) => {
                setDateDebut(debut);
                setDateFin(fin);
              }}
            />
            <View style={s.bookingRow}>
              <Text style={s.bookingLabel}>Voyageurs</Text>
              <View style={s.stepperRow}>
                <TouchableOpacity
                  onPress={() => setNbAdultes((n) => Math.max(1, n - 1))}
                  style={s.stepperBtn}
                >
                  <Ionicons name="remove" size={16} color="#000" />
                </TouchableOpacity>
                <Text style={s.stepperValue}>{nbAdultes} personne{nbAdultes > 1 ? "s" : ""}</Text>
                <TouchableOpacity
                  onPress={() => setNbAdultes((n) => Math.min(propriete.capacite, n + 1))}
                  style={s.stepperBtn}
                >
                  <Ionicons name="add" size={16} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={s.divider} />

          {/* Récapitulatif */}
          <View style={s.section}>
            <SummaryRow label={`${nbNuits} nuit${nbNuits > 1 ? "s" : ""}`} value={`${total.toLocaleString("fr-FR")}Ar`} />
          </View>

          <View style={s.divider} />

          <View style={s.totalSection}>
            <SummaryRow label="Total" value={`${total.toLocaleString("fr-FR")}Ar`} bold />
          </View>

          {propriete.hotel.exige_acompte && (
            <Text style={s.acompteNote}>
              Un acompte de {propriete.hotel.pourcentage_acompte}% sera demandé après confirmation par l'hôtel.
            </Text>
          )}

          <TouchableOpacity
            style={[s.reserveBtn, isSubmitting && { opacity: 0.6 }]}
            onPress={handleReserve}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.reserveBtnText}>Réserver</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },

  // PHOTO
  photoBox: { height: 259 },
  photo: { height: 259 },
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
    paddingBottom: 60,
    gap: 0,
  },

  roomTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 18,
    color: "#000000",
    marginBottom: 8,
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

  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
  },

  // SECTIONS
  section: {
    paddingVertical: 15,
    gap: 14,
  },

  // BOOKING ROWS
  bookingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bookingLabel: {
    fontFamily: "Outfit_300Light",
    fontSize: 13,
    lineHeight: 16,
    color: "#4E4E4E",
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValue: {
    fontFamily: "Outfit_400Regular",
    fontSize: 13,
    color: "#000000",
    minWidth: 90,
    textAlign: "center",
  },

  // DATE RANGE PICKER
  dateDisplayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  dateDisplayText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 13,
    color: "#000000",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
    color: "#000000",
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

  acompteNote: {
    fontFamily: "Outfit_300Light",
    fontSize: 12,
    color: "#7E7E7E",
    marginTop: 10,
  },

  // RÉSERVER
  reserveBtn: {
    backgroundColor: "#01BDA5",
    borderRadius: 25,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
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
