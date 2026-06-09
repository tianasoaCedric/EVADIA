import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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
import ErrorBanner from "../../components/atoms/ErrorBanner";
import { Divider } from "../../components/atoms/Divider";
import { useAuth } from "../../context/AuthContext";

const oceanBg = require("../../assets/ocean.jpg");
const evadiaLogo = require("../../assets/evadia.png");
const googleIcon = require("../../assets/google-icon.png");

export default function LoginPage() {
  const { login } = useAuth();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Veuillez saisir votre email et mot de passe.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      // AuthContext met à jour state → _layout.tsx redirige automatiquement
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.email?.[0] ||
        "Identifiants incorrects.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: OAuth via useGoogleAuth (même pattern que mobile/)
  };

  const animate = (to: boolean) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setShowEmailForm(to);
      setError("");
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
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
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={{ opacity: fadeAnim, flex: 1, width: "100%" }}>
              {showEmailForm ? (
                /* ── FORMULAIRE EMAIL ── */
                <View className="flex-1 justify-center items-center px-6 pt-6 pb-20">
                  <TouchableOpacity
                    onPress={() => animate(false)}
                    className="absolute top-4 left-6 flex-row items-center gap-1.5"
                    style={{ zIndex: 10 }}
                  >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                    <Text className="text-white text-base font-semibold">Retour</Text>
                  </TouchableOpacity>

                  <View className="items-center mb-8 mt-4">
                    <Image source={evadiaLogo} className="w-60 h-28" resizeMode="contain" />
                    <Text
                      className="text-white text-center text-base mt-2 font-semibold tracking-wide"
                      style={{
                        textShadowColor: "rgba(0,0,0,0.4)",
                        textShadowOffset: { width: 1, height: 1 },
                        textShadowRadius: 3,
                      }}
                    >
                      Trouvez l'Hôtel parfait pour vous !
                    </Text>
                  </View>

                  <Text className="text-3xl font-bold text-center text-white mb-6">Connexion</Text>

                  {error ? <ErrorBanner message={error} /> : null}

                  <View style={{ width: 353, gap: 12, marginTop: 12 }}>
                    {/* Email */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 20,
                        gap: 14,
                        height: 46,
                        backgroundColor: "rgba(245,245,245,0.18)",
                        borderRadius: 50,
                      }}
                    >
                      <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.8)" />
                      <TextInput
                        placeholder="exemple@email.com"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={{ flex: 1, fontSize: 13, color: "#fff", paddingVertical: 0 }}
                      />
                    </View>

                    {/* Password */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 20,
                        gap: 14,
                        height: 46,
                        backgroundColor: "rgba(245,245,245,0.18)",
                        borderRadius: 50,
                      }}
                    >
                      <Ionicons name="shield-outline" size={20} color="rgba(255,255,255,0.8)" />
                      <TextInput
                        placeholder="votre mot de passe"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        style={{ flex: 1, fontSize: 13, color: "#fff", paddingVertical: 0 }}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                          name={showPassword ? "eye-off-outline" : "eye-outline"}
                          size={18}
                          color="rgba(255,255,255,0.8)"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Bouton connexion */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={handleLogin}
                      disabled={loading}
                      style={{
                        backgroundColor: "#01BDA5",
                        borderRadius: 25,
                        height: 38,
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>
                          Se connecter
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row justify-center mt-6">
                    <Text className="text-white/80">Vous n'avez pas encore de compte ? </Text>
                    <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                      <Text className="text-white font-semibold">S'inscrire</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* ── CHOIX (CARTE BLANCHE) ── */
                <View className="flex-1 justify-between">
                  <View className="items-center mt-10 flex-1 justify-center">
                    <Image source={evadiaLogo} className="w-64 h-32" resizeMode="contain" />
                    <Text
                      className="text-white text-lg mt-2 font-semibold text-center tracking-wide"
                      style={{
                        textShadowColor: "rgba(0,0,0,0.4)",
                        textShadowOffset: { width: 1, height: 1 },
                        textShadowRadius: 3,
                      }}
                    >
                      Trouvez l'Hôtel parfait pour vous !
                    </Text>
                  </View>

                  <View
                    style={{
                      width: 385,
                      borderRadius: 30,
                      backgroundColor: "#fff",
                      paddingTop: 32,
                      paddingBottom: 24,
                      paddingHorizontal: 16,
                      alignItems: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.2,
                      shadowRadius: 15,
                      elevation: 10,
                      alignSelf: "center",
                      marginBottom: Platform.OS === "ios" ? 35 : 45,
                    }}
                  >
                    <View style={{ width: 353, alignItems: "center" }}>
                      <TouchableOpacity
                        style={{
                          backgroundColor: "#01BDA5",
                          borderRadius: 25,
                          height: 38,
                          width: "100%",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        activeOpacity={0.85}
                        onPress={() => animate(true)}
                      >
                        <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>
                          Continuer avec votre Email
                        </Text>
                      </TouchableOpacity>

                      <View style={{ width: "100%" }}>
                        <Divider text="ou" />
                      </View>

                      <TouchableOpacity onPress={handleGoogleLogin} className="items-center justify-center">
                        <Image source={googleIcon} className="w-16 h-16" resizeMode="contain" />
                      </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-center mt-6">
                      <Text className="text-gray-600 text-sm">Vous n'avez pas de compte ? </Text>
                      <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                        <Text className="text-gray-800 font-bold text-sm">S'inscrire</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
