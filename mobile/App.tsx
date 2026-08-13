import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useFonts, Outfit_300Light, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from "@expo-google-fonts/outfit";
import { Manrope_700Bold } from "@expo-google-fonts/manrope";
import { View, ActivityIndicator, Text, TextInput } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";
import RootNavigator from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { colors } from "./src/lib/tokens";

export default function App() {
  const [fontsLoaded] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Manrope_700Bold,
  });

  if (fontsLoaded) {
    const anyText = Text as any;
    anyText.defaultProps = anyText.defaultProps || {};
    anyText.defaultProps.style = [{ fontFamily: "Outfit_400Regular" }, anyText.defaultProps.style];

    const anyTextInput = TextInput as any;
    anyTextInput.defaultProps = anyTextInput.defaultProps || {};
    anyTextInput.defaultProps.style = [{ fontFamily: "Outfit_400Regular" }, anyTextInput.defaultProps.style];
  }

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
