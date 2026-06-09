import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  StyleSheet,
  TextInput,
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

      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.tagline}>Trouvez l'Hotel parfait pour vous !</Text>
      </View>

      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.card}>
            {!showForm ? (
              <>
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
              </>
            ) : (
              <>
                <Text style={styles.formTitle}>Connexion</Text>

                {error ? <ErrorBanner message={error} /> : null}

                <View style={styles.fieldsContainer}>
                  <View style={styles.inputRow}>
                    <Ionicons name="mail-outline" size={20} color="#626262" />
                    <TextInput
                      style={styles.input}
                      placeholder="Adresse Email"
                      placeholderTextColor="#999"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <Ionicons name="shield-outline" size={20} color="#626262" />
                    <TextInput
                      style={styles.input}
                      placeholder="Mot de passe"
                      placeholderTextColor="#999"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={18}
                        color="#626262"
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.emailButton, loading && { opacity: 0.7 }]}
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

                  <TouchableOpacity onPress={() => setShowForm(false)}>
                    <Text style={styles.backText}>← Retour</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.registerRow}>
                  <Text style={styles.registerText}>Vous n'avez pas de compte ? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                    <Text style={styles.registerLink}>S'inscrire</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  safeArea: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
  },
  logoContainer: {
    position: "absolute",
    alignSelf: "center",
    top: 80,
    alignItems: "center",
  },
  logoImage: {
    width: 220,
    height: 220,
  },
  tagline: {
    fontFamily: "Outfit_300Light",
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: -60,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 24,
    paddingHorizontal: 15,
    paddingVertical: 24,
    gap: 15,
    alignItems: "center",
  },
  formTitle: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 22,
    color: "#000",
    alignSelf: "flex-start",
  },
  fieldsContainer: {
    width: "100%",
    gap: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
    height: 46,
    backgroundColor: "#F5F5F5",
    borderRadius: 50,
  },
  input: {
    flex: 1,
    fontFamily: "Outfit_300Light",
    fontSize: 13,
    color: "#000",
    paddingVertical: 0,
  },
  emailButton: {
    backgroundColor: "#01BDA5",
    borderRadius: 25,
    height: 38,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  emailButtonText: {
    fontFamily: "Outfit_600SemiBold",
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.28,
    color: "#FFFFFF",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#888888",
  },
  dividerText: {
    fontFamily: "Outfit_300Light",
    fontSize: 13,
    color: "#888888",
  },
  googleButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  registerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  registerText: {
    fontFamily: "Outfit_300Light",
    fontSize: 13,
    lineHeight: 16,
    color: "#000000",
  },
  registerLink: {
    fontFamily: "Outfit_700Bold",
    fontSize: 13,
    lineHeight: 16,
    color: "#000000",
  },
  backText: {
    fontFamily: "Outfit_300Light",
    fontSize: 13,
    color: "#626262",
    textAlign: "center",
  },
});
