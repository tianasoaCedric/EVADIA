'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronLeft, Search, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react'
import { useOnScreen } from '@/hooks/useOnScreen'
import HotelPhoto from '../../components/ui/HotelPhoto'
import CardDestination from '../../components/ui/CardDestination'
import CardHotel from '../../components/ui/CardHotel'
import Input from '../../components/ui/Input'
import { createSlug } from '@/lib/slug'

interface CityClientProps {
  cityId: number
  cityName: string
  slug: string
}

// Données mock (à remplacer par appel API)
const getCityData = (id: number) => {
  const citiesData: Record<number, any> = {
    1: {
      id: 1,
      name: 'Madagascar',
      heroImage: '/photos/destinations/madagascar-hero.jpg',
      description: 'Découvrez l\'île rouge, ses paysages uniques et sa biodiversité exceptionnelle',
      photos: ['/photos/chambre.jpg', '/photos/test.jpg', '/photos/chambre.jpg', '/photos/test.jpg'],
      cities: [
  { id: 1, imageUrl: '/photos/destinations/paris.jpg', title: 'Antananarivo', href: `/ville/${createSlug(1, 'Antananarivo')}` },
  { id: 2, imageUrl: '/photos/destinations/maldives.jpg', title: 'Nosy Be', href: `/ville/${createSlug(2, 'Nosy Be')}` },
  { id: 3, imageUrl: '/photos/destinations/rome.jpg', title: 'Toamasina', href: `/ville/${createSlug(3, 'Toamasina')}` },
  { id: 4, imageUrl: '/photos/destinations/tokyo.jpg', title: 'Mahajanga', href: `/ville/${createSlug(4, 'Mahajanga')}` },
  { id: 5, imageUrl: '/photos/destinations/new-york.jpg', title: 'Fianarantsoa', href: `/ville/${createSlug(5, 'Fianarantsoa')}` },
  { id: 6, imageUrl: '/photos/destinations/londres.jpg', title: 'Toliara', href: `/ville/${createSlug(6, 'Toliara')}` },
  { id: 7, imageUrl: '/photos/destinations/bali.jpg', title: 'Antsirabe', href: `/ville/${createSlug(7, 'Antsirabe')}` },
  { id: 8, imageUrl: '/photos/destinations/dubai.jpg', title: 'Fort Dauphin', href: `/ville/${createSlug(8, 'Fort Dauphin')}` }
],
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
        },
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
      ],
      popularHotels: [
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
        }
      ]
    }
  }
  return citiesData[id] || null
}

