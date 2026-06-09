'use client'

import { useTranslations } from 'next-intl'
import { Calendar, MapPin, Users, Clock, CreditCard, Download, Eye, XCircle, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface ReservationCardProps {
  reservation: {
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
  onViewDetails: () => void
  onDownloadInvoice: () => void
  onCancel: () => void
  canCancel: boolean
}

export default function ReservationCard({ 
  reservation, 
  onViewDetails, 
  onDownloadInvoice, 
  onCancel, 
  canCancel 
}: ReservationCardProps) {
  const t = useTranslations('Reservations')

  const getStatusBadge = () => {
    const statuses = {
      confirmed: { icon: <CheckCircle className="w-4 h-4" />, text: t('status_confirmed'), className: 'bg-green-100 text-green-700' },
      pending: { icon: <Clock className="w-4 h-4" />, text: t('status_pending'), className: 'bg-yellow-100 text-yellow-700' },
      cancelled: { icon: <XCircle className="w-4 h-4" />, text: t('status_cancelled'), className: 'bg-red-100 text-red-700' },
      completed: { icon: <CheckCircle className="w-4 h-4" />, text: t('status_completed'), className: 'bg-blue-100 text-blue-700' },
    }
    return statuses[reservation.status]
  }

  const getPaymentStatusBadge = () => {
    const statuses = {
      paid: { text: t('payment_paid'), className: 'bg-green-100 text-green-700' },
      pending: { text: t('payment_pending'), className: 'bg-yellow-100 text-yellow-700' },
      refunded: { text: t('payment_refunded'), className: 'bg-gray-100 text-gray-700' },
    }
    return statuses[reservation.paymentStatus]
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const statusBadge = getStatusBadge()
  const paymentBadge = getPaymentStatusBadge()

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative w-full md:w-48 h-48 md:h-auto">
          <Image
            src={reservation.imageUrl}
            alt={reservation.hotelName}
            fill
            className="object-cover"
          />
        </div>
        
        {/* Contenu */}
        <div className="flex-1 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link href={`/hotel/${reservation.hotelId}`} className="text-xl font-semibold text-gray-800 hover:text-[#01BDA5] transition-colors">
                  {reservation.hotelName}
                </Link>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.className}`}>
                  {statusBadge.icon}
                  {statusBadge.text}
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-2">{reservation.roomName}</p>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{reservation.city}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {reservation.totalPrice.toLocaleString('fr-FR')} Ar
              </p>
              <p className="text-sm text-gray-500">
                {reservation.pricePerNight.toLocaleString('fr-FR')} Ar / nuit
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 py-4 border-y border-gray-100">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-500">{t('check_in')}</p>
                <p className="font-medium text-gray-800">{formatDate(reservation.checkIn)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-500">{t('check_out')}</p>
                <p className="font-medium text-gray-800">{formatDate(reservation.checkOut)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-500">{t('guests')}</p>
                <p className="font-medium text-gray-800">{reservation.guests} {t('persons')}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${paymentBadge.className}`}>
              <CreditCard className="w-3 h-3" />
              {paymentBadge.text}
            </div>
            <span className="text-xs text-gray-400">
              {t('reserved_on')} {formatDate(reservation.createdAt)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={onViewDetails}
              className="flex items-center gap-1 px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:border-[#01BDA5] hover:text-[#01BDA5] transition-colors text-sm"
            >
              <Eye className="w-4 h-4" />
              {t('view_details')}
            </button>
            
            <button
              onClick={onDownloadInvoice}
              className="flex items-center gap-1 px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:border-[#01BDA5] hover:text-[#01BDA5] transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              {t('download_invoice')}
            </button>
            
            {canCancel && (
              <button
                onClick={onCancel}
                className="flex items-center gap-1 px-4 py-2 rounded-full border border-red-300 text-red-600 hover:bg-red-50 transition-colors text-sm"
              >
                <XCircle className="w-4 h-4" />
                {t('cancel_reservation')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}