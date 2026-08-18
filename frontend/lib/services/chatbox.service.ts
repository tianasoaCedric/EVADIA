import { apiClient } from '@/lib/api-client'
import type { ReservationMessage, ReservationMessagesResponse } from '@/lib/types'

export const chatboxService = {
  messages(reservationId: number): Promise<ReservationMessagesResponse> {
    return apiClient.silentGet<ReservationMessagesResponse>(`/api/client/reservations/${reservationId}/messages`)
  },

  send(reservationId: number, contenu: string): Promise<{ data: ReservationMessage }> {
    return apiClient.post<{ data: ReservationMessage }>(`/api/client/reservations/${reservationId}/messages`, { contenu })
  },

  choisirPaiement(reservationId: number, modePaiement: string): Promise<{ data: ReservationMessage }> {
    return apiClient.post<{ data: ReservationMessage }>(
      `/api/client/reservations/${reservationId}/messages/paiement`,
      { mode_paiement: modePaiement },
    )
  },
}
