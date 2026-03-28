'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Bed, Bath, Users, ChevronLeft, ChevronRight } from 'lucide-react'

interface RoomCardProps {
  imageUrl: string | string[]  // Accepte une seule URL ou un tableau d'URLs
  name: string
  beds: number
  bathrooms: number
  maxPersons: number
  price: number
  availability?: string
  href?: string
  alt?: string
  className?: string
  width?: string
  onBookClick?: () => void
}

const RoomCard = ({
  imageUrl,
  name,
  beds,
  bathrooms,
  maxPersons,
  price,
  availability = 'Disponible',
  href,
  alt = '',
  className = '',
  width = 'w-80 sm:w-96',  // Largeur augmentée
  onBookClick
}: RoomCardProps) => {
  const [imageError, setImageError] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
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

  const handleBookClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onBookClick?.()
  }

  const cardContent = (
    <div className={`
      bg-white rounded-2xl overflow-hidden 
      transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
      flex flex-col
      ${width}
    `}>
      {/* Carrousel d'images */}
      <div className="relative rounded-2xl h-48 sm:h-56 w-full overflow-hidden bg-gray-200">
        {/* Image courante */}
        {!imageError ? (
          <Image
            src={images[currentImageIndex]}
            fill
            alt={alt || `${name} - image ${currentImageIndex + 1}`}
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

        {/* Flèche gauche */}
        {hasMultipleImages && (
          <button
            onClick={handlePrevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 cursor-pointer"
            aria-label="Image précédente"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Flèche droite */}
        {hasMultipleImages && (
          <button
            onClick={handleNextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 cursor-pointer"
            aria-label="Image suivante"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
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
        
        {/* Badge de disponibilité */}
        {availability && (
          <div className={`absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
            availability.toLowerCase().includes('disponible') 
              ? 'bg-green-500 text-white hidden' 
              : 'bg-red-500 text-white'
          }`}>
            {availability}
          </div>
        )}
      </div>

      {/* Contenu de la carte */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {/* Nom et prix sur la même ligne */}
        <div className="flex flex-row items-center justify-between gap-2 mb-3">
          <h3 className="font-medium text-lg sm:text-xl text-gray-900 line-clamp-1">
            {name}
          </h3>
          <div className="flex-shrink-0">
            <span className="text-lg sm:text-xl font-medium text-gray-900">
              {price.toLocaleString('fr-FR')} Ar
            </span>
            <span className="text-xs text-gray-500">/nuit</span>
          </div>
        </div>

        {/* Caractéristiques - Lits, SDB, Pers sur la même ligne */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4 justify-between">
          {/* Lits */}
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            <span className="text-xs text-gray-500">lit(s) :</span>
            <span className="text-sm sm:text-base text-gray-700 font-medium">{beds}</span>
          </div>

          {/* Salle de bain */}
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            <span className="text-xs text-gray-500">SDB :</span>
            <span className="text-sm sm:text-base text-gray-700 font-medium">{bathrooms}</span>
          </div>

          {/* Personnes */}
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            <span className="text-xs text-gray-500">pers :</span>
            <span className="text-sm sm:text-base text-gray-700 font-medium">{maxPersons}</span>
          </div>
        </div>

        {/* Bouton Réserver - pleine largeur */}
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
          Réserver
        </button>
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

export default RoomCard