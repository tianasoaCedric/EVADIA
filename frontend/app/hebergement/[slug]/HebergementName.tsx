'use client'

import { useState, useEffect } from 'react'
import HeroSection from '../../components/ui/HeroSection'
import Input from '../../components/ui/Input'
import CardHotel from '../../components/ui/CardHotel'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface HebergementNameProps {
    categoryId: number
    categoryName: string
    slug: string
}

// Données mock des catégories avec leurs IDs
const categoriesData: Record<number, { name: string, hotels: any[] }> = {
    1: {
        name: 'Ecolodge',
        hotels: [
            {
                id: 1,
                imageUrl: '/photos/hotels/ecolodge-1.jpg',
                name: 'Ecolodge de la Forêt',
                availability: 'Disponible',
                price: 85000,
                rating: 4.5,
                reviewCount: 128
            },
            {
                id: 2,
                imageUrl: '/photos/hotels/ecolodge-2.jpg',
                name: 'Green Paradise Ecolodge',
                availability: '2 places restantes',
                price: 95000,
                rating: 4.7,
                reviewCount: 95
            },
            {
                id: 3,
                imageUrl: '/photos/hotels/ecolodge-3.jpg',
                name: 'Nature Lodge',
                availability: 'Disponible',
                price: 75000,
                rating: 4.3,
                reviewCount: 76
            }
        ]
    },
    2: {
        name: 'Villas',
        hotels: [
            {
                id: 4,
                imageUrl: '/photos/hotels/villa-1.jpg',
                name: 'Villa de Rêve',
                availability: 'Disponible',
                price: 250000,
                rating: 4.9,
                reviewCount: 234
            },
            {
                id: 5,
                imageUrl: '/photos/hotels/villa-2.jpg',
                name: 'Villa Azur',
                availability: 'Complet',
                price: 320000,
                rating: 4.8,
                reviewCount: 187
            }
        ]
    },
    3: {
        name: 'Hôtel de luxe',
        hotels: [
            {
                id: 6,
                imageUrl: '/photos/hotels/luxe-1.jpg',
                name: 'Palace Hôtel',
                availability: 'Disponible',
                price: 450000,
                rating: 4.9,
                reviewCount: 342
            }
        ]
    },
    4: {
        name: 'Maison de vacances',
        hotels: [
            {
                id: 7,
                imageUrl: '/photos/hotels/maison-1.jpg',
                name: 'Maison Tropicale',
                availability: 'Disponible',
                price: 120000,
                rating: 4.4,
                reviewCount: 56
            }
        ]
    },
    5: {
        name: 'Lodge',
        hotels: [
            {
                id: 8,
                imageUrl: '/photos/hotels/lodge-1.jpg',
                name: 'Lodge des Hautes Terres',
                availability: '3 places restantes',
                price: 110000,
                rating: 4.6,
                reviewCount: 89
            }
        ]
    },
    6: {
        name: 'Bungalows',
        hotels: [
            {
                id: 9,
                imageUrl: '/photos/hotels/bungalow-1.jpg',
                name: 'Bungalow Beach',
                availability: 'Disponible',
                price: 65000,
                rating: 4.2,
                reviewCount: 145
            }
        ]
    }
}

export default function HebergementName({ categoryId, categoryName, slug }: HebergementNameProps) {
    const t = useTranslations('HotelsByCategory')
    const [searchQuery, setSearchQuery] = useState('')
    const [hotels, setHotels] = useState<any[]>([])
    const [filteredHotels, setFilteredHotels] = useState<any[]>([])
    
    // État pour la pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 15

    useEffect(() => {
        const categoryData = categoriesData[categoryId]
        if (categoryData) {
            setHotels(categoryData.hotels)
            setFilteredHotels(categoryData.hotels)
        } else {
            setHotels([])
            setFilteredHotels([])
        }
        setCurrentPage(1)
    }, [categoryId])

    // Filtrer les hôtels par recherche
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredHotels(hotels)
        } else {
            const filtered = hotels.filter(hotel =>
                hotel.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setFilteredHotels(filtered)
        }
        setCurrentPage(1)
    }, [searchQuery, hotels])

    // Pagination
    const totalPages = Math.ceil(filteredHotels.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentHotels = filteredHotels.slice(startIndex, endIndex)

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
        document.getElementById('hotels-list')?.scrollIntoView({ behavior: 'smooth' })
    }

    const heroTitle = categoryName === 'Hôtel de luxe' ? 'Hôtels de luxe' : categoryName

    return (
        <>
            <HeroSection
                title={`${heroTitle} à Madagascar`}
                subtitle={`Découvrez notre sélection des meilleurs ${categoryName.toLowerCase()} pour vos vacances`}
                backgroundImage={`/images/categories/${categoryName.toLowerCase()}.jpg`}
                showDownload={false}
                showScrollIndicator={false}
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

                    {/* Résultats */}
                    <div id="hotels-list">
                        {currentHotels.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-gray-500 text-lg">{t('no_results')}</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-wrap justify-center items-start gap-6">
                                    {currentHotels.map((hotel) => (
                                        <div key={hotel.id} className="w-[200px] sm:w-[220px] md:w-[200px] lg:w-[220px] xl:w-[200px] flex-shrink-0">
                                            <CardHotel
                                                imageUrl={hotel.imageUrl}
                                                name={hotel.name}
                                                hotelId={hotel.id}
                                                availability={hotel.availability}
                                                price={hotel.price}
                                                rating={hotel.rating}
                                                reviewCount={hotel.reviewCount}
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
                                            aria-label="Page précédente"
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
                                            aria-label="Page suivante"
                                        >
                                            <ChevronRight className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                )}

                                {/* Nombre de résultats */}
                                <div className="text-center mt-6 text-sm text-gray-500">
                                    {filteredHotels.length} {filteredHotels.length > 1 ? t('results_plural') : t('results_singular')}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </>
    )
}