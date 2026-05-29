'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface OfferCardProps {
  imageUrl: string | string[]
  discount: number
  startDay: number
  endDay: number
  month: string
  hotelName: string
  city: string
  destination: string
  href?: string
  alt?: string
  className?: string
  width?: string
}

const OfferCard = ({
  imageUrl,
  discount,
  startDay,
  endDay,
  month,
  hotelName,
  city,
  destination,
  href,
  alt = '',
  className = '',
  width = 'w-full'
}: OfferCardProps) => {
  const t = useTranslations('OfferCard')
  const [imageError, setImageError] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl]
  const hasMultipleImages = images.length > 1

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

  const cardContent = (
    <div className={`
      bg-white rounded-2xl overflow-hidden 
      transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
      flex flex-col
      ${width}
    `}>
      {/* Carrousel d'images */}
      <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-gray-200">
        {!imageError ? (
          <Image
            src={images[currentImageIndex]}
            fill
            alt={alt || `${hotelName} - ${t('offer')}`}
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Flèches de navigation */}
        {hasMultipleImages && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 cursor-pointer"
              aria-label={t('previous_image')}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 cursor-pointer"
              aria-label={t('next_image')}
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </>
        )}

        {/* Indicateurs */}
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
                aria-label={t('go_to_image', { number: idx + 1 })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-2 sm:p-2 flex flex-col flex-1">
        {/* Badge réduction */}
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <div className="inline-flex items-center gap-1 sm:gap-1.5 bg-[#01BDA5] text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full w-full">
            <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="font-semibold text-md sm:text-md">
              {t('offer_badge', { 
                discount, 
                startDay, 
                endDay, 
                month 
              })}
            </span>
          </div>
        </div>

        {/* Hôtel et ville */}
        <div className="mb-1 sm:mb-2">
          <h3 className="font-bold text-base sm:text-lg text-gray-900">
            {hotelName}, {city}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          {t('description', { destination })}
        </p>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className={`block group ${className}`}>
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

export default OfferCard