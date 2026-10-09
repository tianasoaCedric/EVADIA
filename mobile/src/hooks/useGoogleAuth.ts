import { useEffect, useCallback } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL, TOKEN_KEY } from "../lib/api";

WebBrowser.maybeCompleteAuthSession();

type OnSuccess = () => void;
type OnError = (msg: string) => void;

export function useGoogleAuth(onSuccess: OnSuccess, onError: OnError) {
  // Écoute le deep link evadia://auth/callback?token=xxx
  const handleDeepLink = useCallback(
    async (event: { url: string }) => {
      const { url } = event;
      if (!url.startsWith("evadia://auth/callback")) return;

      const parsed = Linking.parse(url);
      const token = parsed.queryParams?.token as string | undefined;

      if (!token) {
        onError("Token manquant dans le callback Google.");
        return;
      }

      await SecureStore.setItemAsync(TOKEN_KEY, token);
      onSuccess();
    },
    [onSuccess, onError]
  );

  useEffect(() => {
    const sub = Linking.addEventListener("url", handleDeepLink);
    return () => sub.remove();
  }, [handleDeepLink]);

  const signInWithGoogle = useCallback(async () => {
    try {
      const url = `${API_BASE_URL}/api/auth/google?platform=mobile`;
      await WebBrowser.openBrowserAsync(url);
      // Le deep link sera capturé par handleDeepLink ci-dessus
    } catch {
      onError("Impossible d'ouvrir le navigateur Google.");
    }
  }, [onError]);

  return { signInWithGoogle };
}
