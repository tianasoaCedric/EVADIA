import { apiClient } from '@/lib/api-client'
import type { UpdatePasswordPayload, UpdateProfilePayload, User } from '@/lib/types'

export const profileService = {
  /**
   * Récupère le profil de l'utilisateur connecté
   * GET /client/profile
   */
  get(): Promise<{ data: User }> {
    return apiClient.get<{ data: User }>('/client/profile')
  },

  /**
   * Met à jour les informations du profil
   * PUT /client/profile
   */
  update(payload: UpdateProfilePayload): Promise<{ data: User }> {
    return apiClient.put<{ data: User }>('/client/profile', payload)
  },

  /**
   * Modifie le mot de passe
   * PUT /client/profile/password
   */
  updatePassword(payload: UpdatePasswordPayload): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>('/client/profile/password', payload)
  },
}
