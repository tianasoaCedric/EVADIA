import { Stack, router, useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import "../global.css";
import { AuthProvider, useAuth } from "../context/AuthContext";

function RootNavigator() {
  const { state } = useAuth();
  const segments = useSegments();
  const isNavigating = useRef(false);

  useEffect(() => {
    if (state.status === "loading") return;
    if (isNavigating.current) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inAppGroup = segments[0] === "(app)";

    if (state.status === "authenticated" && inAuthGroup) {
      isNavigating.current = true;
      router.replace("/(app)/home");
    } else if (state.status === "unauthenticated" && inAppGroup) {
      isNavigating.current = true;
      router.replace("/(auth)/login");
    } else {
      isNavigating.current = false;
    }
  }, [state.status, segments]);

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
