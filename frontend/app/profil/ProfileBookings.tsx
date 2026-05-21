'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Données mock
const mockBookings = [
  {
    id: 1,
    hotelName: 'Hôtel Le Meurice',
    city: 'Paris',
    checkIn: '2026-06-15',
    checkOut: '2026-06-18',
    guests: 2,
    price: 450000,
    status: 'confirmed',
    imageUrl: '/photos/hotels/ecolodge-1.jpg',
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
  },
]

export default function ProfileBookings() {
  const t = useTranslations('ProfileBookings')
  const [filter, setFilter] = useState('all')

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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">{t('title')}</h2>
        <Link href="/reservations" className="text-[#01BDA5] text-sm font-medium hover:underline">
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
                    <span>{t('nights', { nights: 3 })}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-gray-900">
                    {booking.price.toLocaleString('fr-FR')} Ar
                  </span>
                  <Link
                    href={`/reservations/${booking.id}`}
                    className="flex items-center gap-1 text-[#01BDA5] text-sm font-medium hover:underline"
                  >
                    {t('details')}
                    <ChevronRight className="w-3 h-3" />
                  </Link>
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
          <Link
            href="/hebergement"
            className="inline-block mt-3 text-[#01BDA5] text-sm font-medium hover:underline"
          >
            {t('discover_hotels')}
          </Link>
        </div>
      )}
    </div>
  )
}