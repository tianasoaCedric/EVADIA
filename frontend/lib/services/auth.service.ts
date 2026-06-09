import { apiClient } from '@/lib/api-client'
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '@/lib/types'

export const authService = {
  /**
   * Connexion — le cookie httpOnly est posé par /api/auth/login
   */
  async login(payload: LoginPayload): Promise<{ user: User }> {
    return apiClient.post<{ user: User }>('/api/auth/login', payload)
  },

  /**
   * Inscription — le cookie httpOnly est posé par /api/auth/register
   */
  async register(payload: RegisterPayload): Promise<{ user: User }> {
    return apiClient.post<{ user: User }>('/api/auth/register', payload)
  },

  /**
   * Déconnexion — supprime le cookie httpOnly via /api/auth/logout
   */
  async logout(): Promise<void> {
    await apiClient.post<void>('/api/auth/logout', {})
  },

  /**
   * Déconnexion de toutes les sessions
   */
  async logoutAll(): Promise<void> {
    await apiClient.post<void>('/api/auth/logout', { all: true })
  },

  /**
   * Récupère l'utilisateur connecté — silencieux, ne redirige pas sur 401
   */
  me(): Promise<{ user: User }> {
    return apiClient.silentGet<{ user: User }>('/api/auth/me')
  },
}
