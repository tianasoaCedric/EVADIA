'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronLeft, Heart, Trash2, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, Search } from 'lucide-react'
import HeroSection from '../components/ui/HeroSection'
import CardHotel from '../components/ui/CardHotel'
import Bouton from '../components/ui/Bouton'
import Input from '../components/ui/Input'
import { favoriService } from '@/lib/services'
import type { Favori } from '@/lib/types'

export default function FavoriteClient() {
    const router = useRouter()
    const t = useTranslations('FavoriteClient')
    const [favorites, setFavorites] = useState<Favori[]>([])
    const [filteredFavorites, setFilteredFavorites] = useState<Favori[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    // État pour la pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 15


    useEffect(() => {
        const fetchFavorites = async () => {
            setIsLoading(true)
            try {
                const response = await favoriService.list()
                setFavorites(response.data)
                setFilteredFavorites(response.data)
                setCurrentPage(1)
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchFavorites()
    }, [])

    // Filtrer les favoris par recherche
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredFavorites(favorites)
        } else {
            const filtered = favorites.filter(favori =>
                favori.hotel.nom.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setFilteredFavorites(filtered)
        }
        setCurrentPage(1)
    }, [searchQuery, favorites])

    // Pagination
    const totalPages = Math.ceil(filteredFavorites.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentFavorites = filteredFavorites.slice(startIndex, endIndex)

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
        document.getElementById('favorites-list')?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleRemoveFavorite = async (hotelId: number) => {
        try {
            await favoriService.remove(hotelId)
            const newFavorites = favorites.filter(f => f.hotel_id !== hotelId)
            setFavorites(newFavorites)
            if (currentFavorites.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleClearAll = async () => {
        try {
            await Promise.all(favorites.map(f => favoriService.remove(f.hotel_id)))
            setFavorites([])
            setFilteredFavorites([])
            setCurrentPage(1)
            setSearchQuery('')
        } catch (error) {
            console.error(error)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-500">{t('loading')}</div>
            </div>
        )
    }

    return (
        <main className="min-h-screen">
            {/* HeroSection */}
            <HeroSection
                title={t('hero_title')}
                subtitle={t('hero_subtitle')}
                backgroundImage="/photos/favorite-hero.jpg"
                showDownload={false}
                showScrollIndicator={true}
            />

            <div className="container mx-auto px-6 py-12">
                <div
                    className="transition-all duration-700 ease-out"
                >
                    {/* En-tête */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-gray-600 hover:text-[#01BDA5] transition-colors cursor-pointer"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span>{filteredFavorites.length} {filteredFavorites.length > 1 ? t('favorites_plural') : t('favorites_singular')}</span>
                        </button>
                        {filteredFavorites.length > 0 && (
                            <Bouton
                                variant="primary"
                                size="medium"
                                onClick={handleClearAll}
                                className="flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                {t('clear_all')}
                            </Bouton>
                        )}
                    </div>

                    {/* Barre de recherche */}
                    <div className="max-w-md mx-auto mb-8">
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

                    {/* Liste des favoris */}
                    <div id="favorites-list">
                        {filteredFavorites.length === 0 ? (
                            <div className="text-center py-16">
                                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">
                                    {searchQuery ? t('no_search_results') : t('no_favorites')}
                                </p>
                                {searchQuery ? (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="mt-4 px-6 py-2 rounded-full border border-[#01BDA5] text-[#01BDA5] hover:bg-[#01BDA5] hover:text-white transition-colors cursor-pointer"
                                    >
                                        {t('clear_search')}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => router.push('/hebergement')}
                                        className="mt-4 px-6 py-2 rounded-full bg-[#01BDA5] text-white hover:bg-[#01A38E] transition-colors cursor-pointer"
                                    >
                                        {t('discover_hotels')}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-wrap justify-start items-start gap-11">
                                    {currentFavorites.map((favori) => (
                                        <div key={favori.id} className="w-[260px]">
                                            <CardHotel
                                                imageUrl={favori.hotel.photo_principale ?? ''}
                                                name={favori.hotel.nom}
                                                hotelId={favori.hotel_id}
                                                availability="Disponible"
                                                price={favori.hotel.prix_min ?? 0}
                                                prixMga={favori.hotel.prix_min_mga}
                                                prixEur={favori.hotel.prix_min_eur}
                                                etoiles={favori.hotel.etoiles ?? undefined}
                                                rating={favori.hotel.note_moyenne ?? 0}
                                                onFavoriteToggle={(isFavorite) => {
                                                    if (!isFavorite) {
                                                        handleRemoveFavorite(favori.hotel_id)
                                                    }
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-2 mt-12">
                                        <button
                                            onClick={() => goToPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`p-2 rounded-full transition-all duration-200 ${
                                                currentPage === 1
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : 'hover:bg-gray-100 cursor-pointer'
                                            }`}
                                            aria-label={t('previous_page')}
                                        >
                                            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
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
                                                } else if (
                                                    page === currentPage - 2 ||
                                                    page === currentPage + 2
                                                ) {
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
                                            aria-label={t('next_page')}
                                        >
                                            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                )}

                                {/* Nombre de résultats */}
                                <div className="text-center mt-6 text-sm text-gray-500">
                                    {filteredFavorites.length} {filteredFavorites.length > 1 ? t('favorites_plural') : t('favorites_singular')}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
