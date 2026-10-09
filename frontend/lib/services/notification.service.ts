import { apiClient } from '@/lib/api-client'
import type { ClientNotification } from '@/lib/types'

export const notificationService = {
  // silent : chargements de fond, un visiteur ne doit pas être renvoyé vers /login
  list(): Promise<{ data: ClientNotification[] }> {
    return apiClient.silentGet<{ data: ClientNotification[] }>('/api/client/notifications')
  },

  markRead(id: number): Promise<void> {
    return apiClient.patch<void>(`/api/client/notifications/${id}/read`)
  },

  markAllRead(): Promise<void> {
    return apiClient.patch<void>('/api/client/notifications/read-all')
  },
}
