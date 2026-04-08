'use client'
import HeroSection from "../components/ui/HeroSection"
import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CardDestination from "../components/ui/CardDestination"
import { useOnScreen } from '@/hooks/useOnScreen'
import { useTranslations } from "next-intl"
import { createSlug } from '@/lib/slug'

export default function HebergementClient() {
    const t = useTranslations('Hebergement')
    const [scrollPosition, setScrollPosition] = useState(0)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    
    const [setCategoriesRef, isCategoriesVisible] = useOnScreen({
        threshold: 0.2,
        triggerOnce: false
    })

    // Données des catégories d'hébergements avec IDs
    const categories = [
        { id: 1, imageUrl: '/photos/categories/ecolodge.jpg', title: 'Ecolodge' },
        { id: 2, imageUrl: '/photos/categories/villas.jpg', title: 'Villas' },
        { id: 3, imageUrl: '/photos/categories/hotel-luxe.jpg', title: 'Hôtel de luxe' },
        { id: 4, imageUrl: '/photos/categories/maison-vacances.jpg', title: 'Maison de vacances' },
        { id: 5, imageUrl: '/photos/categories/lodge.jpg', title: 'Lodge' },
        { id: 6, imageUrl: '/photos/categories/bungalows.jpg', title: 'Bungalows' }
    ]

    // Fonction pour déterminer la hauteur selon l'ID
    const getCardHeight = (id: number) => {
        return id % 2 === 0 ? 'h-164' : 'h-128'
    }

    // Organisation des colonnes pour desktop
    const desktopColumns = [
        { 
            items: [categories[0], categories[3]],
            heights: ['h-128', 'h-164']
        },
        { 
            items: [categories[1], categories[4]],
            heights: ['h-164', 'h-128']
        },
        { 
            items: [categories[2], categories[5]],
            heights: ['h-128', 'h-164']
        }
    ]

    // Gestion du scroll
    useEffect(() => {
        const container = scrollContainerRef.current
        if (!container) return

        const updateScrollInfo = () => {
            setScrollPosition(container.scrollLeft)
        }

        updateScrollInfo()
        container.addEventListener('scroll', updateScrollInfo)
        window.addEventListener('resize', updateScrollInfo)

        return () => {
            container.removeEventListener('scroll', updateScrollInfo)
            window.removeEventListener('resize', updateScrollInfo)
        }
    }, [])

    const getActiveIndex = () => {
        if (!scrollContainerRef.current) return 0
        const cardWidth = 280
        const activeIndex = Math.round(scrollPosition / cardWidth)
        return Math.min(activeIndex, categories.length - 1)
    }

    const activeIndex = getActiveIndex()

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' })
        }
    }

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' })
        }
    }

    const scrollToDot = (index: number) => {
        if (scrollContainerRef.current) {
            const cardWidth = 280
            scrollContainerRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' })
        }
    }

    return (
        <>
            <HeroSection 
                title={t('title')}
                subtitle={t('subtitle')}
                backgroundImage="/images/hebergement.jpg"
                showDownload={false}
            />

            <main className="min-h-screen bg-white">
                <div className="container mx-auto px-6">
                    {/* Titre de la section */}
                    <div
                        ref={setCategoriesRef}
                        className={`py-4 transition-all duration-700 ${
                            isCategoriesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                        }`}
                    >
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-900 mb-2">
                            {t('section_title')}
                        </h2>
                    </div>

                    {/* Version mobile : carrousel horizontal */}
                    <div className="md:hidden">
                        <div className="relative">
                            <button
                                onClick={scrollLeft}
                                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110"
                                aria-label="Défiler vers la gauche"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-700" />
                            </button>

                            <div
                                ref={scrollContainerRef}
                                className="flex overflow-x-auto scroll-smooth gap-5 pb-6 scrollbar-hide px-8"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {categories.map((category) => (
                                    <div key={category.id} className="flex-shrink-0 w-[280px]">
                                        <CardDestination
                                            imageUrl={category.imageUrl}
                                            title={category.title}
                                            href={`/hebergement/${createSlug(category.id, category.title)}`}
                                            height="h-[411px]"
                                            width="w-full"
                                            hoverEffect="zoom"
                                        />
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={scrollRight}
                                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110"
                                aria-label="Défiler vers la droite"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-700" />
                            </button>
                        </div>

                        {/* Indicateurs pour mobile */}
                        <div className="flex justify-center gap-2 mt-6">
                            {categories.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => scrollToDot(index)}
                                    className={`transition-all duration-300 cursor-pointer ${
                                        activeIndex === index
                                            ? 'w-6 h-2 rounded-full bg-[#01BDA5]'
                                            : 'w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400'
                                    }`}
                                    aria-label={`Aller à la catégorie ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Version desktop : grille avec hauteurs alternées */}
                    <div className="hidden md:grid md:grid-cols-3 gap-6 mb-8">
                        {desktopColumns.map((column, colIndex) => (
                            <div key={colIndex} className="space-y-6">
                                {column.items.map((category, rowIndex) => (
                                    <CardDestination
                                        key={category.id}
                                        imageUrl={category.imageUrl}
                                        title={category.title}
                                        href={`/hebergement/${createSlug(category.id, category.title)}`}
                                        height={column.heights[rowIndex]}
                                        width="w-full"
                                        hoverEffect="zoom"
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </>
    )
}