'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useOnScreen } from '@/hooks/useOnScreen'

interface CardDestinationProps {
  /** URL de l'image de fond */
  imageUrl: string
  /** Nom de la destination */
  title: string
  /** Lien vers la destination (optionnel) */
  href?: string
  /** Hauteur de la carte (ex: 'h-64', 'h-80', 'h-96') */
  height?: string
  /** Largeur de la carte (ex: 'w-full', 'w-64', 'w-80') */
  width?: string
  /** Texte alternatif pour l'image */
  alt?: string
  /** Classes CSS supplémentaires */
  className?: string
  /** Effet au survol */
  hoverEffect?: 'zoom' | 'darken' | 'none'
}

const CardDestination = ({
  imageUrl,
  title,
  href,
  height = 'h-64',
  width = 'w-full',
  alt = '',
  className = '',
  hoverEffect = 'zoom'
}: CardDestinationProps) => {
  const [imageError, setImageError] = useState(false)
  
  const hoverStyles = {
    zoom: 'group-hover:scale-110',
    darken: 'group-hover:brightness-75',
    none: ''
  }

  const [setCardRef, isCardVisible] = useOnScreen({
        threshold: 0.2,
        triggerOnce: false
    })

  const cardContent = (
    <div
      ref={setCardRef}
      className={`
        relative rounded-3xl overflow-hidden
        ${height} ${width}
        transition-all duration-300
        cursor-pointer
        shadow-md hover:shadow-xl
        group
        ${
                            isCardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                        }
      `}
    >
      {/* Conteneur de l'image avec overflow hidden pour le zoom */}
      <div className="relative w-full h-full overflow-hidden bg-gray-200">
        {!imageError ? (
          <Image
            src={imageUrl}
            alt={alt || title}
            fill
            className={`
              object-cover transition-transform duration-500 ease-out
              ${hoverEffect === 'zoom' ? hoverStyles.zoom : ''}
            `}
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
      </div>
      
      {/* Overlay sombre pour améliorer la lisibilité du texte */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
      
      {/* Nom de la destination en bas à gauche */}
      <div className="absolute bottom-0 left-0 p-4">
        <h3 className="text-white font-regular text-lg md:text-md lg:text-xl drop-shadow-lg transition-transform duration-300 group-hover:translate-y-[-2px]">
          {title}
        </h3>
      </div>
    </div>
  )

  // Si un lien est fourni, on enveloppe avec Link
  if (href) {
    return (
      <Link href={href} className={`block ${className}`}>
        {cardContent}
      </Link>
    )
  }

  return (
    <div className={className}>
      {cardContent}
    </div>
  )
}

export default CardDestination