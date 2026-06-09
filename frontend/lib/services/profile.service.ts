import { apiClient } from '@/lib/api-client'
import type { UpdatePasswordPayload, UpdateProfilePayload, User } from '@/lib/types'

export const profileService = {
  get(): Promise<{ data: User }> {
    return apiClient.silentGet<{ data: User }>('/api/client/profile')
  },

  update(payload: UpdateProfilePayload): Promise<{ data: User }> {
    return apiClient.put<{ data: User }>('/api/client/profile', payload)
  },

  updatePassword(payload: UpdatePasswordPayload): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>('/api/client/profile/password', payload)
  },
}
