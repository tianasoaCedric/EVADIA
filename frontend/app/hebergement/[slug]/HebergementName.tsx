'use client'

import { useState, useEffect, useCallback } from 'react'
import HeroSection from '../../components/ui/HeroSection'
import Input from '../../components/ui/Input'
import CardHotel from '../../components/ui/CardHotel'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { hotelService } from '@/lib/services'
import type { Hotel } from '@/lib/types'

interface HebergementNameProps {
    categoryId: number
    categoryName: string
    slug: string
}

export default function HebergementName({ categoryId, categoryName }: HebergementNameProps) {
    const t = useTranslations('HebergementName')
    const commonT = useTranslations('Common')

    const [searchQuery, setSearchQuery] = useState('')
    const [hotels, setHotels] = useState<Hotel[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)

    const fetchHotels = useCallback(async (page: number, search: string) => {
        setIsLoading(true)
        try {
            const res = await hotelService.list({
                type_id: categoryId,
                page,
                search: search.trim() || undefined,
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

    // Chargement initial et changement de page
    useEffect(() => {
        fetchHotels(currentPage, searchQuery)
    }, [currentPage, fetchHotels])

    // Recherche avec debounce — repart à la page 1
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1)
            fetchHotels(1, searchQuery)
        }, 400)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const goToPage = (page: number) => {
        const next = Math.max(1, Math.min(page, totalPages))
        setCurrentPage(next)
        document.getElementById('hotels-list')?.scrollIntoView({ behavior: 'smooth' })
    }

    const heroTitle = categoryName === 'Hôtel de luxe' ? t('hotels_luxe_title') : categoryName

    return (
        <>
            <HeroSection
                title={t('hero_title', { category: heroTitle })}
                subtitle={t('hero_subtitle', { category: categoryName.toLowerCase() })}
                backgroundImage="/photos/bc.png"
                showDownload={false}
                showScrollIndicator={true}
            />

            <main className="min-h-screen py-12">
                <div className="container mx-auto px-6">
                    {/* Barre de recherche */}
                    <div className="max-w-md mx-auto mb-10">
                        <Input
                            type="text"
                            placeholder={t('search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={<Search className="w-5 h-5 text-gray-400" />}
                            fullWidth
                            variant="light"
                            placeholderPosition="left"
                        />
                    </div>

                    <div id="hotels-list">
                        {/* Skeleton */}
                        {isLoading && (
                            <div className="flex flex-wrap justify-start items-start gap-11">
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
                                <div className="flex flex-wrap justify-start items-start gap-11">
                                    {hotels.map((hotel) => (
                                        <div key={hotel.id} className="w-[260px]">
                                            <CardHotel
                                                hotelId={hotel.id}
                                                imageUrl={hotel.photo_principale ?? '/photos/bc.png'}
                                                name={hotel.nom}
                                                availability="Disponible"
                                                price={hotel.prix_min ?? 0}
                                                prixMga={hotel.prix_min_mga}
                                                prixEur={hotel.prix_min_eur}
                                                etoiles={hotel.etoiles ?? undefined}
                                                rating={hotel.note_moyenne ?? 0}
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
