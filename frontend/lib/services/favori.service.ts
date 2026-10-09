import { apiClient } from '@/lib/api-client'
import type { Favori } from '@/lib/types'

export const favoriService = {
  list(): Promise<{ data: Favori[] }> {
    return apiClient.silentGet<{ data: Favori[] }>('/api/client/favorites')
  },

  add(hotelId: number): Promise<{ data: Favori }> {
    return apiClient.post<{ data: Favori }>('/api/client/favorites', { hotel_id: hotelId })
  },

  remove(hotelId: number): Promise<void> {
    return apiClient.delete<void>(`/api/client/favorites/${hotelId}`)
  },
}
