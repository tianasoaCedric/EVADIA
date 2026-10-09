// Mémorise la page à retrouver après connexion. Le paramètre ?redirect= ne
// survit pas à l'aller-retour OAuth Google ni au passage par /register :
// on le double donc dans sessionStorage.

const STORAGE_KEY = 'evadia:returnTo'

/** N'accepte qu'un chemin interne (évite les open redirects) hors pages d'auth. */
function isSafePath(path: string | null | undefined): path is string {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) return false
  return !/^\/(login|register|auth\/callback)(\/|\?|$)/.test(path)
}

export function saveReturnTo(path: string | null | undefined): void {
  if (!isSafePath(path)) return
  try {
    sessionStorage.setItem(STORAGE_KEY, path)
  } catch {}
}

/** Page courante (chemin + query) — à appeler côté client uniquement. */
export function currentPath(): string {
  return window.location.pathname + window.location.search
}

/** Retourne la page mémorisée (param explicite prioritaire) et l'efface. */
export function consumeReturnTo(explicit?: string | null, fallback = '/'): string {
  let stored: string | null = null
  try {
    stored = sessionStorage.getItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {}
  if (isSafePath(explicit)) return explicit
  if (isSafePath(stored)) return stored
  return fallback
}
