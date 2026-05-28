import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Image, StyleSheet,
  useWindowDimensions, Modal, ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createReservation } from "../services/reservationService";
import { getIndisponibilites, PlageIndisponible } from "../services/proprieteService";

const FALLBACK = require("../assets/images/hotel.jpg");

const MOIS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const JOURS_FR = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

function formatPrice(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const [intPart, decPart] = rounded.toFixed(2).split(".");
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return decPart === "00" ? intFormatted : `${intFormatted},${decPart}`;
}

function toIso(date: Date): string {
  return date.toISOString().split("T")[0];
}

function parseIso(iso: string): Date {
  return new Date(iso + "T00:00:00");
}

function addDays(iso: string, n: number): string {
  const d = parseIso(iso);
  d.setDate(d.getDate() + n);
  return toIso(d);
}

function todayIso(): string {
  return toIso(new Date());
}

function nightCount(from: string, to: string): number {
  const ms = parseIso(to).getTime() - parseIso(from).getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

function isInPlage(iso: string, plages: PlageIndisponible[]): boolean {
  const d = parseIso(iso).getTime();
  return plages.some((p) => {
    const debut = parseIso(p.debut).getTime();
    const fin = parseIso(p.fin).getTime();
    return d >= debut && d < fin;
  });
}

function isBeforeToday(iso: string): boolean {
  return parseIso(iso).getTime() < new Date().setHours(0, 0, 0, 0);
}

// ── CALENDRIER ──────────────────────────────────────────────────────────────

function CalendarModal({
  visible,
  mode,
  checkIn,
  checkOut,
  plages,
  onSelect,
  onClose,
}: {
  visible: boolean;
  mode: "checkin" | "checkout";
  checkIn: string;
  checkOut: string;
  plages: PlageIndisponible[];
  onSelect: (iso: string) => void;
  onClose: () => void;
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);

  // Lundi = 0
  const startOffset = (firstDay.getDay() + 6) % 7;

  const cells: (string | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push(toIso(new Date(year, month, d)));
  }

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const isDisabled = (iso: string) =>
    isBeforeToday(iso) ||
    isInPlage(iso, plages) ||
    (mode === "checkout" && iso <= checkIn);

  const isSelected = (iso: string) => iso === checkIn || iso === checkOut;

  const isInRange = (iso: string) => {
    if (!checkIn || !checkOut) return false;
    return iso > checkIn && iso < checkOut;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={cal.overlay}>
        <View style={cal.sheet}>
          <View style={cal.header}>
            <TouchableOpacity onPress={prevMonth} style={cal.navBtn}>
              <Ionicons name="chevron-back" size={22} color="#000" />
            </TouchableOpacity>
            <Text style={cal.monthTitle}>{MOIS_FR[month]} {year}</Text>
            <TouchableOpacity onPress={nextMonth} style={cal.navBtn}>
              <Ionicons name="chevron-forward" size={22} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={cal.weekRow}>
            {JOURS_FR.map((j) => (
              <Text key={j} style={cal.weekDay}>{j}</Text>
            ))}
          </View>

          <View style={cal.grid}>
            {cells.map((iso, i) => {
              if (!iso) return <View key={`e-${i}`} style={cal.cell} />;
              const disabled = isDisabled(iso);
              const selected = isSelected(iso);
              const inRange  = isInRange(iso);
              const day = parseIso(iso).getDate();
              return (
                <TouchableOpacity
                  key={iso}
                  style={[cal.cell, inRange && cal.cellInRange, disabled && cal.cellDisabled]}
                  onPress={() => !disabled && onSelect(iso)}
                  disabled={disabled}
                  activeOpacity={0.7}
                >
                  <View style={[cal.innerCircle, selected && cal.innerCircleSelected]}>
                    <Text style={[
                      cal.cellText,
                      selected && cal.cellTextSelected,
                      disabled && cal.cellTextDisabled,
                    ]}>
                      {day}
                    </Text>
                    {isInPlage(iso, plages) && !isBeforeToday(iso) && (
                      <View style={cal.dot} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={cal.legend}>
            <View style={cal.legendItem}>
              <View style={[cal.legendDot, { backgroundColor: "#EF4444" }]} />
              <Text style={cal.legendText}>Indisponible</Text>
            </View>
            <View style={cal.legendItem}>
              <View style={[cal.legendDot, { backgroundColor: "#01BDA5" }]} />
              <Text style={cal.legendText}>Sélectionné</Text>
            </View>
          </View>

          <TouchableOpacity style={cal.closeBtn} onPress={onClose}>
            <Text style={cal.closeTxt}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── COMPOSANTS UI ────────────────────────────────────────────────────────────

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={s.summaryRow}>
      <Text style={[s.summaryLabel, bold && s.summaryBold]}>{label}</Text>
      <Text style={[s.summaryValue, bold && s.summaryValueBold]}>{value}</Text>
    </View>
  );
}

function formatDisplayDate(iso: string): string {
  const d = parseIso(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// ── SCREEN ───────────────────────────────────────────────────────────────────

export default function BookingScreen({ route, navigation }: any) {
  const { width: SW } = useWindowDimensions();
  const { roomName, price, proprieteId } = route.params ?? {};

  const tomorrow = addDays(todayIso(), 1);
  const dayAfter  = addDays(todayIso(), 2);

  const [checkIn,  setCheckIn]  = useState(tomorrow);
  const [checkOut, setCheckOut] = useState(dayAfter);
  const [nbAdultes, setNbAdultes] = useState(1);
  const [calMode,  setCalMode]  = useState<"checkin" | "checkout">("checkin");
  const [showCal,  setShowCal]  = useState(false);
  const [plages,   setPlages]   = useState<PlageIndisponible[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (proprieteId) {
      getIndisponibilites(String(proprieteId)).then(setPlages).catch(() => {});
    }
  }, [proprieteId]);

  const nights = nightCount(checkIn, checkOut);

  const pricePerNight = (() => {
    if (!price) return 0;
    const cleaned = String(price).replace(/[^0-9.,]/g, "").replace(",", ".");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  })();

  const total = pricePerNight * nights;

  const openCal = (mode: "checkin" | "checkout") => {
    setCalMode(mode);
    setShowCal(true);
  };

  const handleDateSelect = (iso: string) => {
    if (calMode === "checkin") {
      setCheckIn(iso);
      if (iso >= checkOut) setCheckOut(addDays(iso, 1));
      setCalMode("checkout");
    } else {
      setCheckOut(iso);
      setShowCal(false);
    }
  };

  const handleReserve = async () => {
    if (!proprieteId) { Alert.alert("Erreur", "Informations de chambre manquantes."); return; }
    if (nights <= 0)  { Alert.alert("Dates invalides", "La date de départ doit être après la date d'arrivée."); return; }
    setSubmitting(true);
    try {
      await createReservation({ propriete_id: Number(proprieteId), date_debut: checkIn, date_fin: checkOut, nb_adultes: nbAdultes });
      Alert.alert("Réservation confirmée !", "Votre demande a bien été envoyée.", [
        { text: "OK", onPress: () => navigation.navigate("Reservations") },
      ]);
    } catch (err: any) {
      Alert.alert("Erreur", err?.response?.data?.message ?? "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={s.root}>
      <View style={[s.photoBox, { width: SW }]}>
        <Image source={FALLBACK} style={[s.photo, { width: SW }]} resizeMode="cover" />
        <View style={s.photoHeader}>
          <TouchableOpacity style={s.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.sheet}>
        <View style={s.handle} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.sheetContent}>
          <View style={s.priceRow}>
            <Text style={s.priceText}>{price ?? "—"}</Text>
            {nights > 0 && (
              <View style={s.nightsBadge}>
                <Text style={s.nightsText}>{nights} nuit{nights > 1 ? "s" : ""}</Text>
              </View>
            )}
          </View>

          <View style={s.divider} />

          {/* Dates */}
          <View style={s.section}>
            <View style={s.bookingRow}>
              <Text style={s.bookingLabel}>Check In</Text>
              <TouchableOpacity style={s.datePill} onPress={() => openCal("checkin")}>
                <Ionicons name="calendar-outline" size={18} color="#000" />
                <Text style={s.dateText}>{formatDisplayDate(checkIn)}</Text>
              </TouchableOpacity>
            </View>
            <View style={s.bookingRow}>
              <Text style={s.bookingLabel}>Check Out</Text>
              <TouchableOpacity style={s.datePill} onPress={() => openCal("checkout")}>
                <Ionicons name="calendar-outline" size={18} color="#000" />
                <Text style={s.dateText}>{formatDisplayDate(checkOut)}</Text>
              </TouchableOpacity>
            </View>
            <View style={s.bookingRow}>
              <Text style={s.bookingLabel}>Voyageurs</Text>
              <View style={s.counter}>
                <TouchableOpacity onPress={() => setNbAdultes(Math.max(1, nbAdultes - 1))} style={s.counterBtn}>
                  <Ionicons name="remove" size={18} color="#000" />
                </TouchableOpacity>
                <Text style={s.counterVal}>{nbAdultes}</Text>
                <TouchableOpacity onPress={() => setNbAdultes(nbAdultes + 1)} style={s.counterBtn}>
                  <Ionicons name="add" size={18} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={s.divider} />

          <View style={s.section}>
            <SummaryRow
              label={`${nights} nuit${nights > 1 ? "s" : ""} × ${formatPrice(pricePerNight)} Ar`}
              value={`${formatPrice(total)} Ar`}
            />
            <SummaryRow label="Frais de services" value="0 Ar" />
          </View>

          <View style={s.divider} />

          <View style={s.totalSection}>
            <SummaryRow label="Total" value={`${formatPrice(total)} Ar`} bold />
          </View>

          <TouchableOpacity style={s.reserveBtn} onPress={handleReserve} disabled={submitting}>
            {submitting
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={s.reserveBtnText}>Réserver</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </View>

      <CalendarModal
        visible={showCal}
        mode={calMode}
        checkIn={checkIn}
        checkOut={checkOut}
        plages={plages}
        onSelect={handleDateSelect}
        onClose={() => setShowCal(false)}
      />
    </View>
  );
}

// ── STYLES ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  photoBox: { height: 359 },
  photo: { height: 359 },
  photoHeader: { position: "absolute", top: 61, left: 20 },
  iconBtn: { width: 42, height: 42, borderRadius: 38, alignItems: "center", justifyContent: "center" },
  sheet: { flex: 1, backgroundColor: "#FFFFFF", borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -99, paddingTop: 10 },
  handle: { width: 61, height: 8, borderRadius: 100, backgroundColor: "#D7D7D7", marginBottom: 10, alignSelf: "center" },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 60 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 15 },
  priceText: { fontFamily: "Outfit_500Medium", fontSize: 24, lineHeight: 30, color: "#000000" },
  nightsBadge: { backgroundColor: "#01BDA5", borderRadius: 50, paddingHorizontal: 12, paddingVertical: 8 },
  nightsText: { fontFamily: "Outfit_400Regular", fontSize: 13, color: "#FFFFFF" },
  divider: { height: 1, backgroundColor: "#5A5A5A" },
  section: { paddingVertical: 15, gap: 12 },
  bookingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bookingLabel: { fontFamily: "Outfit_300Light", fontSize: 13, color: "#4E4E4E" },
  datePill: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F5F5F5", borderRadius: 50, paddingHorizontal: 14, height: 38 },
  dateText: { fontFamily: "Outfit_400Regular", fontSize: 13, color: "#000000" },
  counter: { flexDirection: "row", alignItems: "center", gap: 16 },
  counterBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center" },
  counterVal: { fontFamily: "Outfit_500Medium", fontSize: 16, color: "#000000", minWidth: 20, textAlign: "center" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontFamily: "Outfit_300Light", fontSize: 13, color: "#4E4E4E" },
  summaryBold: { fontFamily: "Outfit_700Bold", fontSize: 13 },
  summaryValue: { fontFamily: "Outfit_500Medium", fontSize: 15, color: "#4E4E4E" },
  summaryValueBold: { fontFamily: "Outfit_700Bold", fontSize: 24, lineHeight: 30 },
  totalSection: { paddingVertical: 8 },
  reserveBtn: { backgroundColor: "#01BDA5", borderRadius: 25, height: 40, alignItems: "center", justifyContent: "center", marginTop: 20 },
  reserveBtnText: { fontFamily: "Outfit_600SemiBold", fontSize: 14, letterSpacing: 0.28, color: "#FFFFFF" },
});

const cal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 36, paddingTop: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  navBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  monthTitle: { fontFamily: "Outfit_600SemiBold", fontSize: 16, color: "#000000" },
  weekRow: { flexDirection: "row", marginBottom: 8 },
  weekDay: { flex: 1, textAlign: "center", fontFamily: "Outfit_400Regular", fontSize: 12, color: "#9CA3AF" },
  grid: { flexDirection: "row", flexWrap: "wrap", width: "100%", rowGap: 6 },
  cell: { width: `${100 / 7}%`, height: 44, alignItems: "center", justifyContent: "center" },
  cellInRange: { backgroundColor: "#E6F9F7" },
  cellSelected: { backgroundColor: "#01BDA5", borderRadius: 100, width: 34, height: 34 },
  innerCircle: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  innerCircleSelected: { backgroundColor: "#01BDA5", borderRadius: 100 },
  cellDisabled: { opacity: 0.35 },
  cellText: { fontFamily: "Outfit_400Regular", fontSize: 14, color: "#000000" },
  cellTextSelected: { color: "#FFFFFF", fontFamily: "Outfit_600SemiBold" },
  cellTextDisabled: { color: "#9CA3AF" },
  dot: { position: "absolute", bottom: 4, width: 4, height: 4, borderRadius: 2, backgroundColor: "#EF4444" },
  legend: { flexDirection: "row", gap: 20, justifyContent: "center", marginTop: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontFamily: "Outfit_400Regular", fontSize: 12, color: "#6B7280" },
  closeBtn: { marginTop: 16, alignSelf: "center", paddingHorizontal: 32, paddingVertical: 10, backgroundColor: "#F5F5F5", borderRadius: 20 },
  closeTxt: { fontFamily: "Outfit_500Medium", fontSize: 14, color: "#000000" },
});
