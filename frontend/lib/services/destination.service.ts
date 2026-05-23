import { apiClient } from '@/lib/api-client'
import type { Destination } from '@/lib/types'

const PLACEHOLDER = '/photos/bc.png'

export const destinationService = {
  async list(): Promise<{ data: Destination[] }> {
    const res = await apiClient.get<{ data: Destination[] }>('/destinations')
    return {
      data: res.data.map(d => ({
        ...d,
        image_url: d.image_url ?? PLACEHOLDER,
      })),
    }
  },
}
