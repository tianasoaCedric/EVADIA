'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type Echo from 'laravel-echo'
import { authService, notificationService } from '@/lib/services'
import { useReverbEcho } from '@/hooks/useReverbEcho'
import { onAuthChanged } from '@/lib/auth-events'
import type { ClientNotification, User } from '@/lib/types'

// Filet de sécurité si le WebSocket n'est pas connecté
const POLL_FALLBACK_INTERVAL_MS = 30_000

interface NotificationsContextValue {
  /** Utilisateur connecté, null pour un visiteur (ou tant que /me n'a pas répondu) */
  user: User | null
  /** Connexion Reverb partagée (une seule par onglet) */
  echo: Echo<'reverb'> | null
  notifications: ClientNotification[]
  unreadCount: number
  markRead: (ids: number[]) => void
  markAllRead: () => void
  /** Demande à la chatbox d'ouvrir la conversation d'une réservation */
  openChat: (reservationId: number) => void
  chatRequest: { reservationId: number; at: number } | null
}

const NotificationsContext = createContext<NotificationsContextValue>({
  user: null,
  echo: null,
  notifications: [],
  unreadCount: 0,
  markRead: () => {},
  markAllRead: () => {},
  openChat: () => {},
  chatRequest: null,
})

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [notifications, setNotifications] = useState<ClientNotification[]>([])
  const [chatRequest, setChatRequest] = useState<{ reservationId: number; at: number } | null>(null)
  // Reconnexion si l'utilisateur change (token broadcasting propre à chaque compte)
  const echo = useReverbEcho(!!user, user?.id)
  const notificationsRef = useRef(notifications)
  useEffect(() => {
    notificationsRef.current = notifications
  }, [notifications])

  const reload = useCallback(() => {
    notificationService.list()
      .then((res) => setNotifications(res.data))
      .catch(() => {})
  }, [])

  // Vérifie la session au chargement puis à chaque connexion / déconnexion :
  // un visiteur ne voit ni la cloche ni la chatbox, même juste après un logout.
  useEffect(() => {
    let cancelled = false

    const check = () => {
      authService.me()
        .then(({ user }) => {
          if (cancelled) return
          setUser((prev) => (prev?.id === user.id ? prev : user))
          reload()
        })
        .catch(() => {
          if (cancelled) return
          setUser(null)
          setNotifications([])
          setChatRequest(null)
        })
    }

    // Le cookie expire (2 h) sans que le JS le sache : on revérifie au retour sur l'onglet.
    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }

    check()
    const unsubscribe = onAuthChanged(check)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      unsubscribe()
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [reload])

  // Temps réel : chaque notification créée côté Laravel arrive sur le canal
  // privé de l'utilisateur ; sinon polling léger.
  useEffect(() => {
    if (!user) return

    if (echo) {
      const channelName = `messages.${user.id}`
      const channel = echo.private(channelName)
      const handler = (payload: ClientNotification) => {
        setNotifications((prev) =>
          prev.some((n) => n.id === payload.id) ? prev : [payload, ...prev],
        )
      }
      channel.listen('.notification.created', handler)
      return () => {
        channel.stopListening('.notification.created', handler)
        echo.leave(channelName)
      }
    }

    const interval = setInterval(reload, POLL_FALLBACK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [user, echo, reload])

  const markRead = useCallback((ids: number[]) => {
    const toMark = new Set(
      notificationsRef.current.filter((n) => ids.includes(n.id) && !n.lu).map((n) => n.id),
    )
    if (toMark.size === 0) return
    toMark.forEach((id) => notificationService.markRead(id).catch(() => {}))
    setNotifications((prev) => prev.map((n) => (toMark.has(n.id) ? { ...n, lu: true } : n)))
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })))
    notificationService.markAllRead().catch(() => {})
  }, [])

  const openChat = useCallback((reservationId: number) => {
    setChatRequest({ reservationId, at: Date.now() })
  }, [])

  const value = useMemo<NotificationsContextValue>(() => ({
    user,
    echo,
    notifications,
    unreadCount: notifications.filter((n) => !n.lu).length,
    markRead,
    markAllRead,
    openChat,
    chatRequest,
  }), [user, echo, notifications, markRead, markAllRead, openChat, chatRequest])

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationsContext)
}
