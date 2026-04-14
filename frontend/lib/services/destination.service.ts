import { apiClient } from '@/lib/api-client'
import type { Destination } from '@/lib/types'

export const destinationService = {
  /**
   * Liste toutes les destinations avec leur nombre d'hôtels actifs
   * GET /destinations  (route publique)
   */
  list(): Promise<{ data: Destination[] }> {
    return apiClient.get<{ data: Destination[] }>('/destinations')
  },
}
