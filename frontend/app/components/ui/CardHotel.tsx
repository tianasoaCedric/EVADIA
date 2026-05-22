'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useOnScreen } from '@/hooks/useOnScreen'
import { useTranslations } from 'next-intl'
import { useDevise } from '@/app/context/DeviseContext'

interface CardHotelProps {
  /** URL de l'image de l'hôtel */
  imageUrl: string
  /** Priorité de chargement de l'image (true pour les cartes au-dessus du fold) */
  priority?: boolean
  /** Nom de l'hôtel */
  name: string
  /** Disponibilité (ex: "Disponible", "Complet", "2 places restantes") */
  availability: string
  /** Prix par nuit (fallback) */
  price: number
  /** Prix en MGA */
  prixMga?: number
  /** Prix en EUR */
  prixEur?: number
  /** Classement officiel en étoiles (1-5) */
  etoiles?: number
  /** Note moyenne des avis clients sur 5 */
  rating: number
  /** Nombre d'avis */
  reviewCount?: number
  /** ID de l'hôtel pour générer le lien */
  hotelId?: number
  /** Lien vers la page de l'hôtel (optionnel, si fourni manuellement) */
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

// Fonction pour encoder l'ID en base36 (plus court et plus sûr)
const encodeId = (id: number): string => {
  return id.toString(36) // 1 -> '1', 10 -> 'a', 100 -> '2s'
}

// Fonction pour créer un slug avec ID encodé caché à la fin
const createSlug = (id: number, name: string): string => {
  const slugName = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlève les accents
    .replace(/[^a-z0-9]+/g, '-')     // Remplace les espaces par des tirets
    .replace(/^-|-$/g, '')           // Enlève les tirets au début et à la fin
  
  const encodedId = encodeId(id)
  return `${slugName}-${encodedId}`
}

const CardHotel = ({
  imageUrl,
  name,
  availability,
  price,
  prixMga,
  prixEur,
  etoiles,
  rating,
  reviewCount,
  hotelId,
  href,
  alt = '',
  className = '',
  width = 'w-[260px]',
  priority = false,
  onFavoriteToggle
}: CardHotelProps) => {
  const t = useTranslations('CardHotel')
  const { getPrix, symbole } = useDevise()
  const displayPrice = getPrix(prixMga, prixEur) ?? price
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageError, setImageError] = useState(false)

  const [setCardRef, isCardVisible] = useOnScreen({
        threshold: 0.2,
        triggerOnce: false
    })

  // Générer le lien automatiquement si hotelId est fourni
  const generateHref = () => {
    if (href) return href
    if (hotelId) return `/hotel/${createSlug(hotelId, name)}`
    return '#'
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newFavoriteState = !isFavorite
    setIsFavorite(newFavoriteState)
    onFavoriteToggle?.(newFavoriteState)
  }

  // Fonction pour traduire la disponibilité
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
    <div
    ref={setCardRef}
    className={`
      bg-white rounded-xl overflow-hidden 
      transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
      flex flex-col
      ${isCardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
      ${width}
    `}>
      {/* Image en haut */}
      <div className={`relative h-64 sm:h-64 w-full rounded-xl overflow-hidden bg-gray-200`}>
        {!imageError && imageUrl ? (
          <Image
            src={imageUrl}
            alt={alt || name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            quality={75}
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
            absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2rounded-full cursor-pointer
            
            transition-all duration-200 hover:scale-110
            ${isFavorite ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}
          `}
          aria-label={isFavorite ? t('remove_favorite') : t('add_favorite')}
        >
          <svg
            className="w-6 h-6 sm:w-8 sm:h-8"
            fill={isFavorite ? 'currentColor' : 'currentColor'}
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
        {/* Nom de l'hôtel (non traduit) */}
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 line-clamp-1 mb-1">
          {name}
        </h3>

        {/* Disponibilité traduite */}
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
            {getTranslatedAvailability(availability)}
          </span>
        </div>

        {/* Prix */}
        <div className="mb-1">
          <span className="text-lg sm:text-xl font-bold text-gray-900">
            {displayPrice.toLocaleString('fr-FR')} {symbole}
          </span>
          <span className="text-xs sm:text-sm text-gray-500"> {t('per_night')}</span>
        </div>

        {/* Note clients */}
        <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-gray-100">
          <svg className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs sm:text-sm font-medium text-gray-700">{Number(rating).toFixed(1)}</span>
          {reviewCount !== undefined && (
            <span className="text-[10px] sm:text-xs text-gray-400">
              ({t('reviews_count', { count: reviewCount })})
            </span>
          )}
        </div>
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

export default CardHotel