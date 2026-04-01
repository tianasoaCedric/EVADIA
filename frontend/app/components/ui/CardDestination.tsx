'use client'

import Image from 'next/image'
import Link from 'next/link'

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
  
  const hoverStyles = {
    zoom: 'group-hover:scale-110',
    darken: 'group-hover:brightness-75',
    none: ''
  }

  const cardContent = (
    <div
      className={`
        relative rounded-3xl overflow-hidden
        ${height} ${width}
        transition-all duration-300
        cursor-pointer
        shadow-md hover:shadow-xl
        group
      `}
    >
      {/* Conteneur de l'image avec overflow hidden pour le zoom */}
      <div className="relative w-full h-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={alt || title}
          fill
          className={`
            object-cover transition-transform duration-500 ease-out
            ${hoverEffect === 'zoom' ? hoverStyles.zoom : ''}
          `}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
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