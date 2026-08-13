'use client'

import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'
import Bouton from './Bouton'
import type { ReservationData } from './Reservation'

interface ReservationConfirmModalProps {
  data: ReservationData
  roomName: string
  isSubmitting?: boolean
  depositPercent?: number
  onConfirm: () => void
  onClose: () => void
}

export default function ReservationConfirmModal({
  data,
  roomName,
  isSubmitting = false,
  depositPercent,
  onConfirm,
  onClose,
}: ReservationConfirmModalProps) {
  const t = useTranslations('ReservationConfirm')

  const formatDate = (date: Date) =>
    date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  const nights = Math.max(
    1,
    Math.round((data.checkOut.getTime() - data.checkIn.getTime()) / (1000 * 60 * 60 * 24)),
  )

  const hasDeposit = !!depositPercent && depositPercent > 0
  const depositAmount = hasDeposit ? Math.round((data.total * depositPercent!) / 100 * 100) / 100 : 0
  const balanceDue = hasDeposit ? data.total - depositAmount : 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={isSubmitting ? undefined : onClose}
    >
      <div
        className="relative max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10 disabled:opacity-50"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-1">{t('title')}</h3>
          <p className="text-sm text-gray-500 mb-4">{roomName}</p>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400 uppercase">{t('check_in')}</p>
                <p className="text-sm font-medium text-gray-800">{formatDate(data.checkIn)}</p>
              </div>
              <div className="text-gray-300 text-sm">→</div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase">{t('check_out')}</p>
                <p className="text-sm font-medium text-gray-800">{formatDate(data.checkOut)}</p>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t('nights')}</span>
              <span className="font-medium text-gray-800">{nights}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t('guests')}</span>
              <span className="font-medium text-gray-800">{data.guests}</span>
            </div>
          </div>

          <div className="border-t border-gray-100 mt-4 pt-4 space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{t('stay', { nights })}</span>
              <span>{data.subtotal.toLocaleString('fr-FR')} {data.devise}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{t('service_fees')}</span>
              <span>{data.serviceFees.toLocaleString('fr-FR')} {data.devise}</span>
            </div>
            {data.discountAmount > 0 && (
              <div className="flex justify-between text-xs text-green-600">
                <span>{t('discount', { percent: data.discountPercent })}</span>
                <span>-{data.discountAmount.toLocaleString('fr-FR')} {data.devise}</span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-900">{t('total')}</span>
            <span className="text-lg font-bold text-gray-900">
              {data.total.toLocaleString('fr-FR')} {data.devise}
            </span>
          </div>

          {hasDeposit && (
            <div className="bg-[#01BDA5]/10 border border-[#01BDA5]/30 rounded-xl p-4 mt-4">
              <p className="text-sm font-semibold text-[#01BDA5] mb-2">
                {t('deposit_required', { percent: depositPercent })}
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('deposit_amount')}</span>
                <span className="font-semibold text-gray-900">
                  {depositAmount.toLocaleString('fr-FR')} {data.devise}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">{t('balance_due')}</span>
                <span className="font-medium text-gray-700">
                  {balanceDue.toLocaleString('fr-FR')} {data.devise}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Bouton variant="secondary" size="medium" widthMode="full" onClick={onClose} disabled={isSubmitting}>
              {t('cancel')}
            </Bouton>
            <Bouton
              variant="primary"
              size="medium"
              widthMode="full"
              onClick={onConfirm}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {t('confirm')}
            </Bouton>
          </div>
        </div>
      </div>
    </div>
  )
}
