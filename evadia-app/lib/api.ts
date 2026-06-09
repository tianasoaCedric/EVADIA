import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://api.evadia.com";

export const TOKEN_KEY = "evadia_auth_token";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

// Injecte le token Bearer automatiquement sur chaque requête
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gère les 401 : token expiré → déconnexion automatique
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      router.replace("/(auth)/login");
    }
    return Promise.reject(error);
  }
);
