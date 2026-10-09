import { apiClient } from '@/lib/api-client'
import type {
  CreateReservationPayload,
  PaginatedResponse,
  Reservation,
  StatutReservation,
} from '@/lib/types'

export const reservationService = {
  list(params: { page?: number; statut?: StatutReservation } = {}): Promise<PaginatedResponse<Reservation>> {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.statut) query.set('statut', params.statut)
    const qs = query.toString()
    return apiClient.silentGet<PaginatedResponse<Reservation>>(`/api/client/reservations${qs ? `?${qs}` : ''}`)
  },

  get(id: number): Promise<{ data: Reservation }> {
    return apiClient.silentGet<{ data: Reservation }>(`/api/client/reservations/${id}`)
  },

  create(payload: CreateReservationPayload): Promise<{ data: Reservation }> {
    return apiClient.post<{ data: Reservation }>('/api/client/reservations', payload)
  },

  cancel(id: number, raison?: string): Promise<{ data: Reservation }> {
    return apiClient.patch<{ data: Reservation }>(`/api/client/reservations/${id}/cancel`, raison ? { raison } : undefined)
  },
}
