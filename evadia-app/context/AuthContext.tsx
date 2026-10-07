import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { mobileAuthApi, TOKEN_KEY, setAuthToken, setOnUnauthorized } from "../lib/api";
import { getErrorMessage, errorStatus } from "../lib/parseError";

export type User = {
  id: number;
  name?: string;
  nom?: string;
  prenom?: string;
  email: string;
  est_actif?: boolean;
  roles?: { id: number; code: string; nom: string; niveau: number }[];
};

type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: User; token: string };

type RegisterData = {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  password_confirmation?: string;
};

type AuthContextType = {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithToken: () => Promise<void>;
  logout: () => Promise<void>;
  /** Raison de la dernière déconnexion forcée (session expirée, compte désactivé…), affichée sur l'écran de connexion. */
  notice: string | null;
  clearNotice: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });
  const [notice, setNotice] = useState<string | null>(null);

  // 401 sur n'importe quel appel : lib/api a déjà effacé le token.
  useEffect(() => {
    setOnUnauthorized((error) => {
      setNotice(getErrorMessage(error));
      setState({ status: "unauthenticated" });
    });
    return () => setOnUnauthorized(null);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!token) {
          setState({ status: "unauthenticated" });
          return;
        }
        setAuthToken(token);
        const res = await mobileAuthApi.get("/auth/me");
        setState({ status: "authenticated", user: res.data.user ?? res.data, token });
      } catch (err) {
        // 401 : token invalide, déjà effacé par lib/api. Sinon (réseau, serveur),
        // on garde le token pour que la session revienne au prochain lancement.
        if (errorStatus(err) !== 401) setNotice(getErrorMessage(err));
        setAuthToken(null);
        setState({ status: "unauthenticated" });
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await mobileAuthApi.post("/auth/login", { email, password });
      const { user, token } = res.data;
      setAuthToken(token);
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      setNotice(null);
      setState({ status: "authenticated", user, token });
    } catch (err) {
      setState({ status: "unauthenticated" });
      throw err;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const payload = { ...data, password_confirmation: data.password_confirmation ?? data.password };
      const res = await mobileAuthApi.post("/auth/register", payload);
      const { user, token } = res.data;
      setAuthToken(token);
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      setNotice(null);
      setState({ status: "authenticated", user, token });
    } catch (err) {
      setState({ status: "unauthenticated" });
      throw err;
    }
  };

  const loginWithToken = async () => {
    const res = await mobileAuthApi.get("/auth/me");
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    setNotice(null);
    setState({ status: "authenticated", user: res.data.user ?? res.data, token: token! });
  };

  const logout = async () => {
    try {
      await mobileAuthApi.post("/auth/logout");
    } catch {}
    setAuthToken(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setState({ status: "unauthenticated" });
  };

  return (
    <AuthContext.Provider
      value={{ state, login, register, loginWithToken, logout, notice, clearNotice: () => setNotice(null) }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
