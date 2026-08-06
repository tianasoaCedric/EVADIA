'use client'

import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'
import type { Reservation } from '@/lib/types'

interface ReservationDetailsModalProps {
  reservation: Reservation
  onClose: () => void
}

export default function ReservationDetailsModal({ reservation, onClose }: ReservationDetailsModalProps) {
  const t = useTranslations('Reservations')

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const hotelName = reservation.propriete?.hotel?.nom ?? '—'
  const roomName = reservation.propriete?.nom ?? '—'
  const totalPrice = Number(reservation.prix_total ?? 0)
  const devise = reservation.devise_prix_total ?? 'MGA'
  const nights = Math.max(
    1,
    Math.round((new Date(reservation.date_fin).getTime() - new Date(reservation.date_debut).getTime()) / (1000 * 60 * 60 * 24)),
  )
  const pricePerNight = nights > 0 ? totalPrice / nights : totalPrice

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('details_title')}</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('hotel')}</p>
                <p className="font-medium">{hotelName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('room')}</p>
                <p className="font-medium">{roomName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('check_in')}</p>
                <p className="font-medium">{formatDate(reservation.date_debut)} (15:00)</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('check_out')}</p>
                <p className="font-medium">{formatDate(reservation.date_fin)} (11:00)</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('nights')}</p>
                <p className="font-medium">{nights} {t('nights')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('guests')}</p>
                <p className="font-medium">{reservation.nb_adultes + (reservation.nb_enfants ?? 0)} {t('persons')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('code')}</p>
                <p className="font-medium">{reservation.code_reservation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('reservation_date')}</p>
                <p className="font-medium">{formatDate(reservation.date_reservation)}</p>
              </div>
            </div>

            {reservation.demande_speciale && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500">{t('special_request')}</p>
                <p className="font-medium">{reservation.demande_speciale}</p>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <p className="text-gray-500">{t('price_per_night')}</p>
                <p className="font-medium">{pricePerNight.toLocaleString('fr-FR')} {devise}</p>
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-gray-500">{t('total_price')}</p>
                <p className="text-xl font-bold text-gray-900">{totalPrice.toLocaleString('fr-FR')} {devise}</p>
              </div>
            </div>

            {reservation.statut === 'en_attente' && (
              <div className="bg-yellow-50 rounded-xl p-4">
                <p className="text-sm text-yellow-700">{t('pending_hotel_response')}</p>
              </div>
            )}

            {reservation.statut === 'refusee' && reservation.raison_refus && (
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-sm text-red-700">{reservation.raison_refus}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
