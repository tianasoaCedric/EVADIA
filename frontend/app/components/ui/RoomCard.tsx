'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Bed, Bath, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { createSlug } from '@/lib/slug'
import { useTranslations } from 'next-intl'
import { useOnScreen } from '@/hooks/useOnScreen'
import { useDevise } from '@/app/context/DeviseContext'

interface RoomCardProps {
  imageUrl: string | string[]
  name: string
  beds: number
  bathrooms: number
  maxPersons: number
  price: number
  prixMga?: number
  prixEur?: number
  availability?: string
  href?: string
  alt?: string
  className?: string
  width?: string
  onBookClick?: () => void
  hotelId?: number
}

const RoomCard = ({
  imageUrl,
  name,
  beds,
  bathrooms,
  maxPersons,
  price,
  prixMga,
  prixEur,
  availability = 'Disponible',
  href,
  alt = '',
  className = '',
  width = 'w-80 sm:w-96',
  onBookClick,
  hotelId
}: RoomCardProps) => {
  const t = useTranslations('RoomCard')
  const { getPrix, symbole } = useDevise()
  const displayPrice = getPrix(prixMga, prixEur) ?? price
  const [imageError, setImageError] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl]
  const hasMultipleImages = images.length > 1

  const [setCardRef, isCardVisible] = useOnScreen({
    threshold: 0.2,
    triggerOnce: false
  })

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleBookClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onBookClick?.()
  }

  const getTranslatedAvailability = (availabilityText: string): string => {
    const lowerText = availabilityText.toLowerCase()
    if (lowerText.includes('disponible')) return t('available')
    if (lowerText.includes('complet')) return t('fully_booked')
    if (lowerText.includes('places restantes')) {
      const match = availabilityText.match(/(\d+)/)
      const number = match ? match[1] : ''
      return t('remaining_places', { count: number })
    }
    return availabilityText
  }

  const generateHref = () => {
    if (href) return href
    if (hotelId && name) return `/propriete/${createSlug(hotelId, name)}`
    return '#'
  }

  const cardContent = (
    <div
      ref={setCardRef}
      className={`
        bg-white rounded-2xl overflow-hidden 
        transition-all duration-700 ease-out
        flex flex-col
        ${width}
        ${isCardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
      `}
    >
      {/* Carrousel d'images */}
      <div className="relative rounded-2xl h-48 sm:h-56 w-full overflow-hidden bg-gray-200">
        {!imageError ? (
          <Image
            src={images[currentImageIndex]}
            fill
            alt={alt || `${name} - ${t('image')} ${currentImageIndex + 1}`}
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {hasMultipleImages && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 cursor-pointer"
              aria-label={t('previous_image')}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 cursor-pointer"
              aria-label={t('next_image')}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {hasMultipleImages && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setCurrentImageIndex(idx)
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  currentImageIndex === idx
                    ? 'bg-white w-3'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={t('go_to_image', { index: idx + 1 })}
              />
            ))}
          </div>
        )}
        
        {availability && !availability.toLowerCase().includes('disponible') && (
          <div className={`absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-red-500 text-white`}>
            {getTranslatedAvailability(availability)}
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <div className="flex flex-row items-center justify-between gap-2 mb-3">
          <h3 className="font-medium text-lg sm:text-xl text-gray-900 line-clamp-1">
            {name}
          </h3>
          <div className="flex-shrink-0">
            <span className="text-lg sm:text-xl font-medium text-gray-900">
              {displayPrice.toLocaleString('fr-FR')} {symbole}
            </span>
            <span className="text-xs text-gray-500">{t('per_night')}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 mb-4 justify-between">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            <span className="text-xs text-gray-500">{t('beds_label')} :</span>
            <span className="text-sm sm:text-base text-gray-700 font-medium">{beds}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            <span className="text-xs text-gray-500">{t('bathrooms_label')} :</span>
            <span className="text-sm sm:text-base text-gray-700 font-medium">{bathrooms}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            <span className="text-xs text-gray-500">{t('persons_label')} :</span>
            <span className="text-sm sm:text-base text-gray-700 font-medium">{maxPersons}</span>
          </div>
        </div>

        <button
          onClick={handleBookClick}
          className={`
            w-full py-1.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm
            transition-all duration-200 hover:scale-[1.02]
            ${availability.toLowerCase().includes('disponible')
              ? 'bg-[#01BDA5] text-white hover:bg-[#01A38E]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
          disabled={!availability.toLowerCase().includes('disponible')}
        >
          {t('book_button')}
        </button>
      </div>
    </div>
  )

  const linkHref = generateHref()
  
  if (linkHref !== '#') {
    return (
      <Link href={linkHref} className={`block group ${className}`}>
        {cardContent}
      </Link>
    )
  }

  return (
    <div className={`group ${className}`}>
      {cardContent}
    </div>
  )
}

export default RoomCard