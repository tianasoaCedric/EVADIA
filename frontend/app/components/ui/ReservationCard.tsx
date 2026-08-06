'use client'

import { useTranslations } from 'next-intl'
import { Calendar, Users, Clock, Download, Eye, XCircle, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { Reservation } from '@/lib/types'

interface ReservationCardProps {
  reservation: Reservation
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
  canCancel,
}: ReservationCardProps) {
  const t = useTranslations('Reservations')

  const getStatusBadge = () => {
    const statuses = {
      en_attente: { icon: <Clock className="w-4 h-4" />, text: t('status_en_attente'), className: 'bg-yellow-100 text-yellow-700' },
      acceptee: { icon: <CheckCircle className="w-4 h-4" />, text: t('status_acceptee'), className: 'bg-green-100 text-green-700' },
      refusee: { icon: <XCircle className="w-4 h-4" />, text: t('status_refusee'), className: 'bg-red-100 text-red-700' },
      annulee: { icon: <XCircle className="w-4 h-4" />, text: t('status_annulee'), className: 'bg-gray-100 text-gray-700' },
      terminee: { icon: <CheckCircle className="w-4 h-4" />, text: t('status_terminee'), className: 'bg-blue-100 text-blue-700' },
    }
    return statuses[reservation.statut]
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const hotelName = reservation.propriete?.hotel?.nom ?? '—'
  const hotelId = reservation.propriete?.hotel?.id
  const roomName = reservation.propriete?.nom ?? '—'
  const imageUrl = reservation.propriete?.photo_principale?.url_photo || '/photos/hotels/ecolodge-1.jpg'
  const totalPrice = Number(reservation.prix_total ?? 0)
  const nights = Math.max(
    1,
    Math.round((new Date(reservation.date_fin).getTime() - new Date(reservation.date_debut).getTime()) / (1000 * 60 * 60 * 24)),
  )
  const statusBadge = getStatusBadge()

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative w-full md:w-48 h-48 md:h-auto">
          <Image src={imageUrl} alt={hotelName} fill className="object-cover" />
        </div>

        {/* Contenu */}
        <div className="flex-1 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {hotelId ? (
                  <Link href={`/hotel/${hotelId}`} className="text-xl font-semibold text-gray-800 hover:text-[#01BDA5] transition-colors">
                    {hotelName}
                  </Link>
                ) : (
                  <span className="text-xl font-semibold text-gray-800">{hotelName}</span>
                )}
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.className}`}>
                  {statusBadge.icon}
                  {statusBadge.text}
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-2">{roomName}</p>
              <p className="text-xs text-gray-400">{t('code')} {reservation.code_reservation}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {totalPrice.toLocaleString('fr-FR')} {reservation.devise_prix_total ?? 'MGA'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 py-4 border-y border-gray-100">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-500">{t('check_in')}</p>
                <p className="font-medium text-gray-800">{formatDate(reservation.date_debut)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-500">{t('check_out')}</p>
                <p className="font-medium text-gray-800">{formatDate(reservation.date_fin)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-500">{t('guests')}</p>
                <p className="font-medium text-gray-800">{reservation.nb_adultes + (reservation.nb_enfants ?? 0)} {t('persons')}</p>
              </div>
            </div>
          </div>

          {reservation.statut === 'refusee' && reservation.raison_refus && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{reservation.raison_refus}</p>
          )}

          <div className="flex flex-wrap gap-4 mt-4">
            <span className="text-xs text-gray-400">
              {t('reserved_on')} {formatDate(reservation.date_reservation)}
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

            {reservation.statut === 'acceptee' && (
              <button
                onClick={onDownloadInvoice}
                className="flex items-center gap-1 px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:border-[#01BDA5] hover:text-[#01BDA5] transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                {t('download_invoice')}
              </button>
            )}

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
