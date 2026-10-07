import { useEffect, useRef, useState } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js/react-native";
import { api, API_BASE_URL } from "../lib/api";

// laravel-echo attend Pusher sur l'objet global
(globalThis as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;

// Le token broadcasting n'est jamais persisté (ni SecureStore ni AsyncStorage) : il vit en
// mémoire le temps de la connexion et est renouvelé avant son expiration
// (courte durée, ability restreinte à "broadcasting" — voir BroadcastingTokenController).
const REFRESH_MARGIN_MS = 60_000;

type BroadcastingToken = { token: string; expires_at: string; reverb_key?: string };

const apiUrl = new URL(API_BASE_URL);
const secure = apiUrl.protocol === "https:";
const port = apiUrl.port ? Number(apiUrl.port) : secure ? 443 : 80;

/**
 * Connexion WebSocket Reverb (même mécanisme que frontend/hooks/useReverbEcho.ts).
 * Ne se connecte que si `enabled` est vrai, c'est-à-dire un utilisateur authentifié.
 * Renvoie null tant que la connexion n'est pas prête : l'appelant retombe alors sur le polling.
 */
export function useReverbEcho(enabled: boolean, userId?: number): Echo<"reverb"> | null {
  const [echo, setEcho] = useState<Echo<"reverb"> | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const echoRef = useRef<Echo<"reverb"> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const connect = async () => {
      try {
        const res = await api.post<BroadcastingToken>("/client/broadcasting-token");
        const { token, expires_at, reverb_key } = res.data;
        if (cancelled) return;

        // Clé fournie par l'API ; la variable d'environnement n'est qu'un repli.
        const key = reverb_key || process.env.EXPO_PUBLIC_REVERB_APP_KEY;
        if (!key) return;

        echoRef.current?.disconnect();

        const instance = new Echo({
          broadcaster: "reverb",
          key,
          wsHost: apiUrl.hostname,
          wsPort: port,
          wssPort: port,
          forceTLS: secure,
          enabledTransports: ["ws", "wss"],
          // Pas de wsPath : pusher-js ajoute déjà « /app/<clé> », servi par nginx → Reverb.
          authEndpoint: `${API_BASE_URL}/api/broadcasting/auth`,
          auth: {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        });

        echoRef.current = instance;
        setEcho(instance);

        const msUntilRefresh = new Date(expires_at).getTime() - Date.now() - REFRESH_MARGIN_MS;
        refreshTimer.current = setTimeout(connect, Math.max(msUntilRefresh, 5_000));
      } catch {
        // Silencieux : les écrans retombent sur le polling REST.
      }
    };

    connect();

    return () => {
      cancelled = true;
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      echoRef.current?.disconnect();
      echoRef.current = null;
      // Déconnexion / changement de compte : ne plus exposer l'ancienne instance
      setEcho(null);
    };
  }, [enabled, userId]);

  return echo;
}
