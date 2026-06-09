import { apiClient } from '@/lib/api-client'
import type { Favori } from '@/lib/types'

export const favoriService = {
  /**
   * Liste des hôtels favoris du client
   * GET /client/favorites
   */
  list(): Promise<{ data: Favori[] }> {
    return apiClient.get<{ data: Favori[] }>('/client/favorites')
  },

  /**
   * Ajouter un hôtel aux favoris
   * POST /client/favorites
   */
  add(hotelId: number): Promise<{ data: Favori }> {
    return apiClient.post<{ data: Favori }>('/client/favorites', { hotel_id: hotelId })
  },

  /**
   * Retirer un hôtel des favoris
   * DELETE /client/favorites/{hotelId}
   */
  remove(hotelId: number): Promise<void> {
    return apiClient.delete<void>(`/client/favorites/${hotelId}`)
  },
}
