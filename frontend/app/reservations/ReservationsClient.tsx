'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronLeft, Calendar } from 'lucide-react'
import Link from 'next/link'
import { authService } from '@/lib/services'
import type { User as UserType } from '@/lib/types'
import ReservationCard from '../components/ui/ReservationCard'
import ReservationFilters from '../components/ui/ReservationFilters'
import ReservationDetailsModal from '../components/ui/ReservationDetailsModal'
import Bouton from '../components/ui/Bouton'
import HeroSection from '../components/ui/HeroSection'
import Loading from '../components/ui/Loading'

interface Reservation {
  id: number
  hotelName: string
  hotelId: number
  roomName: string
  roomId: number
  imageUrl: string
  city: string
  checkIn: string
  checkOut: string
  guests: number
  nights: number
  pricePerNight: number
  totalPrice: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  paymentStatus: 'paid' | 'pending' | 'refunded'
  paymentMethod: string
  createdAt: string
  cancellationDeadline: string
}

// Données mock (à remplacer par appel API)
const mockReservations: Reservation[] = [
  {
    id: 1,
    hotelName: 'Hôtel Le Meurice',
    hotelId: 1,
    roomName: 'Suite de Luxe',
    roomId: 1,
    imageUrl: '/photos/hotels/ecolodge-1.jpg',
    city: 'Paris',
    checkIn: '2026-06-15',
    checkOut: '2026-06-18',
    guests: 2,
    nights: 3,
    pricePerNight: 450000,
    totalPrice: 1350000,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'Visa •••• 4242',
    createdAt: '2026-05-01',
    cancellationDeadline: '2026-06-08',
  },
  {
    id: 2,
    hotelName: 'Villa de Rêve',
    hotelId: 2,
    roomName: 'Villa 4 chambres',
    roomId: 2,
    imageUrl: '/photos/hotels/villa-1.jpg',
    city: 'Malé',
    checkIn: '2026-08-01',
    checkOut: '2026-08-08',
    guests: 4,
    nights: 7,
    pricePerNight: 250000,
    totalPrice: 1750000,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'PayPal',
    createdAt: '2026-05-10',
    cancellationDeadline: '2026-07-25',
  },
  {
    id: 3,
    hotelName: 'Palace Hôtel',
    hotelId: 3,
    roomName: 'Chambre Royale',
    roomId: 3,
    imageUrl: '/photos/hotels/luxe-1.jpg',
    city: 'Antananarivo',
    checkIn: '2026-07-10',
    checkOut: '2026-07-12',
    guests: 2,
    nights: 2,
    pricePerNight: 450000,
    totalPrice: 900000,
    status: 'cancelled',
    paymentStatus: 'refunded',
    paymentMethod: 'Mastercard •••• 5555',
    createdAt: '2026-05-15',
    cancellationDeadline: '2026-07-03',
  },
  {
    id: 4,
    hotelName: 'Ecolodge de la Forêt',
    hotelId: 4,
    roomName: 'Chambre Nature',
    roomId: 4,
    imageUrl: '/photos/hotels/ecolodge-2.jpg',
    city: 'Antsirabe',
    checkIn: '2026-05-20',
    checkOut: '2026-05-22',
    guests: 2,
    nights: 2,
    pricePerNight: 85000,
    totalPrice: 170000,
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'Visa •••• 4242',
    createdAt: '2026-04-20',
    cancellationDeadline: '2026-05-13',
  },
]

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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.me()
        setUser(response.user)
        // Remplacer par appel API réel
        setReservations(mockReservations)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [])

  const filteredReservations = reservations.filter(res => {
    if (filter !== 'all' && res.status !== filter) return false
    if (searchQuery && !res.hotelName.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const canCancel = (reservation: Reservation) => {
    const today = new Date()
    const deadline = new Date(reservation.cancellationDeadline)
    return reservation.status === 'confirmed' && today < deadline
  }

  const handleCancel = async () => {
    if (!selectedReservation) return
    setIsCancelling(true)
    // Appel API pour annuler la réservation
    await new Promise(resolve => setTimeout(resolve, 1000))
    setReservations(reservations.map(r => 
      r.id === selectedReservation.id ? { ...r, status: 'cancelled', paymentStatus: 'refunded' } : r
    ))
    setShowCancelModal(false)
    setCancelReason('')
    setSelectedReservation(null)
    setIsCancelling(false)
  }

  const handleDownloadInvoice = (reservation: Reservation) => {
    console.log('Télécharger facture:', reservation.id)
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
        backgroundImage="/images/hero-reservations.jpg"
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
                {t('cancel_confirmation', { hotel: selectedReservation.hotelName })}
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