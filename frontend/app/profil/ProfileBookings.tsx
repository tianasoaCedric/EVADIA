'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Calendar, MapPin, Clock, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'


interface Booking {
  id: number
  hotelName: string
  city: string
  checkIn: string
  checkOut: string
  guests: number
  price: number
  status: 'confirmed' | 'pending' | 'cancelled'
  imageUrl: string
  roomName?: string
  nights?: number
  paymentMethod?: string
  createdAt?: string
  cancellationDeadline?: string
}

// Données mock
const mockBookings: Booking[] = [
  {
    id: 1,
    hotelName: 'Hôtel Le Meurice',
    city: 'Paris',
    checkIn: '2026-06-15',
    checkOut: '2026-06-18',
    guests: 2,
    price: 1350000,
    status: 'confirmed',
    imageUrl: '/photos/hotels/ecolodge-1.jpg',
    roomName: 'Suite de Luxe',
    nights: 3,
    paymentMethod: 'Visa •••• 4242',
    createdAt: '2026-05-01',
    cancellationDeadline: '2026-06-08',
  },
  {
    id: 2,
    hotelName: 'Villa de Rêve',
    city: 'Malé',
    checkIn: '2026-08-01',
    checkOut: '2026-08-08',
    guests: 4,
    price: 1750000,
    status: 'pending',
    imageUrl: '/photos/hotels/villa-1.jpg',
    roomName: 'Villa 4 chambres',
    nights: 7,
    paymentMethod: 'PayPal',
    createdAt: '2026-05-10',
    cancellationDeadline: '2026-07-25',
  },
  {
    id: 3,
    hotelName: 'Palace Hôtel',
    city: 'Antananarivo',
    checkIn: '2026-07-10',
    checkOut: '2026-07-12',
    guests: 2,
    price: 900000,
    status: 'cancelled',
    imageUrl: '/photos/hotels/luxe-1.jpg',
    roomName: 'Chambre Royale',
    nights: 2,
    paymentMethod: 'Mastercard •••• 5555',
    createdAt: '2026-05-15',
    cancellationDeadline: '2026-07-03',
  },
]

export default function ProfileBookings() {
  const t = useTranslations('ProfileBookings')
  const [filter, setFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const filteredBookings = mockBookings.filter(booking => {
    if (filter === 'all') return true
    return booking.status === filter
  })

  const getStatusBadge = (status: string) => {
    const statuses = {
      confirmed: { text: t('status_confirmed'), className: 'bg-green-100 text-green-700' },
      pending: { text: t('status_pending'), className: 'bg-yellow-100 text-yellow-700' },
      cancelled: { text: t('status_cancelled'), className: 'bg-red-100 text-red-700' },
    }
    return statuses[status as keyof typeof statuses] || statuses.pending
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getPricePerNight = (booking: Booking) => {
    return Math.round(booking.price / (booking.nights || 1))
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">{t('title')}</h2>
          <Link
            href="/reservations"
            className="text-[#01BDA5] text-sm font-medium hover:underline"
          >
            {t('view_all')}
          </Link>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-6">
          {['all', 'confirmed', 'pending', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === status
                  ? 'bg-[#01BDA5] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t(`filter_${status}`)}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const statusBadge = getStatusBadge(booking.status)
            return (
              <div
                key={booking.id}
                className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={booking.imageUrl}
                    alt={booking.hotelName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{booking.hotelName}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{booking.city}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.className}`}>
                      {statusBadge.text}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{booking.checkIn} → {booking.checkOut}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{t('nights', { nights: booking.nights || 3 })}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-gray-900">
                      {booking.price.toLocaleString('fr-FR')} Ar
                    </span>
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="flex items-center gap-1 text-[#01BDA5] text-sm font-medium hover:underline"
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
              className="inline-block mt-3 text-[#01BDA5] text-sm font-medium hover:underline"
            >
              {t('discover_hotels')}
            </button>
          </div>
        )}
      </div>

      {/* Modal des détails */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedBooking(null)}>
          <div className="relative max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedBooking(null)}
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
                    <p className="font-medium">{selectedBooking.hotelName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('room')}</p>
                    <p className="font-medium">{selectedBooking.roomName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('check_in')}</p>
                    <p className="font-medium">{formatDate(selectedBooking.checkIn)} (15:00)</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('check_out')}</p>
                    <p className="font-medium">{formatDate(selectedBooking.checkOut)} (11:00)</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('nights')}</p>
                    <p className="font-medium">{selectedBooking.nights || 3} {t('nights')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('guests')}</p>
                    <p className="font-medium">{selectedBooking.guests} {t('persons')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('payment_method')}</p>
                    <p className="font-medium">{selectedBooking.paymentMethod || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('reservation_date')}</p>
                    <p className="font-medium">{selectedBooking.createdAt ? formatDate(selectedBooking.createdAt) : '-'}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between">
                    <p className="text-gray-500">{t('price_per_night')}</p>
                    <p className="font-medium">{getPricePerNight(selectedBooking).toLocaleString('fr-FR')} Ar</p>
                  </div>
                  <div className="flex justify-between mt-2">
                    <p className="text-gray-500">{t('total_price')}</p>
                    <p className="text-xl font-bold text-gray-900">{selectedBooking.price.toLocaleString('fr-FR')} Ar</p>
                  </div>
                </div>
                
                {selectedBooking.status === 'confirmed' && selectedBooking.cancellationDeadline && (
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <p className="text-sm text-yellow-700">
                      {t('cancellation_deadline', { date: formatDate(selectedBooking.cancellationDeadline) })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}