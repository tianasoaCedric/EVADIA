// components/HotelPhoto.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, X, Grid } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useOnScreen } from '@/hooks/useOnScreen'

interface HotelPhotoProps {
    imageUrl: string | string[]
    href?: string
    alt?: string
    className?: string
    onBookClick?: () => void
    autoPlayInterval?: number
}

const HotelPhoto = ({
    imageUrl,
    href,
    alt = '',
    className = '',
    onBookClick,
    autoPlayInterval
}: HotelPhotoProps) => {
    const t = useTranslations('HotelPhoto')
    const [imageError, setImageError] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [dragStart, setDragStart] = useState(0)
    const [dragOffset, setDragOffset] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalView, setModalView] = useState<'grid' | 'fullscreen'>('grid')
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    // Animation au scroll
    const [setPhotoRef, isPhotoVisible] = useOnScreen({ threshold: 0.2,  })

    const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl]
    // Limiter l'affichage à 5 photos dans le carrousel principal
    const displayImages = images.slice(0, 5)
    const remainingImagesCount = images.length - 5
    const hasMultipleImages = displayImages.length > 1
    const hasMoreThanOneImage = images.length > 1

    // Auto-play
    useEffect(() => {
        if (!autoPlayInterval || !hasMultipleImages || isModalOpen) return

        const interval = setInterval(() => {
            if (!isTransitioning && !isDragging) {
                goToNext()
            }
        }, autoPlayInterval)

        return () => clearInterval(interval)
    }, [autoPlayInterval, hasMultipleImages, isTransitioning, isDragging, isModalOpen])

    // Empêcher le scroll du body quand la modale est ouverte
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isModalOpen])

    const goToPrevious = () => {
        if (isTransitioning) return
        setIsTransitioning(true)
        setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
        setTimeout(() => setIsTransitioning(false), 300)
    }

    const goToNext = () => {
        if (isTransitioning) return
        setIsTransitioning(true)
        setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
        setTimeout(() => setIsTransitioning(false), 300)
    }

    const goToSlide = (index: number) => {
        if (isTransitioning) return
        setIsTransitioning(true)
        setCurrentIndex(index)
        setTimeout(() => setIsTransitioning(false), 300)
    }

    // Fonctions pour la modale
    const openModal = () => {
        setModalView('grid')
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setModalView('grid')
    }

    const openFullscreen = (index: number) => {
        setSelectedImageIndex(index)
        setModalView('fullscreen')
    }

    const closeFullscreen = () => {
        setModalView('grid')
    }

    const fullscreenGoToPrevious = () => {
        setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }

    const fullscreenGoToNext = () => {
        setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }

    // Gestion du drag
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (!hasMultipleImages) return
        setIsDragging(true)
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
        setDragStart(clientX)
        setDragOffset(0)
    }

    const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging || !hasMultipleImages) return
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
        const offset = clientX - dragStart
        setDragOffset(offset)
    }

    const handleDragEnd = () => {
        if (!isDragging || !hasMultipleImages) return
        setIsDragging(false)
        
        const threshold = 50
        if (Math.abs(dragOffset) > threshold) {
            if (dragOffset > 0) {
                goToPrevious()
            } else {
                goToNext()
            }
        }
        setDragOffset(0)
    }

    // Gestion du drag dans le fullscreen
    const [fullscreenDragStart, setFullscreenDragStart] = useState(0)
    const [fullscreenDragOffset, setFullscreenDragOffset] = useState(0)
    const [isFullscreenDragging, setIsFullscreenDragging] = useState(false)

    const handleFullscreenDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        setIsFullscreenDragging(true)
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
        setFullscreenDragStart(clientX)
        setFullscreenDragOffset(0)
    }

    const handleFullscreenDragMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isFullscreenDragging) return
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
        const offset = clientX - fullscreenDragStart
        setFullscreenDragOffset(offset)
    }

    const handleFullscreenDragEnd = () => {
        if (!isFullscreenDragging) return
        setIsFullscreenDragging(false)
        
        const threshold = 50
        if (Math.abs(fullscreenDragOffset) > threshold) {
            if (fullscreenDragOffset > 0) {
                fullscreenGoToPrevious()
            } else {
                fullscreenGoToNext()
            }
        }
        setFullscreenDragOffset(0)
    }

    const cardContent = (
        <>
        <div
            ref={setPhotoRef}
            className={`transition-all duration-700 ease-out ${
                isPhotoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
        >
            <div className={`rounded-2xl overflow-hidden bg-gray-800 ${className}`}>
                <div 
                    className="relative w-full bg-gray-200"
                    style={{ height: '70vh' }}
                    ref={containerRef}
                >
                    <div 
                        className="relative w-full h-full overflow-hidden"
                        onMouseDown={handleDragStart}
                        onMouseMove={handleDragMove}
                        onMouseUp={handleDragEnd}
                        onMouseLeave={handleDragEnd}
                        onTouchStart={handleDragStart}
                        onTouchMove={handleDragMove}
                        onTouchEnd={handleDragEnd}
                        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                    >
                        <div 
                            className="flex h-full transition-transform duration-300 ease-out"
                            style={{ 
                                transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
                                transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                            }}
                        >
                            {displayImages.map((img, idx) => (
                                <div key={idx} className="relative w-full h-full flex-shrink-0">
                                    {!imageError ? (
                                        <Image
                                            src={img}
                                            alt={alt || `${t('image')} ${idx + 1}`}
                                            fill
                                            className="object-cover pointer-events-none"
                                            onError={() => setImageError(true)}
                                            priority={idx === 0}
                                            sizes="100vw"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                            <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {hasMultipleImages && (
                        <>
                            <button
                                onClick={goToPrevious}
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 cursor-pointer z-20"
                                aria-label={t('previous_image')}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            <button
                                onClick={goToNext}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 cursor-pointer z-20"
                                aria-label={t('next_image')}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>

                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                                {displayImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            goToSlide(idx)
                                        }}
                                        className={`w-1.5 h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                                            currentIndex === idx
                                                ? 'bg-white w-3'
                                                : 'bg-white/50 hover:bg-white/80'
                                        }`}
                                        aria-label={t('go_to_image', { number: idx + 1 })}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {isTransitioning && (
                        <div className="absolute inset-0 bg-black/20 pointer-events-none z-20" />
                    )}
                </div>
            </div>

            {hasMoreThanOneImage && (
                <div className="flex justify-end mt-2">
                    <button
                        onClick={openModal}
                        className="px-3 cursor-pointer text-[#01BDA5] text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:opacity-80"
                    >
                        <Grid className="w-4 h-4" />
                        <span className="hidden sm:inline">
                            {remainingImagesCount > 0 
                                ? t('see_more_photos_with_count', { count: remainingImagesCount })
                                : t('see_more_photos')}
                        </span>
                        <span className="md:hidden">{images.length} {t('photos')}</span>
                    </button>
                </div>
            )}

            
        </div>
        {/* Modal avec grille - IDENTIQUE À L'ORIGINAL */}
            {isModalOpen && (
                <div 
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md overflow-y-auto"
                    onClick={closeModal}
                >
                    {/* Bouton fermeture */}
                    <button
                        onClick={closeModal}
                        className="fixed top-4 right-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-all duration-200 z-50"
                        aria-label={t('close')}
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Titre */}
                    <div className="pt-20 pb-8 px-4">
                    </div>

                    {/* Grille de photos */}
                    <div className="max-w-7xl mx-auto px-4 pb-20">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {images.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        openFullscreen(idx)
                                    }}
                                    className="relative aspect-square rounded-2xl overflow-hidden bg-gray-800 cursor-pointer hover:opacity-90 transition-all duration-200 hover:scale-105"
                                >
                                    <Image
                                        src={img}
                                        alt={t('photo_number', { number: idx + 1 })}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal plein écran pour zoom - IDENTIQUE À L'ORIGINAL */}
            {isModalOpen && modalView === 'fullscreen' && (
                <div 
                    className="fixed inset-0 z-[60] bg-black"
                    onClick={closeFullscreen}
                >
                    {/* Bouton retour à la grille */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            closeFullscreen()
                        }}
                        className="fixed top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 z-50 flex items-center gap-2"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="text-sm">{t('back_to_grid')}</span>
                    </button>

                    {/* Bouton fermeture */}
                    <button
                        onClick={closeModal}
                        className="fixed top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 z-50"
                        aria-label={t('close')}
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Compteur */}
                    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm z-50">
                        {selectedImageIndex + 1} / {images.length}
                    </div>

                    {/* Carrousel plein écran */}
                    <div 
                        className="relative w-full h-full overflow-hidden"
                        onMouseDown={handleFullscreenDragStart}
                        onMouseMove={handleFullscreenDragMove}
                        onMouseUp={handleFullscreenDragEnd}
                        onMouseLeave={handleFullscreenDragEnd}
                        onTouchStart={handleFullscreenDragStart}
                        onTouchMove={handleFullscreenDragMove}
                        onTouchEnd={handleFullscreenDragEnd}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div 
                            className="flex h-full transition-transform duration-300 ease-out"
                            style={{ 
                                transform: `translateX(calc(-${selectedImageIndex * 100}% + ${fullscreenDragOffset}px))`,
                                transition: isFullscreenDragging ? 'none' : 'transform 0.3s ease-out'
                            }}
                        >
                            {images.map((img, idx) => (
                                <div key={idx} className="relative w-full h-full flex-shrink-0 flex items-center justify-center bg-black">
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={img}
                                            alt={t('photo_number', { number: idx + 1 })}
                                            fill
                                            className="object-contain"
                                            sizes="100vw"
                                            quality={100}
                                            priority={idx === selectedImageIndex}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Flèches de navigation */}
                        {hasMultipleImages && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        fullscreenGoToPrevious()
                                    }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 cursor-pointer z-50"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        fullscreenGoToNext()
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 cursor-pointer z-50"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </>
                        )}

                        {/* Indicateurs */}
                        {hasMultipleImages && (
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50">
                                {images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedImageIndex(idx)
                                        }}
                                        className={`transition-all duration-200 rounded-full ${
                                            selectedImageIndex === idx
                                                ? 'w-8 h-1.5 bg-white'
                                                : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )

    if (href) {
        return (
            <Link href={href} className="block group">
                {cardContent}
            </Link>
        )
    }

    return cardContent
}

export default HotelPhoto