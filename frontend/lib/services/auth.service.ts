import { apiClient, tokenStorage } from '@/lib/api-client'
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from '@/lib/types'

export const authService = {
  /**
   * Connexion — stocke automatiquement le token
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', payload)
    tokenStorage.set(response.token)
    return response
  },

  /**
   * Inscription — stocke automatiquement le token
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', payload)
    tokenStorage.set(response.token)
    return response
  },

  /**
   * Déconnexion de la session courante
   */
  async logout(): Promise<void> {
    await apiClient.post<void>('/auth/logout', {})
    tokenStorage.remove()
  },

  /**
   * Déconnexion de toutes les sessions
   */
  async logoutAll(): Promise<void> {
    await apiClient.post<void>('/auth/logout-all', {})
    tokenStorage.remove()
  },

  /**
   * Récupère l'utilisateur connecté
   */
  me(): Promise<{ user: User }> {
    return apiClient.get<{ user: User }>('/auth/me')
  },

  /**
   * Vérifie si un token est présent
   */
  isAuthenticated(): boolean {
    return tokenStorage.get() !== null
  },
}
