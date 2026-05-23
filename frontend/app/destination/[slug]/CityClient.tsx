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

interface Ville {
  id: number
  nom: string
  destination_id: number
  description?: string | null
  image?: string | null
}

interface ApiHotel {
  id: number
  nom: string
  etoiles: number
  photo_principale: string | null
  ville: string | null
  prix_min: number | null
  prix_min_mga?: number | null
  prix_min_eur?: number | null
  note_moyenne: number | null
  nb_avis: number
}

interface DestinationData {
  destination: { id: number; nom: string; description: string; image_url: string }
  villes: Ville[]
}

interface CityClientProps {
  cityId: number
  cityName: string
  slug: string
  initialData: DestinationData
  initialHotels: ApiHotel[]
  initialPopularHotels: ApiHotel[]
}

export default function CityClient({
  cityName,
  slug,
  initialData,
  initialHotels,
  initialPopularHotels,
}: CityClientProps) {
  const router = useRouter()
  const t = useTranslations('CityClient')
  void slug

  const [searchQuery, setSearchQuery]         = useState('')
  const [filteredVilles, setFilteredVilles]   = useState<Ville[]>(initialData.villes)

  const citiesScrollRef  = useRef<HTMLDivElement | null>(null)
  const hotelsScrollRef  = useRef<HTMLDivElement | null>(null)
  const popularScrollRef = useRef<HTMLDivElement | null>(null)
  const [citiesScrollPosition,  setCitiesScrollPosition]  = useState(0)
  const [hotelsScrollPosition,  setHotelsScrollPosition]  = useState(0)
  const [popularScrollPosition, setPopularScrollPosition] = useState(0)

  const [setCitiesRef,  isCitiesVisible]  = useOnScreen({ threshold: 0.2,  })
  const [setHotelsRef,  isHotelsVisible]  = useOnScreen({ threshold: 0.2,  })
  const [setPopularRef, isPopularVisible] = useOnScreen({ threshold: 0.2,  })

  // Filtrage local des villes (pas de fetch)
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredVilles(initialData.villes)
    } else {
      setFilteredVilles(
        initialData.villes.filter((v) =>
          v.nom.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }
  }, [searchQuery, initialData.villes])
