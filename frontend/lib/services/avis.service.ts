import { apiClient } from '@/lib/api-client'
import type { Avis, AvisPublic, CreateAvisPayload, PaginatedResponse } from '@/lib/types'

export const avisService = {
  listByHotel(hotelId: number): Promise<{ data: AvisPublic[] }> {
    return apiClient.get<{ data: AvisPublic[] }>(`/hotels/${hotelId}/reviews`)
  },

  list(page = 1): Promise<PaginatedResponse<Avis>> {
    return apiClient.silentGet<PaginatedResponse<Avis>>(`/api/client/reviews?page=${page}`)
  },

  create(payload: CreateAvisPayload): Promise<{ data: Avis }> {
    return apiClient.post<{ data: Avis }>('/api/client/reviews', payload)
  },
}
