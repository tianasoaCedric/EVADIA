import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { api, TOKEN_KEY } from "../lib/api";

type User = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  est_actif: boolean;
  roles: { id: number; code: string; nom: string; niveau: number }[];
};

type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: User; token: string };

type AuthContextType = {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithToken: () => Promise<void>;
  logout: () => Promise<void>;
};

type RegisterData = {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  password_confirmation: string;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  // Au démarrage : vérifier si un token valide existe en SecureStore
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!token) {
          setState({ status: "unauthenticated" });
          return;
        }
        // Valider le token auprès du backend
        const res = await api.get("/auth/me");
        setState({ status: "authenticated", user: res.data.user, token });
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setState({ status: "unauthenticated" });
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    const { user, token } = res.data;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setState({ status: "authenticated", user, token });
  };

  const register = async (data: RegisterData) => {
    const res = await api.post("/auth/register", data);
    const { user, token } = res.data;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setState({ status: "authenticated", user, token });
  };

  // Appelé après un OAuth (token déjà dans SecureStore)
  const loginWithToken = async () => {
    const res = await api.get("/auth/me");
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    setState({ status: "authenticated", user: res.data.user, token: token! });
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setState({ status: "unauthenticated" });
  };

  return (
    <AuthContext.Provider value={{ state, login, register, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
