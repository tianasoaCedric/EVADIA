'use client'

import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'

interface ReservationDetailsModalProps {
  reservation: {
    id: number
    hotelName: string
    roomName: string
    checkIn: string
    checkOut: string
    guests: number
    nights: number
    pricePerNight: number
    totalPrice: number
    paymentMethod: string
    createdAt: string
    cancellationDeadline: string
    status: string
  }
  onClose: () => void
}

export default function ReservationDetailsModal({ reservation, onClose }: ReservationDetailsModalProps) {
  const t = useTranslations('Reservations')

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

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
                <p className="font-medium">{reservation.hotelName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('room')}</p>
                <p className="font-medium">{reservation.roomName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('check_in')}</p>
                <p className="font-medium">{formatDate(reservation.checkIn)} (15:00)</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('check_out')}</p>
                <p className="font-medium">{formatDate(reservation.checkOut)} (11:00)</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('nights')}</p>
                <p className="font-medium">{reservation.nights} {t('nights')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('guests')}</p>
                <p className="font-medium">{reservation.guests} {t('persons')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('payment_method')}</p>
                <p className="font-medium">{reservation.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('reservation_date')}</p>
                <p className="font-medium">{formatDate(reservation.createdAt)}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <p className="text-gray-500">{t('price_per_night')}</p>
                <p className="font-medium">{reservation.pricePerNight.toLocaleString('fr-FR')} Ar</p>
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-gray-500">{t('total_price')}</p>
                <p className="text-xl font-bold text-gray-900">{reservation.totalPrice.toLocaleString('fr-FR')} Ar</p>
              </div>
            </div>
            
            {reservation.status === 'confirmed' && (
              <div className="bg-yellow-50 rounded-xl p-4">
                <p className="text-sm text-yellow-700">
                  {t('cancellation_deadline', { date: formatDate(reservation.cancellationDeadline) })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}