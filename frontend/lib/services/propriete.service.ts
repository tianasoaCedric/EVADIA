import { apiClient } from '@/lib/api-client'
import type { ProprietePublic } from '@/lib/types'

export const proprieteService = {
  /**
   * Détail public d'une chambre — GET /proprietes/{id}
   */
  get(id: number): Promise<ProprietePublic> {
    return apiClient.get<ProprietePublic>(`/proprietes/${id}`)
  },
}
