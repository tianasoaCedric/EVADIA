import { apiClient } from '@/lib/api-client'

export interface Offre {
  id: number
  titre: string
  description: string | null
  hotel_nom: string
  city: string
  destination: string
  photo: string | null
  discount: number
  date_debut: string
  date_fin: string
  start_day: number
  end_day: number
  month_num: number
}

export interface OffreDetail extends Offre {
  phone: string | null
  email: string | null
  terms: string[]
}

export interface PaginatedOffres {
  data: Offre[]
  current_page: number
  last_page: number
  total: number
}

export const offreService = {
  list(params: { page?: number; search?: string } = {}): Promise<PaginatedOffres> {
    const q = new URLSearchParams()
    if (params.page) q.set('page', String(params.page))
    if (params.search) q.set('search', params.search)
    const qs = q.toString()
    return apiClient.get<PaginatedOffres>(`/offres${qs ? `?${qs}` : ''}`)
  },

  get(id: number): Promise<OffreDetail> {
    return apiClient.get<OffreDetail>(`/offres/${id}`)
  },
}
