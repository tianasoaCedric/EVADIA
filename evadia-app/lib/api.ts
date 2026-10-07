import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://api.evadia.com";

const MOBILE_API_KEY = process.env.EXPO_PUBLIC_MOBILE_API_KEY ?? "";
console.log('[API] MOBILE_API_KEY present:', !!MOBILE_API_KEY, 'length:', MOBILE_API_KEY.length);

export const TOKEN_KEY = "evadia_auth_token";

// Headers communs à toutes les instances
const commonHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "X-Mobile-Api-Key": MOBILE_API_KEY,
};

// ─── Instance auth mobile (/api/mobile/auth/*) ────────────────────────────────
// Retourne { user, token } — Bearer token, pas de cookie
export const mobileAuthApi = axios.create({
  baseURL: `${API_BASE_URL}/api/mobile`,
  headers: commonHeaders,
  timeout: 10000,
});

// ─── Instance API générale (/api/*) ───────────────────────────────────────────
// Pour toutes les routes Laravel : /client/*, /hotels, /destinations, etc.
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: commonHeaders,
  timeout: 10000,
});

// Token gardé en mémoire pour éviter toute course avec SecureStore (écriture async)
let inMemoryToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  inMemoryToken = token;
};

// Injecte le token Bearer automatiquement sur les deux instances.
// Priorité au token en mémoire (dispo immédiatement après login),
// fallback sur SecureStore (au démarrage de l'app).
const injectToken = async (config: any) => {
  const token = inMemoryToken ?? (await SecureStore.getItemAsync(TOKEN_KEY));
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

mobileAuthApi.interceptors.request.use(injectToken);
api.interceptors.request.use(injectToken);

// AuthContext s'abonne ici pour repasser en "unauthenticated" sur un 401 :
// sans ça, la garde de routes renverrait sur l'accueil avec une session morte.
type UnauthorizedListener = (error: any) => void;
let onUnauthorized: UnauthorizedListener | null = null;
export const setOnUnauthorized = (listener: UnauthorizedListener | null) => {
  onUnauthorized = listener;
};

// Gère les 401 : token expiré ou compte désactivé → déconnexion automatique.
// Les échecs de /auth/login et /auth/register (identifiants faux) restent à l'écran.
const handle401 = async (error: any) => {
  const url: string = error.config?.url ?? "";
  const isAuthAttempt = /\/auth\/(login|register)$/.test(url);
  if (error.response?.status === 401 && !isAuthAttempt) {
    inMemoryToken = null;
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    if (onUnauthorized) onUnauthorized(error);
    else router.replace("/(auth)/login");
  }
  return Promise.reject(error);
};

mobileAuthApi.interceptors.response.use((r) => r, handle401);
api.interceptors.response.use((r) => r, handle401);
