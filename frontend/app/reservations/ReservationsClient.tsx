'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronLeft, Calendar } from 'lucide-react'
import Link from 'next/link'
import { authService, reservationService } from '@/lib/services'
import type { User as UserType, Reservation } from '@/lib/types'
import ReservationCard from '../components/ui/ReservationCard'
import ReservationFilters from '../components/ui/ReservationFilters'
import ReservationDetailsModal from '../components/ui/ReservationDetailsModal'
import Bouton from '../components/ui/Bouton'
import HeroSection from '../components/ui/HeroSection'
import Loading from '../components/ui/Loading'

export default function ReservationsClient() {
  const router = useRouter()
  const t = useTranslations('Reservations')
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  const loadReservations = useCallback(async () => {
    const response = await reservationService.list()
    setReservations(response.data)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.me()
        setUser(response.user)
        await loadReservations()
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [loadReservations])

  const filteredReservations = reservations.filter(res => {
    if (filter !== 'all' && res.statut !== filter) return false
    if (searchQuery && !(res.propriete?.hotel?.nom ?? '').toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const canCancel = (reservation: Reservation) => {
    return reservation.statut === 'en_attente' || reservation.statut === 'acceptee'
  }

  const handleCancel = async () => {
    if (!selectedReservation) return
    setIsCancelling(true)
    try {
      await reservationService.cancel(selectedReservation.id, cancelReason || undefined)
      await loadReservations()
    } catch (error) {
      console.error(error)
    } finally {
      setShowCancelModal(false)
      setCancelReason('')
      setSelectedReservation(null)
      setIsCancelling(false)
    }
  }

  const handleDownloadInvoice = (reservation: Reservation) => {
    window.open(`/api/client/reservations/${reservation.id}/invoice`, '_blank')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">{t('not_authenticated')}</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen pb-16">
      <HeroSection
        title={t('title')}
        subtitle={t('subtitle')}
        backgroundImage="/photos/reservation.jpg"
        showDownload={false}
      />
      <div className="container mx-auto px-4">
        <div className="max-w mx-auto">
          <div className="flex items-center gap-2 my-6">
            {/* Bouton retour */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-800 hover:text-[#01BDA5] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          {/* Titre */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 ">
            {t('title')}
          </h1>
          </div>

          {/* Filtres et recherche */}
          <ReservationFilters
            filter={filter}
            setFilter={setFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Liste des réservations */}
          {filteredReservations.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{t('no_reservations')}</p>
              <Link
                href="/hebergement"
                className="inline-block mt-4 px-6 py-2 rounded-full bg-[#01BDA5] text-white hover:bg-[#01A38E] transition-colors"
              >
                {t('discover_hotels')}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onViewDetails={() => setSelectedReservation(reservation)}
                  onDownloadInvoice={() => handleDownloadInvoice(reservation)}
                  onCancel={() => {
                    setSelectedReservation(reservation)
                    setShowCancelModal(true)
                  }}
                  canCancel={canCancel(reservation)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal des détails */}
      {selectedReservation && !showCancelModal && (
        <ReservationDetailsModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}

      {/* Modal d'annulation */}
      {showCancelModal && selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowCancelModal(false)}>
          <div className="relative max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{t('cancel_title')}</h3>
              </div>

              <p className="text-gray-600 mb-4">
                {t('cancel_confirmation', { hotel: selectedReservation.propriete?.hotel?.nom ?? '' })}
              </p>

              <div className="mb-4">
                <textarea
                  placeholder={t('cancel_reason_placeholder')}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#01BDA5] focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Bouton
                  variant="outline"
                  size="medium"
                  widthMode="full"
                  onClick={() => setShowCancelModal(false)}
                >
                  {t('cancel_button')}
                </Bouton>
                <Bouton
                  variant="danger"
                  size="medium"
                  widthMode="full"
                  onClick={handleCancel}
                  isLoading={isCancelling}
                >
                  {t('confirm_cancel')}
                </Bouton>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
