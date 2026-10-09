'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Bell, CheckCircle2, XCircle, MessageCircle } from 'lucide-react'
import { useNotifications } from '../../context/NotificationsContext'
import type { ClientNotification } from '@/lib/types'

interface NotificationBellProps {
  variant?: 'default' | 'dark'
}

const ICONS: Record<string, { icon: typeof Bell; color: string }> = {
  reservation_acceptee: { icon: CheckCircle2, color: 'text-[#01BDA5] bg-[#01BDA5]/10' },
  reservation_refusee: { icon: XCircle, color: 'text-red-500 bg-red-50' },
  nouveau_message_reservation: { icon: MessageCircle, color: 'text-blue-500 bg-blue-50' },
}

export default function NotificationBell({ variant = 'default' }: NotificationBellProps) {
  const t = useTranslations('Header')
  const router = useRouter()
  const { user, notifications, unreadCount, markRead, markAllRead, openChat } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Visiteur : pas de cloche
  if (!user) return null

  const handleClick = (n: ClientNotification) => {
    markRead([n.id])
    setOpen(false)
    // Réservation acceptée ou nouveau message : on ouvre directement la conversation
    if (n.reservation_id && n.type_notification !== 'reservation_refusee') {
      openChat(n.reservation_id)
    } else {
      router.push('/reservations')
    }
  }

  const buttonColor = variant === 'default'
    ? 'text-white hover:bg-white/10'
    : 'text-gray-800 hover:text-[#01BDA5] hover:bg-gray-100'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`relative p-2 rounded-full transition-all duration-200 cursor-pointer ${buttonColor}`}
        aria-label={unreadCount > 0 ? t('notifications_unread', { count: unreadCount }) : t('notifications')}
      >
        <Bell className="w-5 h-5 md:w-6 md:h-6" />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping opacity-75" />
            <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center border-2 border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-semibold text-gray-800 text-sm">{t('notifications')}</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-[#01BDA5] hover:underline cursor-pointer"
              >
                {t('notifications_mark_all_read')}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">{t('notifications_empty')}</p>
            ) : (
              notifications.slice(0, 20).map((n) => {
                const { icon: Icon, color } = ICONS[n.type_notification] ?? { icon: Bell, color: 'text-gray-500 bg-gray-100' }
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full flex gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors cursor-pointer ${n.lu ? '' : 'bg-[#01BDA5]/5'}`}
                  >
                    <span className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${color}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className={`block text-sm truncate ${n.lu ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                        {n.titre}
                      </span>
                      <span className="block text-xs text-gray-500 line-clamp-2">{n.contenu}</span>
                      <span className="block text-[11px] text-gray-400 mt-0.5">
                        {new Date(n.date_envoi).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </span>
                    {!n.lu && <span className="w-2 h-2 mt-1.5 shrink-0 rounded-full bg-red-500" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
