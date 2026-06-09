'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react'

interface SpecialOfferCardProps {
  /** URL de l'image de l'offre (peut être unique ou tableau pour carrousel) */
  imageUrl: string | string[]
  /** Pourcentage de réduction */
  discount: number
  /** Date de début de l'offre */
  startDay: number
  /** Date de fin de l'offre */
  endDay: number
  /** Mois de l'offre */
  month: string
  /** Nom de l'hôtel */
  hotelName: string
  /** Ville de l'hôtel */
  city: string
  /** Lien vers la page de l'offre */
  href?: string
  /** Texte alternatif pour l'image */
  alt?: string
  /** Classes CSS supplémentaires */
  className?: string
  /** Largeur de la carte */
  width?: string
  /** Hauteur de l'image */
  imageHeight?: string
  /** Style des bordures arrondies */
  borderRadius?: 'rounded-all' | 'rounded-top-right-bottom-left' | 'rounded-top-left-bottom-right'
}

const SpecialOfferCard = ({
  imageUrl,
  discount,
  startDay,
  endDay,
  month,
  hotelName,
  city,
  href,
  alt = '',
  className = '',
  width = 'w-full sm:w-72 md:w-76',
  imageHeight = 'h-72 sm:h-80',
  borderRadius = 'rounded-all'
}: SpecialOfferCardProps) => {
  const [imageError, setImageError] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const t = useTranslations('SpecialOffres')
  // Convertir en tableau si une seule image est fournie
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

  // Styles de bordures selon la variante
  const borderRadiusStyles = {
    'rounded-all': 'rounded-2xl',
    'rounded-top-right-bottom-left': 'rounded-tr-[4rem] rounded-bl-[4rem] rounded-tl-2xl rounded-br-2xl',
    'rounded-top-left-bottom-right': 'rounded-tl-[4rem] rounded-br-[4rem] rounded-tr-2xl rounded-bl-2xl'
  }

  const containerRadiusStyles = {
    'rounded-all': 'rounded-2xl',
    'rounded-top-right-bottom-left': 'rounded-tr-[4rem] rounded-bl-2xl rounded-tl-2xl rounded-br-2xl',
    'rounded-top-left-bottom-right': 'rounded-tl-[4rem] rounded-br-2xl rounded-tr-2xl rounded-bl-2xl'
  }

  const cardContent = (
    <div className={`
      bg-white overflow-hidden 
      transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
      flex flex-col ${containerRadiusStyles[borderRadius]}
      ${width}
      
      ${className}
    `}>
      {/* Carrousel d'images */}
      <div className={`relative ${imageHeight} w-full overflow-hidden ${borderRadiusStyles[borderRadius]} bg-gray-200`}>
        {!imageError ? (
          <Image
            src={images[currentImageIndex]}
            fill
            alt={alt || `${hotelName} - offre spéciale`}
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
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </>
        )}

        {/* Indicateurs de page */}
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
                aria-label={`Aller à l'image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contenu de la carte */}
      <div className="p-4 flex flex-col flex-1">
        {/* Badge Offre spéciale */}
        <div className="mb-3">
          <div className="inline-flex items-center gap-1.5 bg-[#01BDA5] text-white px-3 py-1.5 rounded-full">
            <Tag className="w-4 h-4" />
            <span className="font-semibold text-sm">{t('offer')} -{discount}%</span>
          </div>
        </div>

        {/* Période de l'offre avec mention non remboursable */}
        <div className="mb-3 gap-1 border-b border-[#01BDA5] pb-2">
          <span className="text-sm text-[#01BDA5]">
            {t('description')} <span className="text-sm text-gray-600">
             {startDay} au {endDay} {month}
          </span>
          </span>
          
        </div>

        {/* Nom de l'hôtel et ville */}
        <div>
          <h3 className="font-bold text-lg text-gray-900">
            {hotelName}, {city}
          </h3>
        </div>
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

export default SpecialOfferCard