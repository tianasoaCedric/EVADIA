import { Stack, router, useSegments } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Outfit_100Thin,
  Outfit_200ExtraLight,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black,
} from "@expo-google-fonts/outfit";
import {
  Manrope_200ExtraLight,
  Manrope_300Light,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import "../global.css";
import "../lib/i18n";
import { loadPersistedLanguage } from "../lib/i18n";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { DeviseProvider } from "../context/DeviseContext";
import { RealtimeProvider } from "../context/RealtimeContext";
import { usePushNotifications } from "../hooks/usePushNotifications";
import IntroAnimation from "../components/IntroAnimation";

SplashScreen.preventAutoHideAsync().catch(() => {});

// Applique Outfit_400Regular par défaut à tout <Text>/<TextInput> qui ne
// précise pas de fontFamily, sans avoir à retoucher chaque écran existant.
const defaultTextStyle = { fontFamily: "Outfit_400Regular" };
(Text as any).defaultProps = { ...(Text as any).defaultProps, style: [defaultTextStyle, (Text as any).defaultProps?.style] };
(TextInput as any).defaultProps = { ...(TextInput as any).defaultProps, style: [defaultTextStyle, (TextInput as any).defaultProps?.style] };

function RootNavigator() {
  const { state } = useAuth();
  const segments = useSegments();
  const isNavigating = useRef(false);
  const [showIntro, setShowIntro] = useState(true);

  usePushNotifications(state.status === "authenticated");

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

  return (
    <>
      {state.status === "loading" ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#01BDA5" />
        </View>
      ) : (
        <AppStack />
      )}
      {/* Intro posée par-dessus la navigation : l'app se charge en dessous */}
      {showIntro && (
        <IntroAnimation ready={state.status !== "loading"} onDone={() => setShowIntro(false)} />
      )}
    </>
  );
}

function AppStack() {
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
  const [fontsLoaded] = useFonts({
    Outfit_100Thin,
    Outfit_200ExtraLight,
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
    Manrope_200ExtraLight,
    Manrope_300Light,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  const [langLoaded, setLangLoaded] = useState(false);

  useEffect(() => {
    loadPersistedLanguage().finally(() => setLangLoaded(true));
  }, []);

  const ready = fontsLoaded && langLoaded;

  const onLayoutRootView = useCallback(async () => {
    if (ready) {
      await SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <AuthProvider>
      <RealtimeProvider>
        <DeviseProvider>
          <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <RootNavigator />
          </View>
        </DeviseProvider>
      </RealtimeProvider>
    </AuthProvider>
  );
}
