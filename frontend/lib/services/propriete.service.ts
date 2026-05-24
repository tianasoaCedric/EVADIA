import { apiClient } from '@/lib/api-client'
import type { ProprietePublic } from '@/lib/types'

export const proprieteService = {
  /**
   * Détail public d'une chambre — GET /proprietes/{id}
   */
  get(id: number): Promise<ProprietePublic> {
    return apiClient.get<ProprietePublic>(`/proprietes/${id}`)
  },

  /**
   * Dates déjà réservées pour une propriété — GET /proprietes/{id}/disponibilites
   * Retourne un tableau de dates ISO (YYYY-MM-DD) non disponibles.
   */
  async getBookedDates(id: number): Promise<string[]> {
    try {
      const res = await apiClient.get<{ dates_reservees: string[] }>(`/proprietes/${id}/disponibilites`)
      return res.dates_reservees ?? []
    } catch {
      return []
    }
  },
}
