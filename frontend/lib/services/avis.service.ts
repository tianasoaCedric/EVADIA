import { apiClient } from '@/lib/api-client'
import type { Avis, CreateAvisPayload, PaginatedResponse } from '@/lib/types'

export const avisService = {
  /**
   * Liste des avis du client connecté
   * GET /client/reviews
   */
  list(page = 1): Promise<PaginatedResponse<Avis>> {
    return apiClient.get<PaginatedResponse<Avis>>(`/client/reviews?page=${page}`)
  },

  /**
   * Soumettre un avis pour une réservation
   * POST /client/reviews
   */
  create(payload: CreateAvisPayload): Promise<{ data: Avis }> {
    return apiClient.post<{ data: Avis }>('/client/reviews', payload)
  },
}
