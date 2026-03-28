'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface CardHotelProps {
  /** URL de l'image de l'hôtel */
  imageUrl: string
  /** Nom de l'hôtel */
  name: string
  /** Disponibilité (ex: "Disponible", "Complet", "2 places restantes") */
  availability: string
  /** Prix par nuit */
  price: number
  /** Note sur 5 */
  rating: number
  /** Nombre d'avis */
  reviewCount?: number
  /** Lien vers la page de l'hôtel */
  href?: string
  /** Texte alternatif pour l'image */
  alt?: string
  /** Classes CSS supplémentaires */
  className?: string
  /** Largeur de la carte */
  width?: string
  /** Fonction callback pour le favori */
  onFavoriteToggle?: (isFavorite: boolean) => void
}

const CardHotel = ({
  imageUrl,
  name,
  availability,
  price,
  rating,
  reviewCount,
  href,
  alt = '',
  className = '',
  width = 'w-full',
  onFavoriteToggle
}: CardHotelProps) => {
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newFavoriteState = !isFavorite
    setIsFavorite(newFavoriteState)
    onFavoriteToggle?.(newFavoriteState)
  }

  // Générer les étoiles en fonction de la note
  const renderStars = () => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <div className="flex items-center gap-0.5">
        {/* Étoiles pleines */}
        {[...Array(fullStars)].map((_, i) => (
          <svg
            key={`full-${i}`}
            className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {/* Demi-étoile */}
        {hasHalfStar && (
          <svg
            key="half"
            className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <defs>
              <linearGradient id="halfGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#e5e7eb" />
              </linearGradient>
            </defs>
            <path
              fill="url(#halfGradient)"
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        )}
        {/* Étoiles vides */}
        {[...Array(emptyStars)].map((_, i) => (
          <svg
            key={`empty-${i}`}
            className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  const cardContent = (
    <div className={`
      bg-white rounded-xl overflow-hidden 
      transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
      flex flex-col
      ${width}
    `}>
      {/* Image en haut */}
      <div className={`relative h-42 sm:h-50 w-full rounded-xl overflow-hidden bg-gray-200`}>
        {!imageError ? (
          <Image
            src={imageUrl}
            alt={alt || name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Bouton favoris (cœur) */}
        <button
          onClick={handleFavoriteClick}
          className={`
            absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full cursor-pointer
            bg-white/80 backdrop-blur-sm shadow-md
            transition-all duration-200 hover:scale-110
            ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}
          `}
          aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Contenu de la carte */}
      <div className="flex flex-col flex-1 p-1 sm:p-2">
        {/* Nom de l'hôtel */}
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 line-clamp-1 mb-1">
          {name}
        </h3>

        {/* Disponibilité */}
        <div className="mb-1">
          <span className={`
    text-xs sm:text-sm font-medium
    ${availability.toLowerCase().includes('disponible')
              ? 'text-green-600'
              : availability.toLowerCase().includes('complet')
                ? 'text-red-500'
                : 'text-orange-500'
            }
          `}>
            {availability}
          </span>
        </div>

        {/* Prix */}
        <div className="mb-1">
          <span className="text-lg sm:text-xl font-bold text-gray-900">
            {price.toLocaleString('fr-FR')} Ar
          </span>
          <span className="text-xs sm:text-sm text-gray-500"> / nuit</span>
        </div>

        {/* Note (étoiles + note/5) */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {renderStars()}
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              {rating.toFixed(1)}
            </span>
            {reviewCount !== undefined && (
              <span className="text-[10px] sm:text-xs text-gray-400">
                ({reviewCount} avis)
              </span>
            )}
          </div>
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

export default CardHotel