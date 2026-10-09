// Ce fichier est conservé pour compatibilité mais la logique auth
// est désormais gérée par context/AuthContext.tsx (même pattern que mobile/).
// Utilisez useAuth() dans vos composants.
export { useAuth } from "../context/AuthContext";
export type { User } from "../context/AuthContext";
