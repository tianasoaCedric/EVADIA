'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { MessageCircle, X, Send, ChevronLeft, ChevronRight, Building2 } from 'lucide-react'
import { reservationService, chatboxService } from '@/lib/services'
import { useNotifications } from '@/app/context/NotificationsContext'
import type { Reservation, ReservationMessage } from '@/lib/types'

// Filet de sécurité si le WebSocket n'est pas connecté (échec token, réseau, etc.)
const POLL_FALLBACK_INTERVAL_MS = 15000

export default function ChatboxWidget() {
  const { user, echo, notifications, markRead, chatRequest } = useNotifications()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null)
  const [messages, setMessages] = useState<ReservationMessage[]>([])
  const [chatFerme, setChatFerme] = useState(false)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({})
  const scrollRef = useRef<HTMLDivElement>(null)

  const refreshUnreadCounts = useCallback(async (list: Reservation[]) => {
    const counts = await Promise.all(
      list.map((r) => chatboxService.unreadCount(r.id).then((res) => [r.id, res.unread_count] as const)),
    )
    setUnreadCounts(Object.fromEntries(counts))
  }, [])

  const loadReservations = useCallback(async () => {
    const res = await reservationService.list({ statut: 'acceptee' })
    setReservations(res.data)
    void refreshUnreadCounts(res.data)
    return res.data
  }, [refreshUnreadCounts])

  useEffect(() => {
    if (!user) {
      // Déconnexion : rien ne doit rester de la session précédente
      setReservations([])
      setActiveReservation(null)
      setMessages([])
      setUnreadCounts({})
      setIsOpen(false)
      return
    }
    loadReservations().catch(() => {})
  }, [user, loadReservations])

  // Réservations acceptées dont la conversation n'a pas encore été ouverte :
  // la notification « reservation_acceptee » reste non lue jusque-là.
  const nouvellesIds = useMemo(
    () => new Set(
      notifications
        .filter((n) => n.type_notification === 'reservation_acceptee' && !n.lu && n.reservation_id)
        .map((n) => n.reservation_id as number),
    ),
    [notifications],
  )

  // Une réservation vient d'être acceptée : la chatbox apparaît sans recharger la page.
  useEffect(() => {
    if (!user) return
    const known = new Set(reservations.map((r) => r.id))
    if ([...nouvellesIds].some((id) => !known.has(id))) {
      loadReservations().catch(() => {})
    }
  }, [user, nouvellesIds, reservations, loadReservations])

  const loadMessages = useCallback(async (reservationId: number) => {
    const res = await chatboxService.messages(reservationId)
    setMessages(res.data)
    setChatFerme(res.chat_ferme)
    setUnreadCounts((prev) => ({ ...prev, [reservationId]: 0 }))
  }, [])

  useEffect(() => {
    if (!activeReservation) return
    loadMessages(activeReservation.id)
  }, [activeReservation, loadMessages])

  // Conversation ouverte : éteint les voyants liés à cette réservation (cloche comprise)
  useEffect(() => {
    if (!activeReservation) return
    markRead(
      notifications
        .filter((n) => n.reservation_id === activeReservation.id && !n.lu)
        .map((n) => n.id),
    )
  }, [activeReservation, notifications, markRead])

  // Ouverture demandée depuis la cloche de notifications
  useEffect(() => {
    if (!chatRequest) return
    const open = (list: Reservation[]) => {
      const target = list.find((r) => r.id === chatRequest.reservationId)
      if (!target) return
      setIsOpen(true)
      setActiveReservation(target)
    }
    const known = reservations.find((r) => r.id === chatRequest.reservationId)
    if (known) open(reservations)
    else loadReservations().then(open).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps -- réagit uniquement à une nouvelle demande
  }, [chatRequest])

  // Temps réel via Reverb quand la connexion WebSocket est établie ; sinon
  // repli sur un polling léger pour ne pas laisser la conversation figée.
  useEffect(() => {
    if (!user) return

    if (echo) {
      const channel = echo.private(`messages.${user.id}`)
      const handler = (payload: { reservation_id?: number }) => {
        if (activeReservation && payload.reservation_id === activeReservation.id) {
          loadMessages(activeReservation.id)
        } else if (payload.reservation_id) {
          setUnreadCounts((prev) => ({
            ...prev,
            [payload.reservation_id!]: (prev[payload.reservation_id!] ?? 0) + 1,
          }))
        }
      }
      channel.listen('.message.sent', handler)
      // Pas de leave() : le canal est partagé avec NotificationsContext, qui le ferme.
      return () => {
        channel.stopListening('.message.sent', handler)
      }
    }

    const interval = setInterval(() => {
      if (activeReservation) loadMessages(activeReservation.id)
      void refreshUnreadCounts(reservations)
    }, POLL_FALLBACK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [activeReservation, loadMessages, echo, user, reservations, refreshUnreadCounts])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  if (!user || reservations.length === 0) return null

  const handleSend = async () => {
    if (!activeReservation || !input.trim() || isSending) return
    setIsSending(true)
    try {
      await chatboxService.send(activeReservation.id, input.trim())
      setInput('')
      await loadMessages(activeReservation.id)
    } finally {
      setIsSending(false)
    }
  }

  const handleChoixPaiement = async (code: string) => {
    if (!activeReservation) return
    await chatboxService.choisirPaiement(activeReservation.id, code)
    await loadMessages(activeReservation.id)
  }

  const dernierChoixPaiement = messages.some(
    (m) => m.type === 'choix_paiement' && m.expediteur_id === user.id,
  )

  const totalUnread = Object.values(unreadCounts).reduce((sum, n) => sum + n, 0)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-[22rem] h-[32rem] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-[#01BDA5] text-white px-4 py-3 flex items-center gap-2">
            {activeReservation && (
              <button onClick={() => setActiveReservation(null)} className="cursor-pointer">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {activeReservation ? activeReservation.propriete?.hotel?.nom ?? 'Hôtel' : 'Mes conversations'}
              </p>
              {activeReservation && (
                <p className="text-xs opacity-80 truncate">{activeReservation.code_reservation}</p>
              )}
            </div>
            <button onClick={() => setIsOpen(false)} className="cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Liste des réservations */}
          {!activeReservation && (
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {reservations.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setActiveReservation(r)}
                  className="w-full flex items-center gap-3 text-left px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 shrink-0 rounded-full bg-[#01BDA5]/10 text-[#01BDA5] flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {r.propriete?.hotel?.nom ?? r.propriete?.nom}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{r.code_reservation}</p>
                  </div>
                  {nouvellesIds.has(r.id) && !unreadCounts[r.id] && (
                    <span className="px-2 h-5 rounded-full bg-[#01BDA5] text-white text-[10px] font-semibold uppercase tracking-wide flex items-center shrink-0">
                      Nouveau
                    </span>
                  )}
                  {!!unreadCounts[r.id] && (
                    <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
                      {unreadCounts[r.id]}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Fil de conversation */}
          {activeReservation && (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.map((m) => (
                  <ChatMessage
                    key={m.id}
                    message={m}
                    isOwn={m.expediteur_id === user.id}
                    onChoixPaiement={handleChoixPaiement}
                    disabled={chatFerme || dernierChoixPaiement}
                  />
                ))}
              </div>

              <div className="border-t border-gray-100 p-3">
                {chatFerme ? (
                  <p className="text-center text-xs text-gray-400 py-2">
                    Cette conversation est clôturée.
                  </p>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Votre message..."
                      className="flex-1 px-3 py-2 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#01BDA5]"
                    />
                    <button
                      onClick={handleSend}
                      disabled={isSending || !input.trim()}
                      className="w-9 h-9 rounded-full bg-[#01BDA5] hover:bg-[#01A38E] text-white flex items-center justify-center disabled:opacity-50 cursor-pointer flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="relative flex flex-col items-end gap-3">
          {/* Bulle d'annonce : réservation acceptée, conversation pas encore ouverte */}
          {nouvellesIds.size > 0 && (
            <button
              onClick={() => setIsOpen(true)}
              className="max-w-[16rem] bg-white rounded-2xl rounded-br-sm shadow-xl border border-gray-100 px-4 py-3 text-left text-sm text-gray-700 cursor-pointer animate-[fadeIn_0.3s_ease-out]"
            >
              <span className="font-semibold text-[#01BDA5]">Réservation acceptée !</span>
              <br />
              Échangez avec l&apos;hôtel ici.
            </button>
          )}
          <button
            onClick={() => setIsOpen(true)}
            className="relative w-14 h-14 rounded-full bg-[#01BDA5] hover:bg-[#01A38E] text-white shadow-xl flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
            aria-label="Ouvrir la messagerie"
          >
            {/* Voyant qui pulse tant qu'il y a du nouveau */}
            {(totalUnread > 0 || nouvellesIds.size > 0) && (
              <span className="absolute inset-0 rounded-full bg-[#01BDA5] animate-ping opacity-40" />
            )}
            <MessageCircle className="relative w-6 h-6" />
            {totalUnread > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-semibold flex items-center justify-center border-2 border-white">
                {totalUnread}
              </span>
            ) : nouvellesIds.size > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 border-2 border-white" />
            )}
          </button>
        </div>
      )}
    </div>
  )
}

function ChatMessage({
  message,
  isOwn,
  onChoixPaiement,
  disabled,
}: {
  message: ReservationMessage
  isOwn: boolean
  onChoixPaiement: (code: string) => void
  disabled: boolean
}) {
  if (message.type === 'systeme') {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-700 whitespace-pre-line">
        {message.contenu}
      </div>
    )
  }

  if (message.type === 'choix_paiement' && message.metadata?.options) {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 space-y-2">
        <p className="text-sm text-gray-700">{message.contenu}</p>
        <div className="flex flex-wrap gap-2">
          {message.metadata.options.map((opt) => (
            <button
              key={opt.code}
              onClick={() => onChoixPaiement(opt.code)}
              disabled={disabled}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-[#01BDA5] text-[#01BDA5] hover:bg-[#01BDA5]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {opt.libelle}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
          isOwn ? 'bg-[#01BDA5] text-white' : 'bg-gray-100 text-gray-800'
        }`}
      >
        {message.contenu}
      </div>
    </div>
  )
}