const capitalizeWords = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
  // Scroll listeners carrousels
  useEffect(() => {
    const refs = [
      { ref: citiesScrollRef,  set: setCitiesScrollPosition },
      { ref: hotelsScrollRef,  set: setHotelsScrollPosition },
      { ref: popularScrollRef, set: setPopularScrollPosition },
    ]
    const cleanups = refs.map(({ ref, set }) => {
      const el = ref.current
      if (!el) return () => {}
      const update = () => set(el.scrollLeft)
      update()
      el.addEventListener('scroll', update)
      window.addEventListener('resize', update)
      return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
    })
    return () => cleanups.forEach((fn) => fn())
  }, [])

  const getActiveIndex = (scrollPos: number, length: number) =>
    Math.min(Math.round(scrollPos / (320 + 24)), length - 1)

  const citiesActiveIndex  = getActiveIndex(citiesScrollPosition,  filteredVilles.length)
  const hotelsActiveIndex  = getActiveIndex(hotelsScrollPosition,  initialHotels.length)
  const popularActiveIndex = getActiveIndex(popularScrollPosition, initialPopularHotels.length)

  const scrollLeft    = (ref: React.RefObject<HTMLDivElement | null>) => ref.current?.scrollBy({ left: -(320 + 24), behavior: 'smooth' })
  const scrollRight   = (ref: React.RefObject<HTMLDivElement | null>) => ref.current?.scrollBy({ left:  (320 + 24), behavior: 'smooth' })
  const scrollToIndex = (ref: React.RefObject<HTMLDivElement | null>, index: number) => ref.current?.scrollTo({ left: index * (320 + 24), behavior: 'smooth' })

  const destinationImage = initialData.destination.image_url || '/photos/destinations/nord.jpg'

  return (
    <main className="min-h-screen pt-8 pb-16">
      <div className="container mx-auto px-4">

        {/* Header */}
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
              {capitalizeWords(cityName)}
            </h1>
          </div>
        </div>

        {/* Photo de la destination */}
        <div className="py-4">
          <HotelPhoto
            imageUrl={[destinationImage, destinationImage]}
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

        {/* Section villes */}
        <div
          ref={setCitiesRef}
          className={`mb-16 transition-all duration-700 ease-out ${
            isCitiesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-800 mb-8">
            {t('your_destination')}
          </h2>

          {filteredVilles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">{t('no_results')}</p>
            </div>
          ) : (
            <div className="relative overflow-visible">
              <button onClick={() => scrollLeft(citiesScrollRef)} className="absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 lg:p-3 shadow-lg transition-all duration-200 hover:scale-110 hidden lg:flex items-center justify-center cursor-pointer" aria-label={t('previous_cities')}>
                <ChevronLeftIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
              </button>
              <div ref={citiesScrollRef} className="flex overflow-x-auto scroll-smooth gap-6 sm:gap-1 pb-8 scrollbar-hide overflow-visible" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {filteredVilles.map((ville, index) => (
                  <div key={ville.id} className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] p-2">
                    <CardDestination
                      imageUrl={ville.image ?? destinationImage}
                      title={ville.nom}
                      href={`/ville/${createSlug(ville.id, ville.nom)}`}
                      height="h-[411px]"
                      width="w-72"
                      hoverEffect="zoom"
                      priority={index < 3}
                    />
                  </div>
                ))}
              </div>
              <button onClick={() => scrollRight(citiesScrollRef)} className="absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 lg:p-3 shadow-lg transition-all duration-200 hover:scale-110 hidden lg:flex items-center justify-center cursor-pointer" aria-label={t('next_cities')}>
                <ChevronRightIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
              </button>
              <div className="flex justify-center gap-2 mt-6 lg:hidden">
                {filteredVilles.map((_, index) => (
                  <button key={index} onClick={() => scrollToIndex(citiesScrollRef, index)} className={`transition-all duration-300 cursor-pointer ${citiesActiveIndex === index ? 'w-6 h-2 rounded-full bg-[#01BDA5]' : 'w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400'}`} aria-label={t('go_to_city', { number: index + 1 })} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section sélection */}
        {initialHotels.length > 0 && (
          <div ref={setHotelsRef} className={`mb-16 transition-all duration-700 ease-out ${isHotelsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-800 mb-8">{t('our_selection')}</h2>
            <div className="relative overflow-visible">
              <button onClick={() => scrollLeft(hotelsScrollRef)} className="absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 lg:p-3 shadow-lg transition-all duration-200 hover:scale-110 hidden lg:flex items-center justify-center cursor-pointer" aria-label={t('previous_hotels')}>
                <ChevronLeftIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
              </button>
              <div ref={hotelsScrollRef} className="flex overflow-x-auto scroll-smooth pb-8 lg:pb-10 scrollbar-hide overflow-visible" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {initialHotels.map((hotel, index) => (
                  <div key={hotel.id} className="flex-shrink-0 w-[280px] p-2">
                    <CardHotel
                      imageUrl={hotel.photo_principale ?? ''}
                      name={hotel.nom}
                      hotelId={hotel.id}
                      availability="Disponible"
                      price={hotel.prix_min ?? 0}
                      prixMga={hotel.prix_min_mga ?? undefined}
                      prixEur={hotel.prix_min_eur ?? undefined}
                      priority={index < 3}
                      rating={hotel.note_moyenne ?? 0}
                      reviewCount={hotel.nb_avis}
                    />
                  </div>
                ))}
              </div>
              <button onClick={() => scrollRight(hotelsScrollRef)} className="absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 lg:p-3 shadow-lg transition-all duration-200 hover:scale-110 hidden lg:flex items-center justify-center cursor-pointer" aria-label={t('next_hotels')}>
                <ChevronRightIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
              </button>
              <div className="flex justify-center gap-2 mt-6 lg:hidden">
                {initialHotels.map((_, index) => (
                  <button key={index} onClick={() => scrollToIndex(hotelsScrollRef, index)} className={`transition-all duration-300 cursor-pointer ${hotelsActiveIndex === index ? 'w-6 h-2 rounded-full bg-[#01BDA5]' : 'w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400'}`} aria-label={t('go_to_hotel', { number: index + 1 })} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section populaires */}
        {initialPopularHotels.length > 0 && (
          <div ref={setPopularRef} className={`mb-16 transition-all duration-700 ease-out ${isPopularVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-800 mb-8">{t('popular_hotels')}</h2>
            <div className="relative overflow-visible">
              <button onClick={() => scrollLeft(popularScrollRef)} className="absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 lg:p-3 shadow-lg transition-all duration-200 hover:scale-110 hidden lg:flex items-center justify-center cursor-pointer" aria-label={t('previous_popular')}>
                <ChevronLeftIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
              </button>
              <div ref={popularScrollRef} className="flex overflow-x-auto scroll-smooth pb-8 lg:pb-10 scrollbar-hide overflow-visible" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {initialPopularHotels.map((hotel, index) => (
                  <div key={hotel.id} className="flex-shrink-0 w-[280px] p-2">
                    <CardHotel
                      imageUrl={hotel.photo_principale ?? ''}
                      name={hotel.nom}
                      hotelId={hotel.id}
                      availability="Disponible"
                      price={hotel.prix_min ?? 0}
                      prixMga={hotel.prix_min_mga ?? undefined}
                      prixEur={hotel.prix_min_eur ?? undefined}
                      priority={index < 3}
                      rating={hotel.note_moyenne ?? 0}
                      reviewCount={hotel.nb_avis}
                    />
                  </div>
                ))}
              </div>
              <button onClick={() => scrollRight(popularScrollRef)} className="absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 lg:p-3 shadow-lg transition-all duration-200 hover:scale-110 hidden lg:flex items-center justify-center cursor-pointer" aria-label={t('next_popular')}>
                <ChevronRightIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
              </button>
              <div className="flex justify-center gap-2 mt-6 lg:hidden">
                {initialPopularHotels.map((_, index) => (
                  <button key={index} onClick={() => scrollToIndex(popularScrollRef, index)} className={`transition-all duration-300 cursor-pointer ${popularActiveIndex === index ? 'w-6 h-2 rounded-full bg-[#01BDA5]' : 'w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400'}`} aria-label={t('go_to_popular', { number: index + 1 })} />
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
