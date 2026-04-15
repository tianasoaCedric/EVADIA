'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronLeft, Search, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react'
import { useOnScreen } from '@/hooks/useOnScreen'
import HotelPhoto from '../../components/ui/HotelPhoto'
import CardHotel from '../../components/ui/CardHotel'
import Input from '../../components/ui/Input'

interface VilleClientProps {
  villeId: number
  villeName: string
  slug: string
}

// Données mock (à remplacer par appel API)
const getVilleData = (id: number) => {
  const villesData: Record<number, any> = {
    1: {
      id: 1,
      name: 'Antananarivo',
      photos: ['/photos/chambre.jpg', '/photos/test.jpg', '/photos/chambre.jpg', '/photos/test.jpg'],
      hotels: [
        {
          id: 1,
          imageUrl: '/photos/hotels/ecolodge-1.jpg',
          name: 'Hôtel Carlton',
          availability: 'Disponible',
          price: 150000,
          rating: 4.5,
          reviewCount: 128
        },
        {
          id: 2,
          imageUrl: '/photos/hotels/ecolodge-2.jpg',
          name: 'Hôtel Colbert',
          availability: '2 places restantes',
          price: 120000,
          rating: 4.3,
          reviewCount: 95
        },
        {
          id: 3,
          imageUrl: '/photos/hotels/ecolodge-3.jpg',
          name: 'Hôtel de la Paix',
          availability: 'Disponible',
          price: 180000,
          rating: 4.7,
          reviewCount: 203
        },
        {
          id: 4,
          imageUrl: '/photos/hotels/villa-1.jpg',
          name: 'Villa Royale',
          availability: 'Disponible',
          price: 350000,
          rating: 4.9,
          reviewCount: 89
        },
        {
          id: 5,
          imageUrl: '/photos/hotels/villa-2.jpg',
          name: 'Hôtel Cristal',
          availability: 'Complet',
          price: 220000,
          rating: 4.6,
          reviewCount: 156
        },
        {
          id: 6,
          imageUrl: '/photos/hotels/luxe-1.jpg',
          name: 'Palace Hôtel',
          availability: 'Disponible',
          price: 450000,
          rating: 4.9,
          reviewCount: 342
        },
        {
          id: 7,
          imageUrl: '/photos/hotels/maison-1.jpg',
          name: 'Maison Tropicale',
          availability: 'Disponible',
          price: 120000,
          rating: 4.4,
          reviewCount: 56
        },
        {
          id: 8,
          imageUrl: '/photos/hotels/lodge-1.jpg',
          name: 'Lodge des Hautes Terres',
          availability: '3 places restantes',
          price: 110000,
          rating: 4.6,
          reviewCount: 89
        },
        {
          id: 9,
          imageUrl: '/photos/hotels/bungalow-1.jpg',
          name: 'Bungalow Beach',
          availability: 'Disponible',
          price: 65000,
          rating: 4.2,
          reviewCount: 145
        },
        {
          id: 10,
          imageUrl: '/photos/hotels/ecolodge-1.jpg',
          name: 'Ecolodge du Sud',
          availability: 'Disponible',
          price: 95000,
          rating: 4.6,
          reviewCount: 112
        },
        {
          id: 11,
          imageUrl: '/photos/hotels/ecolodge-2.jpg',
          name: 'Green Paradise Hotel',
          availability: 'Disponible',
          price: 130000,
          rating: 4.5,
          reviewCount: 78
        },
        {
          id: 12,
          imageUrl: '/photos/hotels/ecolodge-3.jpg',
          name: 'Nature Lodge',
          availability: '2 places restantes',
          price: 85000,
          rating: 4.3,
          reviewCount: 67
        },
        {
          id: 13,
          imageUrl: '/photos/hotels/ecolodge-1.jpg',
          name: 'Ecolodge du Sud',
          availability: 'Disponible',
          price: 95000,
          rating: 4.6,
          reviewCount: 112
        },
        {
          id: 14,
          imageUrl: '/photos/hotels/ecolodge-2.jpg',
          name: 'Green Paradise Hotel',
          availability: 'Disponible',
          price: 130000,
          rating: 4.5,
          reviewCount: 78
        },
        {
          id: 15,
          imageUrl: '/photos/hotels/ecolodge-3.jpg',
          name: 'Nature Lodge',
          availability: '2 places restantes',
          price: 85000,
          rating: 4.3,
          reviewCount: 67
        },
        {
          id: 16,
          imageUrl: '/photos/hotels/ecolodge-3.jpg',
          name: 'Nature Lodge',
          availability: '2 places restantes',
          price: 85000,
          rating: 4.3,
          reviewCount: 67
        }
      ],
      popularHotels: [
        {
          id: 1,
          imageUrl: '/photos/hotels/ecolodge-1.jpg',
          name: 'Hôtel Carlton',
          availability: 'Disponible',
          price: 150000,
          rating: 4.5,
          reviewCount: 128
        },
        {
          id: 3,
          imageUrl: '/photos/hotels/ecolodge-3.jpg',
          name: 'Hôtel de la Paix',
          availability: 'Disponible',
          price: 180000,
          rating: 4.7,
          reviewCount: 203
        },
        {
          id: 4,
          imageUrl: '/photos/hotels/villa-1.jpg',
          name: 'Villa Royale',
          availability: 'Disponible',
          price: 350000,
          rating: 4.9,
          reviewCount: 89
        },
        {
          id: 6,
          imageUrl: '/photos/hotels/luxe-1.jpg',
          name: 'Palace Hôtel',
          availability: 'Disponible',
          price: 450000,
          rating: 4.9,
          reviewCount: 342
        },
        {
          id: 17,
          imageUrl: '/photos/hotels/luxe-1.jpg',
          name: 'Palace Hôtel',
          availability: 'Disponible',
          price: 450000,
          rating: 4.9,
          reviewCount: 342
        },
        {
          id: 18,
          imageUrl: '/photos/hotels/luxe-1.jpg',
          name: 'Palace Hôtel',
          availability: 'Disponible',
          price: 450000,
          rating: 4.9,
          reviewCount: 342
        }
      ]
    }
  }
  return villesData[id] || null
}

