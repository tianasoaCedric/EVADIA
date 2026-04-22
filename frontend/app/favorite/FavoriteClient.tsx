'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronLeft, Heart, Trash2, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, Search } from 'lucide-react'
import { useOnScreen } from '@/hooks/useOnScreen'
import HeroSection from '../components/ui/HeroSection'
import CardHotel from '../components/ui/CardHotel'
import Bouton from '../components/ui/Bouton'
import Input from '../components/ui/Input'

// Types pour les favoris
interface FavoriteHotel {
    id: number
    imageUrl: string
    name: string
    availability: string
    price: number
    rating: number
    reviewCount: number
    dateAdded: string
}

// Données mock des favoris (à remplacer par appel API / state global)
const getMockFavorites = (): FavoriteHotel[] => {
    return [
        {
            id: 1,
            imageUrl: '/photos/hotels/ecolodge-1.jpg',
            name: 'Ecolodge de la Forêt',
            availability: 'Disponible',
            price: 85000,
            rating: 4.5,
            reviewCount: 128,
            dateAdded: '2026-04-15'
        },
        {
            id: 2,
            imageUrl: '/photos/hotels/villa-1.jpg',
            name: 'Villa de Rêve',
            availability: 'Disponible',
            price: 250000,
            rating: 4.9,
            reviewCount: 234,
            dateAdded: '2026-04-14'
        },
        {
            id: 3,
            imageUrl: '/photos/hotels/luxe-1.jpg',
            name: 'Palace Hôtel',
            availability: 'Disponible',
            price: 450000,
            rating: 4.9,
            reviewCount: 342,
            dateAdded: '2026-04-13'
        },
        {
            id: 4,
            imageUrl: '/photos/hotels/lodge-1.jpg',
            name: 'Lodge des Hautes Terres',
            availability: '3 places restantes',
            price: 110000,
            rating: 4.6,
            reviewCount: 89,
            dateAdded: '2026-04-12'
        },
        {
            id: 5,
            imageUrl: '/photos/hotels/camping-1.jpg',
            name: 'Camping Nature',
            availability: 'Disponible',
            price: 45000,
            rating: 4.3,
            reviewCount: 67,
            dateAdded: '2026-04-11'
        },
        {
            id: 6,
            imageUrl: '/photos/hotels/ecolodge-1.jpg',
            name: 'Ecolodge de la Montagne',
            availability: 'Disponible',
            price: 95000,
            rating: 4.7,
            reviewCount: 156,
            dateAdded: '2026-04-10'
        },
        {
            id: 7,
            imageUrl: '/photos/hotels/villa-2.jpg',
            name: 'Villa Océane',
            availability: 'Disponible',
            price: 280000,
            rating: 4.8,
            reviewCount: 178,
            dateAdded: '2026-04-09'
        },
        {
            id: 8,
            imageUrl: '/photos/hotels/luxe-2.jpg',
            name: 'Royal Palace Hôtel',
            availability: '2 places restantes',
            price: 520000,
            rating: 4.9,
            reviewCount: 412,
            dateAdded: '2026-04-08'
        },
        {
            id: 9,
            imageUrl: '/photos/hotels/lodge-2.jpg',
            name: 'Lodge du Lac',
            availability: 'Disponible',
            price: 125000,
            rating: 4.5,
            reviewCount: 97,
            dateAdded: '2026-04-07'
        },
        {
            id: 10,
            imageUrl: '/photos/hotels/ecolodge-2.jpg',
            name: 'Green Lodge',
            availability: 'Disponible',
            price: 105000,
            rating: 4.6,
            reviewCount: 112,
            dateAdded: '2026-04-06'
        },
        {
            id: 11,
            imageUrl: '/photos/hotels/villa-3.jpg',
            name: 'Villa Soleil',
            availability: 'Complet',
            price: 350000,
            rating: 4.9,
            reviewCount: 267,
            dateAdded: '2026-04-05'
        },
        {
            id: 12,
            imageUrl: '/photos/hotels/luxe-3.jpg',
            name: 'Grand Hôtel Palace',
            availability: 'Disponible',
            price: 380000,
            rating: 4.7,
            reviewCount: 298,
            dateAdded: '2026-04-04'
        },
        {
            id: 13,
            imageUrl: '/photos/hotels/lodge-3.jpg',
            name: 'Lodge des Cimes',
            availability: '3 places restantes',
            price: 135000,
            rating: 4.4,
            reviewCount: 78,
            dateAdded: '2026-04-03'
        },
        {
            id: 14,
            imageUrl: '/photos/hotels/ecolodge-3.jpg',
            name: 'Ecolodge Tropical',
            availability: 'Disponible',
            price: 89000,
            rating: 4.5,
            reviewCount: 134,
            dateAdded: '2026-04-02'
        },
        {
            id: 15,
            imageUrl: '/photos/hotels/villa-4.jpg',
            name: 'Villa Paradis',
            availability: 'Disponible',
            price: 420000,
            rating: 5.0,
            reviewCount: 523,
            dateAdded: '2026-04-01'
        },
        {
            id: 16,
            imageUrl: '/photos/hotels/luxe-4.jpg',
            name: 'Hôtel Impérial',
            availability: 'Disponible',
            price: 480000,
            rating: 4.8,
            reviewCount: 356,
            dateAdded: '2026-03-31'
        },
        {
            id: 17,
            imageUrl: '/photos/hotels/lodge-4.jpg',
            name: 'Lodge du Volcan',
            availability: '2 places restantes',
            price: 145000,
            rating: 4.7,
            reviewCount: 145,
            dateAdded: '2026-03-30'
        },
        {
            id: 18,
            imageUrl: '/photos/hotels/ecolodge-1.jpg',
            name: 'Ecolodge des Palmiers',
            availability: 'Disponible',
            price: 99000,
            rating: 4.4,
            reviewCount: 89,
            dateAdded: '2026-03-29'
        }
    ]
}

