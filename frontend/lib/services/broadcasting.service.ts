import { apiClient } from '@/lib/api-client'

export interface BroadcastingToken {
  token: string
  expires_at: string
}

export const broadcastingService = {
  // silent: un visiteur non authentifié ne doit jamais être redirigé vers /login
  // à cause d'un appel de fond comme celui-ci.
  issueToken(): Promise<BroadcastingToken> {
    return apiClient.silentPost<BroadcastingToken>('/api/client/broadcasting-token', {})
  },
}
