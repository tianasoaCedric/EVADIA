import { apiClient } from '@/lib/api-client'
import type {
  CreateReservationPayload,
  PaginatedResponse,
  Reservation,
  StatutReservation,
} from '@/lib/types'

export const reservationService = {
  /**
   * Liste des réservations du client connecté
   * GET /client/reservations
   */
  list(params: { page?: number; statut?: StatutReservation } = {}): Promise<PaginatedResponse<Reservation>> {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.statut) query.set('statut', params.statut)

    const qs = query.toString()
    return apiClient.get<PaginatedResponse<Reservation>>(`/client/reservations${qs ? `?${qs}` : ''}`)
  },

  /**
   * Détail d'une réservation
   * GET /client/reservations/{id}
   */
  get(id: number): Promise<{ data: Reservation }> {
    return apiClient.get<{ data: Reservation }>(`/client/reservations/${id}`)
  },

  /**
   * Créer une réservation
   * POST /client/reservations
   */
  create(payload: CreateReservationPayload): Promise<{ data: Reservation }> {
    return apiClient.post<{ data: Reservation }>('/client/reservations', payload)
  },

  /**
   * Annuler une réservation
   * PATCH /client/reservations/{id}/cancel
   */
  cancel(id: number): Promise<{ data: Reservation }> {
    return apiClient.patch<{ data: Reservation }>(`/client/reservations/${id}/cancel`)
  },
}