export default function VilleClient({ villeId, villeName, slug }: VilleClientProps) {
  const router = useRouter()
  const t = useTranslations('VilleClient')
  const [searchQuery, setSearchQuery] = useState('')
  const [ville, setVille] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filteredHotels, setFilteredHotels] = useState<any[]>([])
  
  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Refs pour le carrousel
  const popularScrollRef = useRef<HTMLDivElement | null>(null)
  const [popularScrollPosition, setPopularScrollPosition] = useState(0)

  // Animation au scroll
  const [setPopularRef, isPopularVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })
  const [setHotelsRef, isHotelsVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })

  useEffect(() => {
    const fetchVille = async () => {
      setIsLoading(true)
      try {
        const data = getVilleData(villeId)
        setVille(data)
        setFilteredHotels(data?.hotels || [])
        setCurrentPage(1)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVille()
  }, [villeId])

  // Filtrer les hôtels par recherche
  useEffect(() => {
    if (!ville) return
    if (searchQuery.trim() === '') {
      setFilteredHotels(ville.hotels)
    } else {
      const filtered = ville.hotels.filter((hotel: any) =>
        hotel.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredHotels(filtered)
    }
    setCurrentPage(1)
  }, [searchQuery, ville])

  // Gestion du scroll pour le carrousel des hôtels populaires
  useEffect(() => {
    const container = popularScrollRef.current
    if (!container) return

    const updateScrollInfo = () => {
      setPopularScrollPosition(container.scrollLeft)
    }

    updateScrollInfo()
    container.addEventListener('scroll', updateScrollInfo)
    window.addEventListener('resize', updateScrollInfo)

    return () => {
      container.removeEventListener('scroll', updateScrollInfo)
      window.removeEventListener('resize', updateScrollInfo)
    }
  }, [])

  // Pagination
  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentHotels = filteredHotels.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    document.getElementById('hotels-list')?.scrollIntoView({ behavior: 'smooth' })
  }

  const getActiveIndex = (scrollPos: number, itemsLength: number) => {
    const cardWidth = 320
    const gap = 24
    const activeIndex = Math.round(scrollPos / (cardWidth + gap))
    return Math.min(activeIndex, itemsLength - 1)
  }

  const popularActiveIndex = getActiveIndex(popularScrollPosition, ville?.popularHotels?.length || 0)

  const scrollLeft = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const cardWidth = 320
      const gap = 24
      ref.current.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' })
    }
  }

  const scrollRight = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const cardWidth = 320
      const gap = 24
      ref.current.scrollBy({ left: cardWidth + gap, behavior: 'smooth' })
    }
  }

  const scrollToIndex = (ref: React.RefObject<HTMLDivElement | null>, index: number) => {
    if (ref.current) {
      const cardWidth = 320
      const gap = 24
      ref.current.scrollTo({ left: index * (cardWidth + gap), behavior: 'smooth' })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">{t('loading')}</div>
      </div>
    )
  }

  if (!ville) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">{t('not_found')}</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header avec retour et titre */}
        <div className="flex flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="rounded-full transition-colors cursor-pointer"
              aria-label={t('back_label')}
            >
              <ChevronLeft className="w-8 h-8 text-gray-600 hover:text-[#01BDA5] transition-colors" />
            </button>
            <h1 className="text-xl md:text-3xl lg:text-4xl font-medium text-gray-800">
              {villeName}
            </h1>
          </div>
        </div>

        {/* HotelPhoto */}
        <div className="py-4">
          <HotelPhoto
            imageUrl={ville.photos}
            autoPlayInterval={5000}
            className="mb-4"
          />
        </div>

        {/* Barre de recherche */}
        <div className="max-w-md mx-auto my-8">
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

        {/* Section "Hébergements populaires à {villeName}" - SLIDER */}
        {ville.popularHotels && ville.popularHotels.length > 0 && (
          <div
            ref={setPopularRef}
            className={`mb-4 transition-all duration-700 ease-out ${
              isPopularVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-800 mb-8">
              {t('popular_hotels', { name: villeName })}
            </h2>

            <div className="relative overflow-visible">
              <button
                onClick={() => scrollLeft(popularScrollRef)}
                className="absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 lg:p-3 shadow-lg transition-all duration-200 hover:scale-110 hidden lg:flex items-center justify-center cursor-pointer"
                aria-label={t('previous_popular')}
              >
                <ChevronLeftIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
              </button>

              <div
                ref={popularScrollRef}
                className="flex overflow-x-auto scroll-smooth pb-8 lg:pb-10 scrollbar-hide overflow-visible"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {ville.popularHotels?.map((hotel: any) => (
                  <div key={hotel.id} className="flex-shrink-0 w-[280px] sm:w-[280px] p-2">
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

              <button
                onClick={() => scrollRight(popularScrollRef)}
                className="absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 lg:p-3 shadow-lg transition-all duration-200 hover:scale-110 hidden lg:flex items-center justify-center cursor-pointer"
                aria-label={t('next_popular')}
              >
                <ChevronRightIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
              </button>

              <div className="flex justify-center gap-2 mt-6 lg:hidden">
                {ville.popularHotels?.map((_: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => scrollToIndex(popularScrollRef, index)}
                    className={`transition-all duration-300 cursor-pointer ${
                      popularActiveIndex === index
                        ? 'w-6 h-2 rounded-full bg-[#01BDA5]'
                        : 'w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={t('go_to_popular', { number: index + 1 })}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section "Hébergements à {villeName}" - GRILLE AVEC PAGINATION */}
        <div
          ref={setHotelsRef}
          id="hotels-list"
          className={`transition-all duration-700 ease-out ${
            isHotelsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-800 mb-8">
            {t('hotels_title', { name: villeName })}
          </h2>

          {currentHotels.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">{t('no_results')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentHotels.map((hotel: any) => (
                  <CardHotel
                    key={hotel.id}
                    imageUrl={hotel.imageUrl}
                    name={hotel.name}
                    hotelId={hotel.id}
                    availability={hotel.availability}
                    price={hotel.price}
                    rating={hotel.rating}
                    reviewCount={hotel.reviewCount}
                  />
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
                {filteredHotels.length} {filteredHotels.length > 1 ? t('results_plural') : t('results_singular')}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}