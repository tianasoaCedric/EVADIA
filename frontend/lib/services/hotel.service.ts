import { apiClient } from '@/lib/api-client'
import type { Hotel, HotelDetail, HotelFilters, PaginatedResponse } from '@/lib/types'

export interface VillePopulaire {
  id: number
  nom: string
  image: string | null
}

export const hotelService = {
  /**
   * Recherche publique d'hôtels — accessible sans compte (booking.com style)
   * GET /hotels
   */
  list(filters: HotelFilters = {}): Promise<PaginatedResponse<Hotel>> {
    const params = new URLSearchParams()

    if (filters.page) params.set('page', String(filters.page))
    if (filters.search) params.set('search', filters.search)
    if (filters.destination_id) params.set('destination_id', String(filters.destination_id))
    if (filters.type_id) params.set('type_id', String(filters.type_id))
    if (filters.etoiles_min) params.set('etoiles_min', String(filters.etoiles_min))
    if (filters.date_debut) params.set('date_debut', filters.date_debut)
    if (filters.date_fin) params.set('date_fin', filters.date_fin)
    if (filters.nb_adultes) params.set('nb_adultes', String(filters.nb_adultes))
    if (filters.sort) params.set('sort', filters.sort)

    const query = params.toString()
    return apiClient.get<PaginatedResponse<Hotel>>(`/hotels${query ? `?${query}` : ''}`)
  },

  selection(): Promise<PaginatedResponse<Hotel>> {
    return apiClient.get<PaginatedResponse<Hotel>>('/hotels?selection=1')
  },

  popular(): Promise<{ data: Hotel[] }> {
    return apiClient.get<{ data: Hotel[] }>('/hotels?popular=1')
  },

  popularVilles(): Promise<{ data: VillePopulaire[] }> {
    return apiClient.get<{ data: VillePopulaire[] }>('/villes/popular')
  },

  get(id: number): Promise<HotelDetail> {
    return apiClient.get<HotelDetail>(`/hotels/${id}`)
  },
}
