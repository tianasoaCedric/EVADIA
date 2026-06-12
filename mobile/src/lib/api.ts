import axios from "axios";
import * as SecureStore from "expo-secure-store";

// En développement: remplace par l'IP de ton PC sur le réseau local
// Ex: http://192.168.1.10:8000 si le mobile est sur le même WiFi
// Pour l'émulateur Android: http://10.0.2.2:8000
export const API_BASE_URL = "http://192.168.100.225:8000";

export const TOKEN_KEY = "evadia_auth_token";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
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
