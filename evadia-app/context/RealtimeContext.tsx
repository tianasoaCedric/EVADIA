import React, { createContext, useContext } from "react";
import type Echo from "laravel-echo";
import { useAuth } from "./AuthContext";
import { useReverbEcho } from "../hooks/useReverbEcho";

type RealtimeContextValue = {
  /** Connexion Reverb partagée, ou null (pas connecté / WebSocket indisponible → polling). */
  echo: Echo<"reverb"> | null;
  userId: number | null;
};

const RealtimeContext = createContext<RealtimeContextValue>({ echo: null, userId: null });

/**
 * Une seule connexion WebSocket pour toute l'app (comme NotificationsContext côté web).
 * Les écrans écoutent le canal privé `messages.{userId}` avec listen / stopListening,
 * sans le quitter : c'est ce provider qui ferme la connexion (déconnexion, changement de compte).
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();
  const userId = state.status === "authenticated" ? state.user.id : null;
  const echo = useReverbEcho(userId !== null, userId ?? undefined);

  return <RealtimeContext.Provider value={{ echo, userId }}>{children}</RealtimeContext.Provider>;
}

export const useRealtime = () => useContext(RealtimeContext);