export default function FavoriteClient() {
    const router = useRouter()
    const t = useTranslations('FavoriteClient')
    const [favorites, setFavorites] = useState<FavoriteHotel[]>([])
    const [filteredFavorites, setFilteredFavorites] = useState<FavoriteHotel[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    
    // État pour la pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 15

    // Animation au scroll
    const [setMainRef, isMainVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })

    useEffect(() => {
        const fetchFavorites = async () => {
            setIsLoading(true)
            try {
                const data = getMockFavorites()
                setFavorites(data)
                setFilteredFavorites(data)
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
            const filtered = favorites.filter(hotel =>
                hotel.name.toLowerCase().includes(searchQuery.toLowerCase())
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

    const handleRemoveFavorite = (hotelId: number) => {
        const newFavorites = favorites.filter(hotel => hotel.id !== hotelId)
        setFavorites(newFavorites)
        setFilteredFavorites(newFavorites.filter(hotel => 
            hotel.name.toLowerCase().includes(searchQuery.toLowerCase())
        ))
        // Si après suppression la page n'a plus d'éléments, revenir à la page précédente
        if (currentFavorites.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    const handleClearAll = () => {
        setFavorites([])
        setFilteredFavorites([])
        setCurrentPage(1)
        setSearchQuery('')
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
                                    {currentFavorites.map((hotel) => (
                                        <div key={hotel.id} className="w-[260px]">
                                        <CardHotel
                                            imageUrl={hotel.imageUrl}
                                            name={hotel.name}
                                            hotelId={hotel.id}
                                            availability={hotel.availability}
                                            price={hotel.price}
                                            rating={hotel.rating}
                                            reviewCount={hotel.reviewCount}
                                            onFavoriteToggle={(isFavorite) => {
                                                if (!isFavorite) {
                                                    handleRemoveFavorite(hotel.id)
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