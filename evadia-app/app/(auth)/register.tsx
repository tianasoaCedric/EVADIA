import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ErrorBanner from "../../components/atoms/ErrorBanner";
import { useAuth } from "../../context/AuthContext";

const oceanBg = require("../../assets/ocean.jpg");
const evadiaLogo = require("../../assets/evadia.png");
const googleIcon = require("../../assets/google-icon.png");

export default function RegisterScreen() {
  const { register } = useAuth();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    if (!nom || !prenom || !email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setLoading(true);
    try {
      await register({ nom, prenom, email, password, password_confirmation: password });
      // AuthContext met à jour state → _layout.tsx redirige automatiquement
    } catch (err: any) {
      const errors = err?.response?.data?.errors;
      const msg = errors
        ? Object.values(errors).flat().join("\n")
        : err?.response?.data?.message || "Une erreur est survenue.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    gap: 14,
    height: 46,
    backgroundColor: "rgba(245,245,245,0.18)",
    borderRadius: 50,
  };

  return (
    <ImageBackground source={oceanBg} className="flex-1" imageStyle={{ resizeMode: "cover" }}>
      <View className="absolute inset-0 bg-black/25" />
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="items-center pt-10 pb-8 px-6">
              <Image source={evadiaLogo} className="w-60 h-32" resizeMode="contain" />
              <Text className="text-white/90 text-center text-base font-semibold" style={{ marginTop: -40 }}>
                Trouvez l'hôtel parfait pour vous !
              </Text>

              <Text className="text-3xl font-bold text-white text-center mt-6 mb-4">S'inscrire</Text>

              {error ? <ErrorBanner message={error} /> : null}

              <View style={{ width: 353, gap: 12, marginTop: 12 }}>
                <View style={inputStyle}>
                  <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.8)" />
                  <TextInput placeholder="Entrez votre Nom" placeholderTextColor="rgba(255,255,255,0.6)" value={nom} onChangeText={setNom} style={{ flex: 1, fontSize: 13, color: "#fff", paddingVertical: 0 }} />
                </View>

                <View style={inputStyle}>
                  <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.8)" />
                  <TextInput placeholder="Entrez votre Prénom" placeholderTextColor="rgba(255,255,255,0.6)" value={prenom} onChangeText={setPrenom} style={{ flex: 1, fontSize: 13, color: "#fff", paddingVertical: 0 }} />
                </View>

                <View style={inputStyle}>
                  <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.8)" />
                  <TextInput placeholder="Entrez votre Adresse Email" placeholderTextColor="rgba(255,255,255,0.6)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={{ flex: 1, fontSize: 13, color: "#fff", paddingVertical: 0 }} />
                </View>

                <View style={inputStyle}>
                  <Ionicons name="shield-outline" size={20} color="rgba(255,255,255,0.8)" />
                  <TextInput placeholder="Entrez votre mot de passe" placeholderTextColor="rgba(255,255,255,0.6)" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} style={{ flex: 1, fontSize: 13, color: "#fff", paddingVertical: 0 }} />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="rgba(255,255,255,0.8)" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleRegister}
                  disabled={loading}
                  style={{ backgroundColor: "#01BDA5", borderRadius: 25, height: 38, alignItems: "center", justifyContent: "center", opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>S'inscrire</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center w-[353px] my-6">
                <View className="flex-1 h-px bg-white/50" />
                <Text className="mx-4 text-white/80 text-sm">OU</Text>
                <View className="flex-1 h-px bg-white/50" />
              </View>

              <TouchableOpacity className="items-center justify-center">
                <Image source={googleIcon} className="w-20 h-20" resizeMode="contain" />
              </TouchableOpacity>

              <View className="flex-row justify-center mt-6 mb-10">
                <Text className="text-white/80">Vous avez déjà un compte ? </Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                  <Text className="text-white font-semibold">Se connecter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
