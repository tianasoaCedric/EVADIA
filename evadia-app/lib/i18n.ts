import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as SecureStore from "expo-secure-store";
import fr from "../locales/fr.json";
import en from "../locales/en.json";

export const LANG_KEY = "selectedLang";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources: {
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: "fr",
  fallbackLng: "fr",
  interpolation: { escapeValue: false },
});

export async function loadPersistedLanguage(): Promise<void> {
  const stored = await SecureStore.getItemAsync(LANG_KEY);
  if (stored === "fr" || stored === "en") {
    await i18n.changeLanguage(stored);
  }
}

export async function setLanguage(lang: "fr" | "en"): Promise<void> {
  await i18n.changeLanguage(lang);
  await SecureStore.setItemAsync(LANG_KEY, lang);
}

export default i18n;
