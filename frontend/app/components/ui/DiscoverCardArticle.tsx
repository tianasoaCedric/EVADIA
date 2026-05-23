'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useOnScreen } from '@/hooks/useOnScreen'

interface DiscoverCardArticleProps {
    /** URLs des images (peut être une seule ou plusieurs) */
    images: string[]
    /** Nom de l'endroit */
    placeName: string
    /** Titre de l'article */
    title: string
    /** Description longue */
    description: string
    /** Position de l'image (gauche ou droite) */
    imagePosition?: 'left' | 'right'
    /** Classes supplémentaires */
    className?: string
}

const DiscoverCardArticle = ({
    images: initialImages,
    placeName,
    title,
    description,
    imagePosition = 'left',
    className = ''
}: DiscoverCardArticleProps) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [imageError, setImageError] = useState(false)
    const [isTransitioning, setIsTransitioning] = useState(false)

    const images = initialImages.length > 0 ? initialImages : ['/photos/placeholder.jpg']
    const hasMultipleImages = images.length > 1

    // Animation au scroll
    const [setCardRef, isCardVisible] = useOnScreen({ threshold: 0.2,  })

    const handlePrevImage = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (isTransitioning) return
        setIsTransitioning(true)
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
        setTimeout(() => setIsTransitioning(false), 300)
    }

    const handleNextImage = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (isTransitioning) return
        setIsTransitioning(true)
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
        setTimeout(() => setIsTransitioning(false), 300)
    }

    const imageSection = (
        <div className="flex flex-col">
            {/* Image en paysage 4:3 avec animation comme RoomCard */}
            <div className="relative w-full overflow-hidden rounded-2xl bg-gray-200" style={{ aspectRatio: '4 / 3' }}>
                {!imageError ? (
                    <Image
                        src={images[currentImageIndex]}
                        alt={`${placeName} - image ${currentImageIndex + 1}`}
                        fill
                        className={`object-cover transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
                        onError={() => setImageError(true)}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Flèches et nom sur la même ligne avec space-between */}
            <div className="flex items-center justify-between mt-3">
                {/* Flèches de navigation à gauche */}
                {hasMultipleImages ? (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrevImage}
                            disabled={isTransitioning}
                            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Image précédente"
                        >
                            <ChevronLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                            onClick={handleNextImage}
                            disabled={isTransitioning}
                            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Image suivante"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="text-xs text-gray-400">
                            {currentImageIndex + 1} / {images.length}
                        </span>
                    </div>
                ) : (
                    <div></div>
                )}

                {/* Nom de l'endroit à droite */}
                <span className="text-sm text-gray-500">{placeName}</span>
            </div>
        </div>
    )

    const textSection = (
        <div className="flex flex-col justify-center">
            <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
                {title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
                {description}
            </p>
        </div>
    )

    return (
        <div
            ref={setCardRef}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start ${className} transition-all duration-700 ease-out ${
                isCardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
        >
            {imagePosition === 'left' ? (
                <>
                    {imageSection}
                    {textSection}
                </>
            ) : (
                <>
                    {textSection}
                    {imageSection}
                </>
            )}
        </div>
    )
}

export default DiscoverCardArticle