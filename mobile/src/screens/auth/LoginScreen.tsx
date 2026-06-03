import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import ErrorBanner from "../../components/atoms/ErrorBanner";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import GoogleIcon from "../../components/atoms/GoogleIcon";
import { useAuth } from "../../context/AuthContext";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";
import { s as sc, vs, ms } from "../../lib/scale";

export default function LoginScreen({ navigation }: any) {
  const { login, loginWithToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const { signInWithGoogle } = useGoogleAuth(
    () => loginWithToken(),
    (msg) => setError(msg)
  );

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
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

  return (
    <ImageBackground
      source={require("../../assets/images/image.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      {!showForm ? (
        <>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Trouvez l'Hotel parfait pour vous !</Text>
          </View>

          <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.emailButton}
                activeOpacity={0.85}
                onPress={() => setShowForm(true)}
              >
                <Text style={styles.emailButtonText}>Continuer avec votre Email</Text>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity style={styles.googleButton} activeOpacity={0.85} onPress={signInWithGoogle}>
                <GoogleIcon size={39} />
              </TouchableOpacity>

              <View style={styles.registerRow}>
                <Text style={styles.registerText}>Vous n'avez pas de compte ? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                  <Text style={styles.registerLink}>S'inscrire</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formLogoContainer}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.tagline}>Trouvez l'Hotel parfait pour vous !</Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Connexion</Text>

              {error ? <ErrorBanner message={error} /> : null}

              <View style={styles.fieldsContainer}>
                <View style={styles.inputRow}>
                  <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.8)" />
                  <TextInput
                    style={styles.input}
                    placeholder="Adresse Email"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputRow}>
                  <Ionicons name="shield-outline" size={20} color="rgba(255,255,255,0.8)" />
                  <TextInput
                    style={styles.input}
                    placeholder="Mot de passe"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color="rgba(255,255,255,0.8)"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.emailButton, { alignSelf: "stretch" }, loading && { opacity: 0.7 }]}
                  activeOpacity={0.85}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.emailButtonText}>Se connecter</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLineFull} />
                <Text style={styles.dividerTextWhite}>ou</Text>
                <View style={styles.dividerLineFull} />
              </View>

              <TouchableOpacity activeOpacity={0.85} onPress={signInWithGoogle}>
                <GoogleIcon size={39} />
              </TouchableOpacity>

              <Text style={styles.registerTextWhite}>
                Vous n'avez pas de compte ?{" "}
                <Text style={styles.registerLinkWhite} onPress={() => navigation.navigate("Register")}>
                  S'inscrire
                </Text>
              </Text>

              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Text style={styles.backText}>← Retour</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.25)" },
  safeArea: { position: "absolute", bottom: vs(40), left: 0, right: 0 },
  logoContainer: { position: "absolute", alignSelf: "center", top: vs(80), alignItems: "center" },
  logoImage: { width: sc(220), height: sc(220) },
  tagline: { fontFamily: "Outfit_300Light", fontSize: ms(14), color: "#FFFFFF", textAlign: "center", marginTop: vs(-60) },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: sc(15),
    marginHorizontal: sc(15),
    marginBottom: vs(24),
    paddingHorizontal: sc(15),
    paddingVertical: vs(24),
    gap: vs(15),
    alignItems: "center",
  },
  emailButton: {
    backgroundColor: "#01BDA5",
    borderRadius: sc(25),
    height: vs(46),
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: sc(12),
  },
  emailButtonText: { fontFamily: "Outfit_600SemiBold", fontSize: ms(14), lineHeight: ms(18), letterSpacing: 0.28, color: "#FFFFFF" },
  dividerRow: { flexDirection: "row", alignItems: "center", width: "100%", gap: sc(18) },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#888888" },
  dividerText: { fontFamily: "Outfit_300Light", fontSize: ms(13), color: "#888888" },
  googleButton: { alignItems: "center", justifyContent: "center" },
  registerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  registerText: { fontFamily: "Outfit_300Light", fontSize: ms(13), lineHeight: ms(16), color: "#000000" },
  registerLink: { fontFamily: "Outfit_700Bold", fontSize: ms(13), lineHeight: ms(16), color: "#000000" },
  formLogoContainer: { alignItems: "center", marginTop: vs(80) },
  formCard: {
    marginHorizontal: sc(20),
    marginBottom: vs(40),
    borderRadius: sc(15),
    paddingHorizontal: sc(15),
    paddingVertical: vs(24),
    gap: vs(20),
    alignItems: "center",
  },
  formTitle: { fontFamily: "Outfit_600SemiBold", fontSize: ms(30), lineHeight: ms(38), color: "#FFFFFF", textAlign: "center" },
  fieldsContainer: { width: "100%", gap: vs(12) },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: sc(20),
    gap: sc(14),
    width: "100%",
    height: vs(46),
    backgroundColor: "rgba(245, 245, 245, 0.18)",
    borderRadius: sc(50),
  },
  input: { flex: 1, fontFamily: "Outfit_300Light", fontSize: ms(13), color: "#FFFFFF", paddingVertical: 0 },
  dividerLineFull: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.5)" },
  dividerTextWhite: { fontFamily: "Outfit_300Light", fontSize: ms(13), color: "#FFFFFF" },
  registerTextWhite: { fontFamily: "Outfit_300Light", fontSize: ms(13), lineHeight: ms(16), color: "#FFFFFF" },
  registerLinkWhite: { fontFamily: "Outfit_700Bold", fontSize: ms(13), lineHeight: ms(16), color: "#FFFFFF" },
  backText: { fontFamily: "Outfit_300Light", fontSize: ms(13), color: "rgba(255,255,255,0.7)", textAlign: "center" },
});
