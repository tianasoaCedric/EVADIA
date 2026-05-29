'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useOnScreen } from '@/hooks/useOnScreen'
import { useTranslations } from 'next-intl'
import { useDevise } from '@/app/context/DeviseContext'
import { useFavoris } from '@/app/context/FavorisContext'
import { favoriService } from '@/lib/services/favori.service'
import { authService } from '@/lib/services/auth.service'

interface CardHotelProps {
  imageUrl: string
  priority?: boolean
  name: string
  ville?: string
  availability: string
  price: number
  prixMga?: number
  prixEur?: number
  etoiles?: number
  rating: number
  reviewCount?: number
  hotelId?: number
  href?: string
  alt?: string
  className?: string
  width?: string
  initialIsFavorite?: boolean
  onFavoriteToggle?: (isFavorite: boolean) => void
  animationDelay?: number
}

// Fonction pour encoder l'ID en base36
const encodeId = (id: number): string => id.toString(36)

// Fonction pour créer un slug avec ID encodé caché à la fin
const createSlug = (id: number, name: string): string => {
  const slugName = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  
  const encodedId = encodeId(id)
  return `${slugName}-${encodedId}`
}

const CardHotel = ({
  imageUrl,
  name,
  ville,
  availability,
  price,
  prixMga,
  prixEur,
  rating,
  reviewCount,
  hotelId,
  href,
  alt = '',
  className = '',
  width = 'w-full',
  priority = false,
  initialIsFavorite = false,
  onFavoriteToggle,
  animationDelay = 0
}: CardHotelProps) => {
  const t = useTranslations('CardHotel')
  const router = useRouter()
  const { getPrix, symbole } = useDevise()
  const { favoriteIds, toggle: toggleContext } = useFavoris()
  const displayPrice = getPrix(prixMga, prixEur) ?? price

  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [imageError, setImageError] = useState(false)

  const [setCardRef, isCardVisible] = useOnScreen({
    threshold: 0.2,
  })

  // Sync avec le contexte global
  useEffect(() => {
    if (!initialIsFavorite && hotelId) {
      setIsFavorite(favoriteIds.has(hotelId))
    }
  }, [favoriteIds, hotelId, initialIsFavorite])

  // Générer le lien
  const generateHref = () => {
    if (href) return href
    if (hotelId) return `/hotel/${createSlug(hotelId, name)}`
    return '#'
  }

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (onFavoriteToggle) {
      const newState = !isFavorite
      setIsFavorite(newState)
      onFavoriteToggle(newState)
      return
    }

    if (!hotelId) return

    if (!authService.isAuthenticated()) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    const newState = !isFavorite
    setIsFavorite(newState)
    toggleContext(hotelId, newState)
    
    try {
      if (newState) {
        await favoriService.add(hotelId)
      } else {
        await favoriService.remove(hotelId)
      }
    } catch (err) {
      const status = (err as { status?: number })?.status
      if (status !== 401) {
        setIsFavorite(!newState)
        toggleContext(hotelId, !newState)
      }
    }
  }

  // Traduction de la disponibilité
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

  // Générer les étoiles
  const renderStars = () => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <svg
            key={`full-${i}`}
            className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
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

  const linkHref = generateHref()

  // Contenu interne de la carte
  const cardInner = (
    <div className="flex flex-col flex-1 p-2">
      <h3 className="font-semibold text-base sm:text-lg text-gray-900 line-clamp-1 mb-1">
        {name}{ville ? `, ${ville}` : ''}
      </h3>

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

      <div className="mb-1">
        <span className="text-lg sm:text-xl font-bold text-gray-900">
          {displayPrice.toLocaleString('fr-FR')} {symbole}
        </span>
        <span className="text-xs sm:text-sm text-gray-500"> {t('per_night')}</span>
      </div>

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
  )

  // Wrapper commun - séparation des animations
  const wrapperClass = `
    relative
    bg-white rounded-2xl overflow-hidden
    transition-[box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl
    flex flex-col
    ${width}
  `

  // Animation d'apparition séparée avec délai
  const appearClass = `
    transition-all duration-500 ease-out
    ${isCardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
  `

  // Contenu avec l'image et le bouton favori
  const cardWithImage = (
    <>
      {/* Conteneur de l'image avec position relative */}
      <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-gray-200">
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
            <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Bouton favori - inchangé */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className="
            absolute top-2 right-2 z-20
            w-8 h-8 sm:w-10 sm:h-10
            flex items-center justify-center
            transition-all duration-200 hover:scale-110
            cursor-pointer
          "
          aria-label={isFavorite ? t('remove_favorite') : t('add_favorite')}
        >
          <svg
            className="w-8 sm:h-8"
            fill={isFavorite ? '#ff3434' : 'white'}
            stroke={isFavorite ? '#ff3434' : 'white'}
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
      {cardInner}
    </>
  )

  if (linkHref !== '#') {
    return (
      <div ref={setCardRef} className={`group ${className}`}>
        <Link 
          href={linkHref} 
          className={`${wrapperClass} ${appearClass}`}
          style={{ transitionDelay: `${animationDelay}ms` }}
        >
          {cardWithImage}
        </Link>
      </div>
    )
  }

  return (
    <div ref={setCardRef} className={`group ${className}`}>
      <div 
        className={`${wrapperClass} ${appearClass}`}
        style={{ transitionDelay: `${animationDelay}ms` }}
      >
        {cardWithImage}
      </div>
    </div>
  )
}

export default CardHotel