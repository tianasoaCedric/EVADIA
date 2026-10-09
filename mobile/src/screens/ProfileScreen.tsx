import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import type { ProfileStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<ProfileStackParamList, "ProfileHome">;

type RowProps =
  | { label: string; value: string; chevron?: false; onPress?: () => void }
  | { label: string; value?: never; chevron: true; onPress?: () => void };

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function MenuRow({ label, value, chevron, onPress }: RowProps) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onPress}>
      <Text style={styles.rowLabel}>{label}</Text>
      {chevron ? (
        <Ionicons name="chevron-back" size={10} color="#8A8A8A" style={{ transform: [{ scaleX: -1 }] }} />
      ) : (
        <Text style={styles.rowValue}>{value}</Text>
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { state, logout } = useAuth();
  const user = state.status === "authenticated" ? state.user : null;
  const avatarUrl = user ? (user as any).avatar_url : null;
  const fullName = user ? `${user.prenom} ${user.nom}` : "";
  const email = user?.email ?? "";
  const initials = user
    ? `${user.prenom?.[0] ?? ""}${user.nom?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* HEAD */}
        <View style={styles.head}>
          {/* Avatar */}
          <View style={styles.avatarOuter}>
            <View style={styles.avatarInner}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Nom + email */}
          <View style={styles.nameBlock}>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.email}>{email}</Text>
          </View>

          {/* Bouton modifier */}
          <TouchableOpacity style={styles.editBtn} activeOpacity={0.85}>
            <Text style={styles.editBtnText}>Modifier le profil</Text>
          </TouchableOpacity>
        </View>

        {/* MENU */}
        <View style={styles.menuContainer}>

          <SectionLabel title="Réservations" />
          <MenuRow label="Mes réservations" chevron onPress={() => navigation.navigate("Reservations")} />

          <SectionLabel title="Paiement" />
          <MenuRow label="Informations de paiement" chevron />

          <SectionLabel title="Paramètres" />
          <MenuRow label="Devise" value="Ariary" />
          <MenuRow label="Langage" value="Francais" />
          <MenuRow label="Notifications" value="Desactiver" />

          <SectionLabel title="Support" />
          <MenuRow label="Contact" chevron />

          <SectionLabel title="Application" />
          <MenuRow label="Version" value="V1.00" />

          {/* Bouton déconnexion */}
          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.85} onPress={() => logout()}>
            <Text style={styles.logoutText}>Se Déconnecter</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  // HEAD
  head: {
    backgroundColor: "#FFFFFF",
    paddingTop: 61,
    paddingHorizontal: 20,
    paddingBottom: 21,
    gap: 16,
    alignItems: "center",
    minHeight: 283,
    justifyContent: "flex-end",
  },
  avatarOuter: {
    width: 85,
    height: 85,
  },
  avatarInner: {
    width: 84,
    height: 85,
    backgroundColor: "#F5F5F5",
    borderRadius: 64,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 84,
    height: 85,
    resizeMode: "cover",
  },
  avatarFallback: {
    width: 84,
    height: 85,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 28,
    color: "#8A8A8A",
  },
  nameBlock: {
    alignItems: "center",
    gap: 2,
  },
  name: {
    fontFamily: "Outfit_400Regular",
    fontSize: 20,
    lineHeight: 23,
    letterSpacing: 0.4,
    color: "#000000",
  },
  email: {
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
    lineHeight: 23,
    letterSpacing: 0.28,
    color: "#7E7E7E",
  },
  editBtn: {
    backgroundColor: "#01BDA5",
    borderRadius: 25,
    height: 38,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  editBtnText: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.28,
    color: "#FFFFFF",
  },

  // MENU
  menuContainer: {
    marginTop: 9,
    paddingHorizontal: 20,
    gap: 15,
  },
  sectionLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.28,
    color: "#000000",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: 38,
    backgroundColor: "#F5F5F5",
    borderRadius: 40,
  },
  rowLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.28,
    color: "#464646",
  },
  rowValue: {
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.28,
    color: "#8A8A8A",
  },
  logoutBtn: {
    backgroundColor: "#FF4E52",
    borderRadius: 25,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.28,
    color: "#FFFFFF",
  },
});
