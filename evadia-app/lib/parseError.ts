import { Alert } from "react-native";
import i18n from "./i18n";

const t = (key: string, opts?: Record<string, unknown>) => i18n.t(key, opts) as string;

/**
 * Cas d'erreur qu'un écran peut personnaliser :
 * - un code HTTP (401, 404, 409, 422…)
 * - "network" : serveur injoignable (pas de réseau, mauvaise IP, backend éteint)
 * - "timeout" : le serveur n'a pas répondu à temps
 * - "default" : tout ce qui n'a pas de message dédié
 *
 * La valeur peut être une fonction qui reçoit le message renvoyé par Laravel,
 * pour les erreurs métier dont le texte serveur est déjà précis (dates, pause…).
 */
type ErrorCase = number | "network" | "timeout" | "default";
type Message = string | ((serverMessage?: string) => string);
export type ErrorOverrides = Partial<Record<ErrorCase, Message>>;

const resolve = (m: Message, serverMessage?: string) =>
  typeof m === "function" ? m(serverMessage) : m;

/** Un compte désactivé renvoie 401 (token) ou 422 (login) avec ce mot dans le message. */
const isAccountDisabled = (message?: string) => !!message && /désactivé/i.test(message);

/**
 * Traduit un message de validation Laravel. Le backend n'a pas de fichiers
 * de langue : les règles standard arrivent en anglais.
 */
function validationMessage(field: string, message: string): string {
  if (isAccountDisabled(message)) return t("Errors.account_disabled");
  if (/already been taken/i.test(message)) {
    return field === "email" ? t("Errors.email_taken") : t("Errors.value_taken");
  }
  if (/valid email/i.test(message)) return t("Errors.email_invalid");
  const min = message.match(/at least (\d+) characters/i);
  if (min) {
    return field.startsWith("password")
      ? t("Errors.password_min", { min: min[1] })
      : t("Errors.too_short", { min: min[1] });
  }
  if (/confirmation does not match/i.test(message)) return t("Errors.password_mismatch");
  if (/(must not|may not) be greater than/i.test(message)) return t("Errors.too_long");
  if (/is required/i.test(message)) return t("Errors.field_required");
  if ((field === "date_debut" || field === "date_fin") && /date/i.test(message)) {
    return t("Errors.invalid_dates");
  }
  // Messages déjà rédigés en français côté backend (identifiants, règles métier…)
  return message;
}

/**
 * Transforme n'importe quelle erreur (axios ou JS) en message lisible pour l'utilisateur.
 * Les `overrides` priment sur les messages génériques de `Errors.*`.
 */
export function getErrorMessage(err: any, overrides: ErrorOverrides = {}): string {
  const fallback = () =>
    overrides.default !== undefined ? resolve(overrides.default) : t("Errors.generic");

  // Erreur JS (pas une requête HTTP)
  if (!err?.isAxiosError && !err?.response && !err?.request) return fallback();

  // Pas de réponse : réseau ou délai dépassé
  if (!err.response) {
    const isTimeout =
      err.code === "ECONNABORTED" || err.code === "ETIMEDOUT" || /timeout/i.test(err.message ?? "");
    if (isTimeout) {
      return overrides.timeout !== undefined ? resolve(overrides.timeout) : t("Errors.timeout");
    }
    return overrides.network !== undefined ? resolve(overrides.network) : t("Errors.network");
  }

  const status: number = err.response.status;
  const data = err.response.data ?? {};
  const serverMessage: string | undefined =
    typeof data.message === "string" && data.message.trim() ? data.message : undefined;

  if (overrides[status] !== undefined) return resolve(overrides[status]!, serverMessage);

  switch (true) {
    case status === 401:
      return isAccountDisabled(serverMessage) ? t("Errors.account_disabled") : t("Errors.session_expired");
    case status === 403:
      return serverMessage ?? t("Errors.forbidden");
    case status === 404:
      return t("Errors.not_found");
    case status === 409:
      return serverMessage ?? t("Errors.conflict");
    case status === 422: {
      if (data.errors && typeof data.errors === "object") {
        const messages = Object.entries(data.errors as Record<string, string[] | string>).flatMap(
          ([field, msgs]) => (Array.isArray(msgs) ? msgs : [msgs]).map((m) => validationMessage(field, m))
        );
        return Array.from(new Set(messages)).join("\n");
      }
      return serverMessage ?? t("Errors.invalid");
    }
    case status === 429:
      return t("Errors.too_many_requests");
    case status >= 500:
      return t("Errors.server");
    default:
      return serverMessage ?? fallback();
  }
}

/** Code HTTP d'une erreur axios, ou undefined (réseau, erreur JS). */
export const errorStatus = (err: any): number | undefined => err?.response?.status;

/**
 * Message d'un écran de chargement : ce qui a échoué, puis pourquoi
 * (ex. « Impossible de charger les hôtels. » + « Vérifiez votre connexion internet. »).
 */
export function loadErrorMessage(err: any, context: string, overrides: ErrorOverrides = {}): string {
  const cause = getErrorMessage(err, overrides);
  return cause === t("Errors.generic") || cause === context ? context : `${context}\n${cause}`;
}

/**
 * Affiche l'erreur d'une action dans une alerte. Un 401 n'en affiche pas :
 * l'utilisateur est déjà renvoyé sur la connexion avec le motif.
 */
export function showError(title: string, err: any, overrides: ErrorOverrides = {}): void {
  if (errorStatus(err) === 401) return;
  Alert.alert(title, getErrorMessage(err, overrides));
}

/** Ancien nom, conservé pour compatibilité. */
export const parseApiError = (err: any) => getErrorMessage(err);
