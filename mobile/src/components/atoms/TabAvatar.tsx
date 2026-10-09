import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function TabAvatar({ focused }: { focused: boolean }) {
  const { state } = useAuth();

  const borderColor = focused ? "#01BDA5" : "transparent";

  if (state.status !== "authenticated") {
    return <View style={[styles.circle, { borderColor }]} />;
  }

  const { user } = state;
  const avatarUrl = (user as any).avatar_url;

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={[styles.circle, styles.image, { borderColor }]}
      />
    );
  }

  const initials = `${user.prenom?.[0] ?? ""}${user.nom?.[0] ?? ""}`.toUpperCase();

  return (
    <View style={[styles.circle, styles.initialsBox, { borderColor, backgroundColor: focused ? "#01BDA5" : "#E0E0E0" }]}>
      <Text style={[styles.initials, { color: focused ? "#fff" : "#555" }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
  image: {
    resizeMode: "cover",
  },
  initialsBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 11,
  },
});
