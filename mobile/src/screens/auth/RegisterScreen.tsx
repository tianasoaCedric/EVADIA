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
import { Ionicons } from "@expo/vector-icons";
import GoogleIcon from "../../components/atoms/GoogleIcon";
import ErrorBanner from "../../components/atoms/ErrorBanner";
import { useAuth } from "../../context/AuthContext";
import { s as sc, vs, ms } from "../../lib/scale";

export default function RegisterScreen({ navigation }: any) {
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
      await register({
        nom,
        prenom,
        email,
        password,
        password_confirmation: password,
      });
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

  return (
    <ImageBackground
      source={require("../../assets/images/image.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Trouvez l'Hotel parfait pour vous !</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>S'inscrire</Text>

            {error ? <ErrorBanner message={error} /> : null}

            <View style={styles.fieldsContainer}>
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.8)" />
                <TextInput
                  style={styles.input}
                  placeholder="Entrez votre Nom"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={nom}
                  onChangeText={setNom}
                />
              </View>

              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.8)" />
                <TextInput
                  style={styles.input}
                  placeholder="Entrez votre Prenom"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={prenom}
                  onChangeText={setPrenom}
                />
              </View>

              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.8)" />
                <TextInput
                  style={styles.input}
                  placeholder="Entrez votre Adresse Email"
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
                  placeholder="Entrez votre mot de passe"
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
                style={[styles.registerButton, loading && { opacity: 0.7 }]}
                activeOpacity={0.85}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.registerButtonText}>S'inscrire</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity>
              <GoogleIcon size={39} />
            </TouchableOpacity>

            <Text style={styles.loginText}>
              Vous avez deja un compte ?{" "}
              <Text style={styles.loginLink} onPress={() => navigation?.goBack()}>
                Se connecter
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.25)" },
  logoContainer: { alignItems: "center", marginTop: vs(80) },
  logoImage: { width: sc(220), height: sc(220) },
  tagline: { fontFamily: "Outfit_300Light", fontSize: ms(14), color: "#FFFFFF", textAlign: "center", marginTop: vs(-60) },
  card: {
    marginHorizontal: sc(20),
    marginBottom: vs(40),
    borderRadius: sc(15),
    paddingHorizontal: sc(15),
    paddingVertical: vs(24),
    gap: vs(20),
    alignItems: "center",
  },
  title: { fontFamily: "Outfit_600SemiBold", fontSize: ms(30), lineHeight: ms(38), color: "#FFFFFF", textAlign: "center" },
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
  registerButton: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: vs(46),
    backgroundColor: "#01BDA5",
    borderRadius: sc(25),
    marginTop: vs(4),
  },
  registerButtonText: { fontFamily: "Outfit_600SemiBold", fontSize: ms(14), lineHeight: ms(18), letterSpacing: 0.28, color: "#FFFFFF" },
  dividerRow: { flexDirection: "row", alignItems: "center", width: "100%", gap: sc(18) },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.5)" },
  dividerText: { fontFamily: "Outfit_300Light", fontSize: ms(13), color: "#FFFFFF" },
  loginText: { fontFamily: "Outfit_300Light", fontSize: ms(13), lineHeight: ms(16), color: "#FFFFFF" },
  loginLink: { fontFamily: "Outfit_700Bold", fontSize: ms(13), lineHeight: ms(16), color: "#FFFFFF" },
});
