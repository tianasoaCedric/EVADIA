// Le token vit dans un cookie httpOnly : le JS ne peut pas observer sa pose ni
// sa suppression. Connexion et déconnexion se font sans rechargement de page
// (router.push), donc on prévient explicitement les composants qui dépendent
// de l'utilisateur connecté (notifications, chatbox, favoris…).

const EVENT_NAME = 'evadia:auth-changed'

export function notifyAuthChanged(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(EVENT_NAME))
}

/** Abonnement ; retourne la fonction de désabonnement. */
export function onAuthChanged(callback: () => void): () => void {
  window.addEventListener(EVENT_NAME, callback)
  return () => window.removeEventListener(EVENT_NAME, callback)
}
