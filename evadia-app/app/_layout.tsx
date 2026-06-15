import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "../global.css";
import { AuthProvider, useAuth } from "../context/AuthContext";

function RootNavigator() {
  const { state } = useAuth();

  useEffect(() => {
    if (state.status === "authenticated") {
      router.replace("/(app)/home");
    } else if (state.status === "unauthenticated") {
      router.replace("/(auth)/login");
    }
  }, [state.status]);

  if (state.status === "loading") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#01BDA5" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen
        name="detail-offers"
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="contact"
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
