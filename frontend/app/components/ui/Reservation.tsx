'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useOnScreen } from '@/hooks/useOnScreen'
import Bouton from './Bouton'

interface ReservationProps {
    /** Prix par nuit */
    pricePerNight: number
    /** Pourcentage de réduction (optionnel) */
    discountPercent?: number
    /** Frais de service (optionnel) */
    serviceFees?: number
    /** Nom de la chambre */
    roomName?: string
    /** Callback lors de la réservation */
    onReserve?: (data: ReservationData) => void
}

export interface ReservationData {
    checkIn: Date
    checkOut: Date
    guests: number
    pricePerNight: number
    discountPercent: number
    serviceFees: number
    subtotal: number
    discountAmount: number
    total: number
}

export default function Reservation({
    pricePerNight,
    discountPercent = 0,
    serviceFees = 0,
    roomName,
    onReserve
}: ReservationProps) {
    const t = useTranslations('Reservation')
    const [checkIn, setCheckIn] = useState<Date>(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return today
    })
    const [checkOut, setCheckOut] = useState<Date>(() => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        return tomorrow
    })
    const [guests, setGuests] = useState(2)
    const [isClient, setIsClient] = useState(false)

    // Animation au scroll
    const [setReservationRef, isReservationVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })

    useEffect(() => {
        setIsClient(true)
    }, [])

    // Calcul du nombre de nuits
    const calculateNights = (): number => {
        const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const nights = calculateNights()
    const subtotal = pricePerNight * nights
    const discountAmount = discountPercent > 0 ? (subtotal * discountPercent) / 100 : 0
    const total = subtotal - discountAmount + serviceFees

    const formatDate = (date: Date): string => {
        if (!isClient) return ''
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
    }

    const handleReserve = () => {
        const reservationData: ReservationData = {
            checkIn,
            checkOut,
            guests,
            pricePerNight,
            discountPercent,
            serviceFees,
            subtotal,
            discountAmount,
            total
        }
        onReserve?.(reservationData)
    }

    return (
        <div
            ref={setReservationRef}
            className={`bg-white border-l-1 border-gray-200 p-6 transition-all duration-700 ease-out ${
                isReservationVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
        >
            {/* Prix et offre */}
            <div className="mb-4">
                <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                        {pricePerNight.toLocaleString('fr-FR')} Ar <span className="text-lg font-medium text-gray-500">{t('per_night')}</span>
                    </span>

                    {discountPercent > 0 && (
                        <span className="ml-2 px-2 py-1.5 bg-[#01BDA5] text-white text-sm font-medium rounded-full">
                            {t('offer')} -{discountPercent}%
                        </span>
                    )}
                </div>
                {discountPercent > 0 && (
                    <p className="text-sm text-gray-500 line-through mt-1">
                        {(pricePerNight * (1 + discountPercent / 100)).toLocaleString('fr-FR')} Ar {t('per_night')}
                    </p>
                )}
            </div>

            {/* Séparateur */}
            <div className="border-t border-gray-100 my-4"></div>

            <div className="space-y-4">
                {/* Check In */}
                <div className='flex items-center justify-between'>
                    <label className="block text-md font-medium text-gray-700 mb-1">
                        {t('check_in')}
                    </label>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                const input = document.getElementById(`checkin-${roomName?.replace(/\s/g, '') || 'default'}`)
                                ;(input as HTMLInputElement)?.showPicker?.()
                            }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer z-10"
                        >
                            <Calendar className="w-5 h-5 text-gray-400 hover:text-[#01BDA5] transition-colors" />
                        </button>
                        <input
                            id={`checkin-${roomName?.replace(/\s/g, '') || 'default'}`}
                            type="date"
                            value={isClient ? checkIn.toISOString().split('T')[0] : ''}
                            onChange={(e) => {
                                const newDate = new Date(e.target.value)
                                newDate.setHours(0, 0, 0, 0)
                                setCheckIn(newDate)
                                if (newDate >= checkOut) {
                                    const newCheckOut = new Date(newDate)
                                    newCheckOut.setDate(newCheckOut.getDate() + 1)
                                    setCheckOut(newCheckOut)
                                }
                            }}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full pl-10 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01BDA5] focus:border-transparent [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        />
                    </div>
                </div>

                {/* Check Out */}
                <div className='flex items-center justify-between'>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('check_out')}
                    </label>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                const input = document.getElementById(`checkout-${roomName?.replace(/\s/g, '') || 'default'}`)
                                ;(input as HTMLInputElement)?.showPicker?.()
                            }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer z-10"
                        >
                            <Calendar className="w-5 h-5 text-gray-400 hover:text-[#01BDA5] transition-colors" />
                        </button>
                        <input
                            id={`checkout-${roomName?.replace(/\s/g, '') || 'default'}`}
                            type="date"
                            value={isClient ? checkOut.toISOString().split('T')[0] : ''}
                            onChange={(e) => {
                                const newDate = new Date(e.target.value)
                                newDate.setHours(0, 0, 0, 0)
                                setCheckOut(newDate)
                            }}
                            min={checkIn.toISOString().split('T')[0]}
                            className="w-full pl-10 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01BDA5] focus:border-transparent [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        />
                    </div>
                </div>

                {/* Nombre de voyageurs */}
                <div className="flex items-baseline justify-between">
                    <label className="block text-md font-medium text-gray-700 mb-1">
                        {t('guests')}
                    </label>
                    <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="number"
                            value={guests}
                            onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
                            min={1}
                            max={10}
                            className="w-24 pl-10 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01BDA5] focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Séparateur */}
            <div className="border-t border-gray-100 my-4"></div>

            {/* Détails des prix */}
            <div className="space-y-2">
                <div className="flex justify-between text-gray-600 pr-8 py-2">
                    <span>{t('stay', { nights })}</span>
                    <span>{subtotal.toLocaleString('fr-FR')} Ar</span>
                </div>
                <div className="flex justify-between text-gray-600 pr-8 py-2">
                    <span>{t('service_fees')}</span>
                    <span>{serviceFees.toLocaleString('fr-FR')} Ar</span>
                </div>
                {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 pr-8 py-2">
                        <span>{t('discount', { percent: discountPercent })}</span>
                        <span>-{discountAmount.toLocaleString('fr-FR')} Ar</span>
                    </div>
                )}
            </div>

            {/* Séparateur */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Total */}
            <div className="flex justify-between items-center mb-6 pr-8">
                <span className="text-lg font-semibold text-gray-900">{t('total')}</span>
                <span className="text-2xl font-bold text-gray-900">
                    {total.toLocaleString('fr-FR')} Ar
                </span>
            </div>

            {/* Bouton Réserver */}
            <Bouton
                variant="primary"
                size="medium"
                widthMode="full"
                onClick={handleReserve}
            >
                {t('book_button')}
            </Bouton>
        </div>
    )
}