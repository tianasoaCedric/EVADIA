export function parseApiError(err: any): string {
  // Erreur réseau (backend éteint, pas de WiFi, mauvaise IP)
  if (!err.response) {
    if (err.code === "ECONNABORTED") return "Le serveur met trop de temps à répondre.";
    return "Serveur inaccessible. Vérifiez votre connexion.";
  }

  const data = err.response.data;

  // Erreurs de validation Laravel (422)
  if (data?.errors) {
    return Object.values(data.errors).flat().join("\n");
  }

  // Message d'erreur simple
  if (data?.message) return data.message;

  return "Une erreur est survenue.";
}
