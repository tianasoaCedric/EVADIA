import { useEffect, useRef, useState } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js/react-native";
import { API_BASE_URL } from "../lib/api";
import { broadcastingApi } from "../lib/chatbox";

// @ts-expect-error laravel-echo attend Pusher sur global
global.Pusher = Pusher;

const REFRESH_MARGIN_MS = 60_000;

const apiUrl = new URL(API_BASE_URL);

/**
 * Connexion WebSocket Reverb pour la messagerie temps réel. Le token utilisé
 * est un jeton Sanctum à courte durée de vie (ability "broadcasting" only),
 * distinct du token de session principal stocké en SecureStore — même
 * mécanisme de moindre privilège que la version web.
 */
export function useReverbEcho(enabled: boolean): Echo<"reverb"> | null {
  const [echo, setEcho] = useState<Echo<"reverb"> | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const echoRef = useRef<Echo<"reverb"> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const connect = async () => {
      try {
        const { token, expires_at } = await broadcastingApi.issueToken();
        if (cancelled) return;

        echoRef.current?.disconnect();

        const instance = new Echo({
          broadcaster: "reverb",
          key: process.env.EXPO_PUBLIC_REVERB_APP_KEY,
          wsHost: apiUrl.hostname,
          wsPort: 80,
          wssPort: 443,
          forceTLS: apiUrl.protocol === "https:",
          enabledTransports: ["ws", "wss"],
          wsPath: "/app",
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
        // Silencieux : l'écran de conversation retombe sur le polling.
      }
    };

    connect();

    return () => {
      cancelled = true;
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      echoRef.current?.disconnect();
      echoRef.current = null;
    };
  }, [enabled]);

  return echo;
}
