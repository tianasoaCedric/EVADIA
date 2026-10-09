import axios from "axios";
import * as SecureStore from "expo-secure-store";

// En développement: remplace par l'IP de ton PC sur le réseau local
// Ex: http://192.168.1.10:8000 si le mobile est sur le même WiFi
// Pour l'émulateur Android: http://10.0.2.2:8000
export const API_BASE_URL = "http://192.168.100.225:8000";

// Identifie l'app mobile auprès de nginx pour router /api/client/* directement
// vers Laravel (Bearer token) plutôt que vers le proxy web (cookie httpOnly).
// Ce n'est pas un secret d'authentification utilisateur — juste un identifiant d'app.
const MOBILE_API_KEY = "312455a834e758c0d97c8112aabcebd6a83ff738a4bba54d8a272b00378bfad3";

export const TOKEN_KEY = "evadia_auth_token";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Mobile-Api-Key": MOBILE_API_KEY,
  },
  timeout: 8000,
});

// Injecte le token Bearer automatiquement sur chaque requête
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
