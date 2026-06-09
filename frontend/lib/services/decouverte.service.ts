import { apiClient } from '@/lib/api-client'
import type { VilleDecouverte, LieuDecouverte } from '@/lib/types'

export const decouverteService = {
  getVilles(): Promise<VilleDecouverte[]> {
    return apiClient.get<VilleDecouverte[]>('/decouverte/villes')
  },

  getLieux(villeSlug: string): Promise<{ ville: VilleDecouverte; lieux: LieuDecouverte[] }> {
    return apiClient.get<{ ville: VilleDecouverte; lieux: LieuDecouverte[] }>(
      `/decouverte/villes/${villeSlug}/lieux`
    )
  },
}