export default function CityClient({ cityId, cityName, slug }: CityClientProps) {
  const router = useRouter()
  const t = useTranslations('CityClient')
  const [searchQuery, setSearchQuery] = useState('')
  const [city, setCity] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filteredHotels, setFilteredHotels] = useState<any[]>([])
  
  // Refs pour les carrousels
  const citiesScrollRef = useRef<HTMLDivElement | null>(null)
  const hotelsScrollRef = useRef<HTMLDivElement | null>(null)
  const popularScrollRef = useRef<HTMLDivElement | null>(null)
  const [citiesScrollPosition, setCitiesScrollPosition] = useState(0)
  const [hotelsScrollPosition, setHotelsScrollPosition] = useState(0)
  const [popularScrollPosition, setPopularScrollPosition] = useState(0)

  // Animation au scroll
  const [setCitiesRef, isCitiesVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })
  const [setHotelsRef, isHotelsVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })
  const [setPopularRef, isPopularVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })

  useEffect(() => {
    const fetchCity = async () => {
      setIsLoading(true)
      try {
        const data = getCityData(cityId)
        setCity(data)
        setFilteredHotels(data?.hotels || [])
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCity()
  }, [cityId])

  // Filtrer les hôtels par recherche
  useEffect(() => {
    if (!city) return
    if (searchQuery.trim() === '') {
      setFilteredHotels(city.hotels)
    } else {
      const filtered = city.hotels.filter((hotel: any) =>
        hotel.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredHotels(filtered)
    }
  }, [searchQuery, city])

  // Gestion du scroll pour le carrousel des villes
  useEffect(() => {
    const container = citiesScrollRef.current
    if (!container) return

    const updateScrollInfo = () => {
      setCitiesScrollPosition(container.scrollLeft)
    }

    updateScrollInfo()
    container.addEventListener('scroll', updateScrollInfo)
    window.addEventListener('resize', updateScrollInfo)

    return () => {
      container.removeEventListener('scroll', updateScrollInfo)
      window.removeEventListener('resize', updateScrollInfo)
    }
  }, [])

  // Gestion du scroll pour le carrousel des hôtels
  useEffect(() => {
    const container = hotelsScrollRef.current
    if (!container) return

    const updateScrollInfo = () => {
      setHotelsScrollPosition(container.scrollLeft)
    }

    updateScrollInfo()
    container.addEventListener('scroll', updateScrollInfo)
    window.addEventListener('resize', updateScrollInfo)

    return () => {
      container.removeEventListener('scroll', updateScrollInfo)
      window.removeEventListener('resize', updateScrollInfo)
    }
  }, [])

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

  const getActiveIndex = (scrollPos: number, itemsLength: number) => {
    const cardWidth = 320
    const gap = 24
    const activeIndex = Math.round(scrollPos / (cardWidth + gap))
    return Math.min(activeIndex, itemsLength - 1)
  }

  const citiesActiveIndex = getActiveIndex(citiesScrollPosition, city?.cities?.length || 0)
  const hotelsActiveIndex = getActiveIndex(hotelsScrollPosition, filteredHotels.length)
  const popularActiveIndex = getActiveIndex(popularScrollPosition, city?.popularHotels?.length || 0)

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

  if (!city) {
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
              {cityName}
            </h1>
          </div>
        </div>

        {/* HotelPhoto */}
        <div className="py-4">
          <HotelPhoto
            imageUrl={city.photos}
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

        {/* Section "Votre destination" */}
        <div
          ref={setCitiesRef}
          className={`mb-16 transition-all duration-700 ease-out ${
            isCitiesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-800 mb-8">
            {t('your_destination')}
          </h2>

          <div className="relative overflow-visible">
            <button
              onClick={() => scrollLeft(citiesScrollRef)}
              className="absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 lg:p-3 shadow-lg transition-all duration-200 hover:scale-110 hidden lg:flex items-center justify-center cursor-pointer"
              aria-label={t('previous_cities')}
            >
              <ChevronLeftIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
            </button>

            <div
              ref={citiesScrollRef}
              className="flex overflow-x-auto scroll-smooth gap-6 sm:gap-1 pb-8 scrollbar-hide overflow-visible"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {city.cities?.map((cityItem: any) => (
                <div key={cityItem.id} className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] p-2">
                  <CardDestination
                    imageUrl={cityItem.imageUrl}
                    title={cityItem.title}
                    href={cityItem.href}
                    height="h-[411px]"
                    width="w-72"
                    hoverEffect="zoom"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => scrollRight(citiesScrollRef)}
              className="absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 lg:p-3 shadow-lg transition-all duration-200 hover:scale-110 hidden lg:flex items-center justify-center cursor-pointer"
              aria-label={t('next_cities')}
            >
              <ChevronRightIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
            </button>

            <div className="flex justify-center gap-2 mt-6 lg:hidden">
              {city.cities?.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => scrollToIndex(citiesScrollRef, index)}
                  className={`transition-all duration-300 cursor-pointer ${
                    citiesActiveIndex === index
                      ? 'w-6 h-2 rounded-full bg-[#01BDA5]'
                      : 'w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={t('go_to_city', { number: index + 1 })}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Section "Notre sélection d'hébergement pour votre destination" - SLIDER */}
        <div
          ref={setHotelsRef}
          className={`mb-16 transition-all duration-700 ease-out ${
            isHotelsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-800 mb-8">
            {t('our_selection')}
          </h2>

          {filteredHotels.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">{t('no_results')}</p>
            </div>
          ) : (
            <div className="relative overflow-visible">
              <button
                onClick={() => scrollLeft(hotelsScrollRef)}
                className="absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 lg:p-3 shadow-lg transition-all duration-200 hover:scale-110 hidden lg:flex items-center justify-center cursor-pointer"
                aria-label={t('previous_hotels')}
              >
                <ChevronLeftIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
              </button>

              <div
                ref={hotelsScrollRef}
                className="flex overflow-x-auto scroll-smooth pb-8 lg:pb-10 scrollbar-hide overflow-visible"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {filteredHotels.map((hotel: any) => (
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
                onClick={() => scrollRight(hotelsScrollRef)}
                className="absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 lg:p-3 shadow-lg transition-all duration-200 hover:scale-110 hidden lg:flex items-center justify-center cursor-pointer"
                aria-label={t('next_hotels')}
              >
                <ChevronRightIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
              </button>

              <div className="flex justify-center gap-2 mt-6 lg:hidden">
                {filteredHotels.map((_: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => scrollToIndex(hotelsScrollRef, index)}
                    className={`transition-all duration-300 cursor-pointer ${
                      hotelsActiveIndex === index
                        ? 'w-6 h-2 rounded-full bg-[#01BDA5]'
                        : 'w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={t('go_to_hotel', { number: index + 1 })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section "Hébergements populaires" - SLIDER */}
        {city.popularHotels && city.popularHotels.length > 0 && (
          <div
            ref={setPopularRef}
            className={`transition-all duration-700 ease-out ${
              isPopularVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-800 mb-8">
              {t('popular_hotels')}
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
                {city.popularHotels?.map((hotel: any) => (
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
                {city.popularHotels?.map((_: any, index: number) => (
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
      </div>
    </main>
  )
}