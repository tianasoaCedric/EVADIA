'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { MessageCircle, X, Send, ChevronLeft } from 'lucide-react'
import { authService, reservationService, chatboxService } from '@/lib/services'
import { useReverbEcho } from '@/hooks/useReverbEcho'
import type { User as UserType, Reservation, ReservationMessage } from '@/lib/types'

// Filet de sécurité si le WebSocket n'est pas connecté (échec token, réseau, etc.)
const POLL_FALLBACK_INTERVAL_MS = 15000

export default function ChatboxWidget() {
  const [user, setUser] = useState<UserType | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null)
  const [messages, setMessages] = useState<ReservationMessage[]>([])
  const [chatFerme, setChatFerme] = useState(false)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const echo = useReverbEcho(!!user)

  useEffect(() => {
    authService.me()
      .then(async ({ user }) => {
        setUser(user)
        const res = await reservationService.list({ statut: 'acceptee' })
        setReservations(res.data)
      })
      .catch(() => setUser(null))
  }, [])

  const loadMessages = useCallback(async (reservationId: number) => {
    const res = await chatboxService.messages(reservationId)
    setMessages(res.data)
    setChatFerme(res.chat_ferme)
  }, [])

  useEffect(() => {
    if (!activeReservation) return
    loadMessages(activeReservation.id)
  }, [activeReservation, loadMessages])

  // Temps réel via Reverb quand la connexion WebSocket est établie ; sinon
  // repli sur un polling léger pour ne pas laisser la conversation figée.
  useEffect(() => {
    if (!activeReservation || !user) return

    if (echo) {
      const channel = echo.private(`messages.${user.id}`)
      const handler = (payload: { reservation_id?: number }) => {
        loadMessages(activeReservation.id)
        void payload
      }
      channel.listen('.message.sent', handler)
      return () => {
        channel.stopListening('.message.sent', handler)
        echo.leave(`messages.${user.id}`)
      }
    }

    const interval = setInterval(() => loadMessages(activeReservation.id), POLL_FALLBACK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [activeReservation, loadMessages, echo, user])

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
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {r.propriete?.hotel?.nom ?? r.propriete?.nom}
                  </p>
                  <p className="text-xs text-gray-500">{r.code_reservation}</p>
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
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-[#01BDA5] hover:bg-[#01A38E] text-white shadow-xl flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
          aria-label="Ouvrir la messagerie"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
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
