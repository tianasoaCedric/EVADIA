'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

interface DiscoverCardProps {
  imageUrl: string | string[]
  title: string
  href?: string
  alt?: string
  className?: string
  width?: string
  onClick?: () => void
}

const DiscoverCard = ({
  imageUrl,
  title,
  href,
  alt = '',
  className = '',
  width = 'w-full sm:w-80 md:w-72',
  onClick
}: DiscoverCardProps) => {
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

  const handleClick = (e: React.MouseEvent) => {
    onClick?.()
  }

  const cardContent = (
    <div className={`
      group bg-white rounded-2xl overflow-hidden 
      transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
      cursor-pointer
      ${width}
    `}>
      {/* Image en haut */}
      <div className="relative rounded-2xl h-60 sm:h-72 w-full overflow-hidden bg-gray-200">
        {!imageError ? (
          <Image
            src={images[currentImageIndex]}
            fill
            alt={alt || title}
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
                aria-label={`Aller à l'image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contenu en bas - titre et bouton + */}
      <div className="p-3 sm:p-4 flex items-center justify-between gap-3">
        <h3 className="font-medium text-base sm:text-lg md:text-lg text-gray-900 flex-1 line-clamp-2">
          {title}
        </h3>
        <div className="flex-shrink-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-[#01BDA5] flex items-center justify-center transition-all duration-200 hover:scale-110 hover:rotate-90 shadow-md">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className={`block ${className}`} onClick={handleClick}>
        {cardContent}
      </Link>
    )
  }

  return (
    <div className={`${className}`} onClick={handleClick}>
      {cardContent}
    </div>
  )
}

export default DiscoverCard