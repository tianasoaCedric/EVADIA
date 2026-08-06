'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Calendar, Clock, X } from 'lucide-react'
import Link from 'next/link'
import { reservationService } from '@/lib/services'
import type { Reservation, StatutReservation } from '@/lib/types'
import Loading from '../components/ui/Loading'

const STATUT_TO_FILTER: Record<StatutReservation, string> = {
  acceptee: 'confirmed',
  en_attente: 'pending',
  refusee: 'rejected',
  annulee: 'cancelled',
  terminee: 'terminated',
}

export default function ProfileBookings() {
  const t = useTranslations('ProfileBookings')
  const [filter, setFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<Reservation | null>(null)
  const [bookings, setBookings] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    reservationService.list({ page: 1 })
      .then(res => setBookings(res.data))
      .catch(() => setBookings([]))
      .finally(() => setIsLoading(false))
  }, [])

  const filteredBookings = bookings.filter(b =>
    filter === 'all' || STATUT_TO_FILTER[b.statut] === filter
  )

  const getStatusBadge = (statut: StatutReservation) => {
    const key = STATUT_TO_FILTER[statut]
    const styles: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-600',
      terminated: 'bg-blue-100 text-blue-700',
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { text: t(`status_${key}` as any), className: styles[key] ?? styles.pending }
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  const getNights = (b: Reservation) =>
    Math.round((new Date(b.date_fin).getTime() - new Date(b.date_debut).getTime()) / 86400000)

  const getHotelName = (b: Reservation) =>
    b.propriete?.hotel?.nom ?? b.hotel?.nom ?? b.propriete?.nom ?? '—'

  const getRoomName = (b: Reservation) =>
    b.propriete?.nom ?? '—'

  const getPrice = (b: Reservation) => b.prix_total ?? b.montant_total ?? 0

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex justify-center py-12">
        <Loading />
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">{t('title')}</h2>
          <Link href="/reservations" className="text-[#01BDA5] text-sm font-medium hover:underline">
            {t('view_all')}
          </Link>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'confirmed', 'pending', 'rejected', 'cancelled', 'terminated'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                filter === status
                  ? 'bg-[#01BDA5] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {t(`filter_${status}` as any)}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const statusBadge = getStatusBadge(booking.statut)
            const nights = getNights(booking)
            const price = getPrice(booking)
            return (
              <div
                key={booking.id}
                className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">{getHotelName(booking)}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{getRoomName(booking)}</p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.className}`}>
                      {statusBadge.text}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{booking.date_debut} → {booking.date_fin}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{nights} {t('nights')}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-gray-900">
                      {price.toLocaleString('fr-FR')} Ar
                    </span>
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="flex items-center gap-1 text-[#01BDA5] text-sm font-medium hover:underline cursor-pointer"
                    >
                      {t('details')}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('no_bookings')}</p>
            <button
              onClick={() => window.location.href = '/hebergement'}
              className="inline-block mt-3 text-[#01BDA5] text-sm font-medium hover:underline cursor-pointer"
            >
              {t('discover_hotels')}
            </button>
          </div>
        )}
      </div>

      {/* Modal des détails */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10 cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('details_title')}</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{t('hotel')}</p>
                    <p className="font-medium">{getHotelName(selectedBooking)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('room')}</p>
                    <p className="font-medium">{getRoomName(selectedBooking)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('check_in')}</p>
                    <p className="font-medium">{formatDate(selectedBooking.date_debut)} (15:00)</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('check_out')}</p>
                    <p className="font-medium">{formatDate(selectedBooking.date_fin)} (11:00)</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('nights')}</p>
                    <p className="font-medium">{getNights(selectedBooking)} {t('nights')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('guests')}</p>
                    <p className="font-medium">{selectedBooking.nb_adultes} {t('persons')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('reservation_date')}</p>
                    <p className="font-medium">{formatDate(selectedBooking.date_reservation ?? selectedBooking.created_at ?? '')}</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between mt-2">
                    <p className="text-gray-500">{t('total_price')}</p>
                    <p className="text-xl font-bold text-gray-900">
                      {getPrice(selectedBooking).toLocaleString('fr-FR')} Ar
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
