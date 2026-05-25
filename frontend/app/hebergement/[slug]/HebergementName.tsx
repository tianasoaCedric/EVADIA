'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import HeroSection from '../../components/ui/HeroSection'
import CardHotel from '../../components/ui/CardHotel'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { hotelService } from '@/lib/services'
import type { Hotel, PaginatedResponse } from '@/lib/types'
import Filters, { FilterValues } from '../../components/ui/Filters'

interface HebergementNameProps {
    categoryId: number
    categoryName: string
    slug: string
    initialData?: PaginatedResponse<Hotel>
    categoryDescription?: string | null
    categoryImage?: string
}

export default function HebergementName({ categoryId, categoryName, initialData, categoryDescription, categoryImage = '/photos/bc.png' }: HebergementNameProps) {
    const t = useTranslations('HebergementName')
    const commonT = useTranslations('Common')

    // États pour les filtres
    const [filters, setFilters] = useState<FilterValues>({
        search: '',
        destinationId: null,
        priceMin: null,
        priceMax: null,
        availability: 'all',
        stars: 0,
        minRating: 0,
        typeHebergementId: null,
        checkIn: null,
        checkOut: null,
        offreType: 'all',
        discountMin: null,
    })

    // États pour les données
    const [hotels, setHotels] = useState<Hotel[]>(initialData?.data ?? [])
    const [isLoading, setIsLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(initialData?.last_page ?? 1)
    const [total, setTotal] = useState(initialData?.total ?? 0)
    const skipFirstFetch = useRef(!!initialData)

    const fetchHotels = useCallback(async (page: number, currentFilters: FilterValues) => {
        setIsLoading(true)
        try {
            const res = await hotelService.list({
                type_id: categoryId,
                page,
                search: currentFilters.search.trim() || undefined,
                destination_id: currentFilters.destinationId ?? undefined,
                prix_min: currentFilters.priceMin ?? undefined,
                prix_max: currentFilters.priceMax ?? undefined,
                disponible: currentFilters.availability === 'disponible' ? true : currentFilters.availability === 'complet' ? false : undefined,
                etoiles_min: currentFilters.stars || undefined,
                note_min: currentFilters.minRating || undefined,
            })
            setHotels(res.data)
            setTotalPages(res.last_page)
            setTotal(res.total)
        } catch {
            setHotels([])
        } finally {
            setIsLoading(false)
        }
    }, [categoryId])

    const handleFilterChange = (newFilters: FilterValues) => {
        setFilters(newFilters)
        setCurrentPage(1)
        fetchHotels(1, newFilters)
    }

    // Page change uniquement — skip le premier rendu si données serveur disponibles
    useEffect(() => {
        if (skipFirstFetch.current) { skipFirstFetch.current = false; return }
        fetchHotels(currentPage, filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage])

    const goToPage = (page: number) => {
        const next = Math.max(1, Math.min(page, totalPages))
        setCurrentPage(next)
        document.getElementById('hotels-list')?.scrollIntoView({ behavior: 'smooth' })
    }

    const capitalizeWords = (str: string): string => {
        return str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    const heroTitle = capitalizeWords(categoryName)

    return (
        <>
            <HeroSection
                title={t('hero_title', { category: heroTitle })}
                subtitle={categoryDescription ?? t('hero_subtitle', { category: categoryName.toLowerCase() })}
                backgroundImage={categoryImage}
                showDownload={false}
                showScrollIndicator={true}
            />

            <main className="min-h-screen py-12">
                <div className="container mx-auto px-6">
                    {/* 
                        Composant Filters avec uniquement les filtres demandés :
                        - search : barre de recherche
                        - destination : filtre par destination
                        - price : fourchette de prix
                        - availability : disponibilité
                        - stars : classification (étoiles)
                        - rating : note minimale (avis)
                    */}
                    <Filters 
                        onFilterChange={handleFilterChange}
                        initialFilters={filters}
                        enabledFilters={['destination', 'price', 'availability', 'stars', 'rating']}
                        className="mb-8"
                    />

                    {/* Résultats */}
                    <div id="hotels-list">
                        {/* Skeleton */}
                        {isLoading && (
                            <div className="flex flex-wrap justify-start items-start gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="w-[260px] flex flex-col gap-3">
                                        <div className="h-64 rounded-xl bg-gray-200 animate-pulse" />
                                        <div className="h-4 rounded bg-gray-200 animate-pulse w-3/4" />
                                        <div className="h-4 rounded bg-gray-200 animate-pulse w-1/2" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Aucun résultat */}
                        {!isLoading && hotels.length === 0 && (
                            <div className="text-center py-16">
                                <p className="text-gray-500 text-lg">{t('no_results')}</p>
                            </div>
                        )}

                        {/* Liste des hôtels */}
                        {!isLoading && hotels.length > 0 && (
                            <>
                                <div className="flex flex-wrap justify-start items-start gap-6">
                                    {hotels.map((hotel, idx) => (
                                        <div key={hotel.id} className="w-[260px]">
                                            <CardHotel
                                                hotelId={hotel.id}
                                                imageUrl={hotel.photo_principale ?? '/photos/bc.png'}
                                                name={hotel.nom}
                                                ville={hotel.adresse?.ville}
                                                availability="Disponible"
                                                price={hotel.prix_min ?? 0}
                                                prixMga={hotel.prix_min_mga}
                                                prixEur={hotel.prix_min_eur}
                                                etoiles={hotel.etoiles ?? undefined}
                                                rating={hotel.note_moyenne ?? 0}
                                                priority={idx < 4}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-2 mt-10">
                                        <button
                                            onClick={() => goToPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`p-2 rounded-full transition-all duration-200 ${
                                                currentPage === 1
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : 'hover:bg-gray-100 cursor-pointer'
                                            }`}
                                            aria-label={commonT('previous')}
                                        >
                                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                                        </button>

                                        <div className="flex gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                                if (
                                                    page === 1 ||
                                                    page === totalPages ||
                                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                                ) {
                                                    return (
                                                        <button
                                                            key={page}
                                                            onClick={() => goToPage(page)}
                                                            className={`w-8 h-8 rounded-full transition-all duration-200 cursor-pointer ${
                                                                currentPage === page
                                                                    ? 'bg-[#01BDA5] text-white'
                                                                    : 'hover:bg-gray-100 text-gray-600'
                                                            }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    )
                                                } else if (page === currentPage - 2 || page === currentPage + 2) {
                                                    return (
                                                        <span key={page} className="w-8 h-8 flex items-center justify-center text-gray-400">
                                                            ...
                                                        </span>
                                                    )
                                                }
                                                return null
                                            })}
                                        </div>

                                        <button
                                            onClick={() => goToPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`p-2 rounded-full transition-all duration-200 ${
                                                currentPage === totalPages
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : 'hover:bg-gray-100 cursor-pointer'
                                            }`}
                                            aria-label={commonT('next')}
                                        >
                                            <ChevronRight className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                )}

                                {/* Compteur */}
                                <div className="text-center mt-6 text-sm text-gray-500">
                                    {t('results_count', { count: total })}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </>
    )
}