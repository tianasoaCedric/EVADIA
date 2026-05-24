'use client'

import { useState, useEffect } from 'react'
import { Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useOnScreen } from '@/hooks/useOnScreen'
import Bouton from './Bouton'
import { useDevise } from '@/app/context/DeviseContext'

interface ReservationProps {
    /** Prix par nuit (fallback) */
    pricePerNight: number
    /** Prix en MGA */
    prixMga?: number
    /** Prix en EUR */
    prixEur?: number
    /** Pourcentage de réduction (optionnel) */
    discountPercent?: number
    /** Frais de service (optionnel) */
    serviceFees?: number
    /** Nom de la chambre */
    roomName?: string
    /** Callback lors de la réservation */
    onReserve?: (data: ReservationData) => void
    /** Dates déjà réservées */
    bookedDates?: string[]
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
    prixMga,
    prixEur,
    discountPercent = 0,
    serviceFees = 0,
    roomName,
    onReserve,
    bookedDates = []
}: ReservationProps) {
    const t = useTranslations('Reservation')
    const { getPrix, symbole } = useDevise()
    const effectivePrice = getPrix(prixMga, prixEur) ?? pricePerNight
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedCheckIn, setSelectedCheckIn] = useState<Date | null>(null)
    const [selectedCheckOut, setSelectedCheckOut] = useState<Date | null>(null)
    const [guests, setGuests] = useState(2)
    const [isClient, setIsClient] = useState(false)

    const [setReservationRef, isReservationVisible] = useOnScreen({ threshold: 0.2 })

    useEffect(() => {
        setIsClient(true)
    }, [])

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const startingDayOfWeek = firstDay.getDay()
        
        const days = []
        let startOffset = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1
        for (let i = 0; i < startOffset; i++) days.push(null)
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i))
        return days
    }

    const getMonthName = (date: Date) => {
        return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    }

    const isDateBooked = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0]
        return bookedDates.includes(dateStr)
    }

    const isDateInRange = (date: Date) => {
        if (!selectedCheckIn || !selectedCheckOut) return false
        return date > selectedCheckIn && date < selectedCheckOut
    }

    const isSelected = (date: Date) => {
        if (selectedCheckIn && date.toDateString() === selectedCheckIn.toDateString()) return true
        if (selectedCheckOut && date.toDateString() === selectedCheckOut.toDateString()) return true
        return false
    }

    const handleDateClick = (date: Date) => {
        if (isDateBooked(date)) return
        
        if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
            setSelectedCheckIn(date)
            setSelectedCheckOut(null)
        } else if (selectedCheckIn && !selectedCheckOut) {
            if (date > selectedCheckIn) {
                setSelectedCheckOut(date)
            } else {
                setSelectedCheckIn(date)
                setSelectedCheckOut(null)
            }
        }
    }

    const getDayClass = (date: Date | null) => {
        if (!date) return 'invisible'
        if (isDateBooked(date)) return 'text-gray-300 line-through cursor-not-allowed'
        if (isSelected(date)) return 'bg-[#01BDA5] text-white rounded-full font-semibold'
        if (isDateInRange(date)) return 'bg-[#01BDA5]/10 text-gray-800 rounded-full'
        return 'hover:bg-gray-100 rounded-full'
    }

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    }

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    }

    const nights = selectedCheckIn && selectedCheckOut 
        ? Math.ceil((selectedCheckOut.getTime() - selectedCheckIn.getTime()) / (1000 * 60 * 60 * 24))
        : 0
    
    const subtotal = effectivePrice * nights
    const discountAmount = discountPercent > 0 ? (subtotal * discountPercent) / 100 : 0
    const total = subtotal - discountAmount + serviceFees

    const formatDate = (date: Date | null): string => {
        if (!date) return ''
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
    }

    const handleReserve = () => {
        if (!selectedCheckIn || !selectedCheckOut) return
        const reservationData: ReservationData = {
            checkIn: selectedCheckIn,
            checkOut: selectedCheckOut,
            guests,
            pricePerNight: effectivePrice,
            discountPercent,
            serviceFees,
            subtotal,
            discountAmount,
            total
        }
        onReserve?.(reservationData)
    }

    const days = getDaysInMonth(currentMonth)
    const weekDays = [
        { key: 'mon', label: 'L' },
        { key: 'tue', label: 'M' },
        { key: 'wed', label: 'M' },
        { key: 'thu', label: 'J' },
        { key: 'fri', label: 'V' },
        { key: 'sat', label: 'S' },
        { key: 'sun', label: 'D' }
    ]

    return (
        <div
            ref={setReservationRef}
            className={`bg-white border-l border-gray-200 p-4 transition-all duration-700 ease-out ${
                isReservationVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
        >
            {/* Prix et offre */}
            <div className="mb-3">
                <div className="flex items-baseline justify-between">
                    <span className="text-xl font-bold text-gray-900">
                        {effectivePrice.toLocaleString('fr-FR')} {symbole} <span className="text-xs font-medium text-gray-500">{t('per_night')}</span>
                    </span>
                    {discountPercent > 0 && (
                        <span className="px-2 py-0.5 bg-[#01BDA5] text-white text-xs font-medium rounded-full">
                            -{discountPercent}%
                        </span>
                    )}
                </div>
                {discountPercent > 0 && (
                    <p className="text-xs text-gray-400 line-through mt-0.5">
                        {(effectivePrice * (1 + discountPercent / 100)).toLocaleString('fr-FR')} {symbole} {t('per_night')}
                    </p>
                )}
            </div>

            {/* Séparateur */}
            <div className="border-t border-gray-100 my-3"></div>

            {/* Calendrier compact */}
            <div className="mb-3">
                <div className="flex items-center justify-between m-8">
                    <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <ChevronLeft className="w-3 h-3 text-gray-500" />
                    </button>
                    <span className="text-xs font-medium text-gray-700">{getMonthName(currentMonth)}</span>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <ChevronRight className="w-3 h-3 text-gray-500" />
                    </button>
                </div>
                
                <div className="grid grid-cols-7 gap-0 mb-0.5">
                    {weekDays.map(day => (
                        <div key={day.key} className="text-center w-10 h-10 text-[9px] font-medium text-gray-400 py-0.5">
                            {day.label}
                        </div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 gap-0.5">  
                    {days.map((date, index) => (
                        <button
                            key={index}
                            onClick={() => date && handleDateClick(date)}
                            disabled={date ? isDateBooked(date) : true}
                            className={`
                                text-[11px] w-10 h-10 aspect-square flex items-center justify-center
                                transition-all duration-150
                                ${getDayClass(date)}
                            `}
                        >
                            {date ? date.getDate() : ''}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dates sélectionnées */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2 mb-3">
                <div className="text-center flex-1">
                    <p className="text-[10px] text-gray-400 uppercase">{t('check_in')}</p>
                    <p className="text-xs font-medium text-gray-800">
                        {selectedCheckIn ? formatDate(selectedCheckIn) : '—'}
                    </p>
                </div>
                <div className="text-gray-300 text-xs">→</div>
                <div className="text-center flex-1">
                    <p className="text-[10px] text-gray-400 uppercase">{t('check_out')}</p>
                    <p className="text-xs font-medium text-gray-800">
                        {selectedCheckOut ? formatDate(selectedCheckOut) : '—'}
                    </p>
                </div>
                {nights > 0 && (
                    <div className="text-center px-2">
                        <p className="text-[10px] text-gray-400">Nuits</p>
                        <p className="text-xs font-semibold text-[#01BDA5]">{nights}</p>
                    </div>
                )}
            </div>

            {/* Nombre de voyageurs */}
            <div className="flex items-baseline justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                    {t('guests')}
                </label>
                <div className="relative">
                    <Users className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input
                        type="number"
                        value={guests}
                        onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
                        min={1}
                        max={10}
                        className="w-16 pl-6 py-1 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#01BDA5] focus:border-transparent text-center"
                    />
                </div>
            </div>

            {/* Détails des prix */}
            {nights > 0 && (
                <>
                    <div className="border-t border-gray-100 my-3"></div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>{t('stay', { nights })}</span>
                            <span>{subtotal.toLocaleString('fr-FR')} {symbole}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>{t('service_fees')}</span>
                            <span>{serviceFees.toLocaleString('fr-FR')} {symbole}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-xs text-green-600">
                                <span>{t('discount', { percent: discountPercent })}</span>
                                <span>-{discountAmount.toLocaleString('fr-FR')} {symbole}</span>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Séparateur */}
            <div className="border-t border-gray-200 my-3"></div>

            {/* Total */}
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-gray-900">{t('total')}</span>
                <span className="text-lg font-bold text-gray-900">
                    {total.toLocaleString('fr-FR')} {symbole}
                </span>
            </div>

            {/* Bouton Réserver */}
            <Bouton
                variant="primary"
                size="medium"
                widthMode="full"
                onClick={handleReserve}
                disabled={!selectedCheckIn || !selectedCheckOut}
            >
                {t('book_button')}
            </Bouton>
        </div>
    )
}