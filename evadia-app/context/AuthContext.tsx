import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { api, mobileAuthApi, TOKEN_KEY } from "../lib/api";

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
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!token) {
          setState({ status: "unauthenticated" });
          return;
        }
        const res = await mobileAuthApi.get("/auth/me");
        setState({ status: "authenticated", user: res.data.user ?? res.data, token });
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setState({ status: "unauthenticated" });
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    setState({ status: "loading" });
    try {
      const res = await mobileAuthApi.post("/auth/login", { email, password });
      const { user, token } = res.data;
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      setState({ status: "authenticated", user, token });
    } catch (err) {
      setState({ status: "unauthenticated" });
      throw err;
    }
  };

  const register = async (data: RegisterData) => {
    setState({ status: "loading" });
    try {
      const payload = { ...data, password_confirmation: data.password_confirmation ?? data.password };
      const res = await mobileAuthApi.post("/auth/register", payload);
      const { user, token } = res.data;
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      setState({ status: "authenticated", user, token });
    } catch (err) {
      setState({ status: "unauthenticated" });
      throw err;
    }
  };

  const loginWithToken = async () => {
    const res = await mobileAuthApi.get("/auth/me");
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    setState({ status: "authenticated", user: res.data.user ?? res.data, token: token! });
  };

  const logout = async () => {
    try {
      await mobileAuthApi.post("/auth/logout");
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
