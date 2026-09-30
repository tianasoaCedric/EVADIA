import { useEffect, useRef, useState } from 'react'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { broadcastingService } from '@/lib/services'

// Le token broadcasting n'est jamais persisté (pas de localStorage) : il vit en
// mémoire le temps de la session Echo et est renouvelé avant son expiration
// (courte durée, ability restreinte à 'broadcasting' — voir BroadcastingTokenController).
const REFRESH_MARGIN_MS = 60_000

/**
 * N'établit la connexion WebSocket que si `enabled` est vrai — à activer
 * uniquement après confirmation qu'un utilisateur est authentifié, pour ne
 * jamais interroger l'API en tant que visiteur anonyme.
 */
export function useReverbEcho(enabled: boolean): Echo<'reverb'> | null {
  const [echo, setEcho] = useState<Echo<'reverb'> | null>(null)
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const echoRef = useRef<Echo<'reverb'> | null>(null)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    const connect = async () => {
      try {
        const { token, expires_at, reverb_key } = await broadcastingService.issueToken()
        if (cancelled) return

        // Clé fournie par l'API ; la variable de build n'est qu'un repli.
        const key = reverb_key || process.env.NEXT_PUBLIC_REVERB_APP_KEY
        if (!key) return

        echoRef.current?.disconnect()

        const instance = new Echo({
          broadcaster: 'reverb',
          key,
          wsHost: window.location.hostname,
          wsPort: window.location.protocol === 'https:' ? 443 : 80,
          wssPort: 443,
          forceTLS: window.location.protocol === 'https:',
          enabledTransports: ['ws', 'wss'],
          // Pas de wsPath : pusher-js ajoute déjà « /app/<clé> », servi par nginx → Reverb.
          authEndpoint: '/api/broadcasting/auth',
          auth: {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          },
        })

        echoRef.current = instance
        setEcho(instance)

        const msUntilRefresh = new Date(expires_at).getTime() - Date.now() - REFRESH_MARGIN_MS
        refreshTimer.current = setTimeout(connect, Math.max(msUntilRefresh, 5_000))
      } catch {
        // Silencieux : le composant appelant retombe sur le polling REST.
      }
    }

    connect()

    return () => {
      cancelled = true
      if (refreshTimer.current) clearTimeout(refreshTimer.current)
      echoRef.current?.disconnect()
      echoRef.current = null
    }
  }, [enabled])

  return echo
}

// Nécessaire pour laravel-echo côté navigateur (attend window.Pusher)
if (typeof window !== 'undefined') {
  ;(window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher
}
