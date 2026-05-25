'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react'
import { useOnScreen } from '@/hooks/useOnScreen'
import CardHotel from '../../components/ui/CardHotel'
import HotelPhoto from '@/app/components/ui/HotelPhoto'
import Filters, { FilterValues } from '../../components/ui/Filters'

interface VilleClientProps {
  villeName: string
  slug: string
  initialHotels: ApiHotel[]
  initialSelectionHotels: ApiHotel[]
}

export interface ApiHotel {
  id: number
  nom: string
  etoiles: number | null
  photo_principale: string | null
  ville: string | null
  prix_min: number | null
  prix_min_mga?: number | null
  prix_min_eur?: number | null
  note_moyenne: number | null
  nb_avis: number
}

export default function VilleClient({
  villeName,
  slug,
  initialHotels,
  initialSelectionHotels,
}: VilleClientProps) {
  const router = useRouter()
  const t = useTranslations('VilleClient')
  void slug

  const [selectionHotels]             = useState<ApiHotel[]>(initialSelectionHotels)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters]         = useState<FilterValues>({
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

  const selectionScrollRef = useRef<HTMLDivElement | null>(null)
  const [selectionScrollPos, setSelectionScrollPos] = useState(0)

  const [setSelectionRef, isSelectionVisible] = useOnScreen({ threshold: 0.2 })
  const [setHotelsRef, isHotelsVisible]       = useOnScreen({ threshold: 0.2 })

  // Filtrage calculé au render — pas de setState dans useEffect
  const filteredHotels = useMemo(() => {
    let result = initialHotels
    if (filters.priceMin) result = result.filter(h => (h.prix_min ?? 0) >= filters.priceMin!)
    if (filters.priceMax) result = result.filter(h => (h.prix_min ?? 0) <= filters.priceMax!)
    if (filters.stars > 0) result = result.filter(h => (h.etoiles ?? 0) >= filters.stars)
    if (filters.minRating > 0) result = result.filter(h => (h.note_moyenne ?? 0) >= filters.minRating)
    if (filters.search) result = result.filter(h => h.nom.toLowerCase().includes(filters.search.toLowerCase()))
    return result
  }, [filters, initialHotels])

  // Remettre à la page 1 quand les filtres changent
  const prevFilters = useRef(filters)
  if (prevFilters.current !== filters) {
    prevFilters.current = filters
    if (currentPage !== 1) setCurrentPage(1)
  }

  const handleFilterChange = (newFilters: FilterValues) => setFilters(newFilters)

  const capitalizeWords = (str: string) =>
    str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  // Pagination
  const itemsPerPage = 12
  const totalPages   = Math.ceil(filteredHotels.length / itemsPerPage)
  const currentHotels = filteredHotels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const total         = filteredHotels.length

  useEffect(() => {
    const el = selectionScrollRef.current
    if (!el) return
    const update = () => setSelectionScrollPos(el.scrollLeft)
    update()
    el.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])

  const getActiveIndex = (scrollPos: number, length: number) =>
    Math.min(Math.round(scrollPos / (320 + 24)), length - 1)

  const selectionActiveIndex = getActiveIndex(selectionScrollPos, selectionHotels.length)

  const scrollLeft  = (ref: React.RefObject<HTMLDivElement | null>) =>
    ref.current?.scrollBy({ left: -(320 + 24), behavior: 'smooth' })
  const scrollRight = (ref: React.RefObject<HTMLDivElement | null>) =>
    ref.current?.scrollBy({ left: 320 + 24, behavior: 'smooth' })
  const scrollToIndex = (ref: React.RefObject<HTMLDivElement | null>, index: number) =>
    ref.current?.scrollTo({ left: index * (320 + 24), behavior: 'smooth' })

  const goToPage = (page: number) => {
    const p = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(p)
    document.getElementById('hotels-list')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen pt-8 pb-16">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <button
            onClick={() => router.back()}
            className="rounded-full transition-colors cursor-pointer"
            aria-label={t('back_label')}
          >
            <ChevronLeft className="w-8 h-8 text-gray-600 hover:text-[#01BDA5] transition-colors" />
          </button>
          <h1 className="text-xl md:text-3xl lg:text-4xl font-medium text-gray-800">
            {capitalizeWords(villeName)}
          </h1>
        </div>

        {/* Photo de la destination */}
        <div className="py-4">
          <HotelPhoto
            imageUrl={['/photos/destinations/nord.jpg', '/photos/destinations/nord.jpg']}
            autoPlayInterval={5000}
            className="mb-4"
          />
        </div>

        {/* Composant Filters - remplace la barre de recherche */}
        <div className="mb-12">
          <Filters 
            onFilterChange={handleFilterChange}
            initialFilters={filters}
            enabledFilters={['price', 'stars', 'rating']}
          />
        </div>

        {/* Section sélection (carrousel) */}
        {selectionHotels.length > 0 && (
          <div
            ref={setSelectionRef}
            className={`mb-16 transition-all duration-700 ease-out ${
              isSelectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-800 mb-8">
              {t('our_selection')}
            </h2>

            <div className="relative overflow-visible">
              <button
                onClick={() => scrollLeft(selectionScrollRef)}
                className="absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 lg:p-3 shadow-lg transition-all duration-200 hover:scale-110 hidden lg:flex items-center justify-center cursor-pointer"
                aria-label={t('previous_popular')}
              >
                <ChevronLeftIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
              </button>

              <div
                ref={selectionScrollRef}
                className="flex overflow-x-auto scroll-smooth pb-8 lg:pb-10 scrollbar-hide overflow-visible"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {selectionHotels.map((hotel, index) => (
                  <div key={hotel.id} className="flex-shrink-0 w-[280px] p-2">
                    <CardHotel
                      imageUrl={hotel.photo_principale ?? ''}
                      name={hotel.nom}
                      ville={hotel.ville ?? undefined}
                      hotelId={hotel.id}
                      availability="Disponible"
                      price={hotel.prix_min ?? 0}
                      prixMga={hotel.prix_min_mga ?? undefined}
                      prixEur={hotel.prix_min_eur ?? undefined}
                      priority={index < 3}
                      etoiles={hotel.etoiles ?? undefined}
                      rating={hotel.note_moyenne ?? 0}
                      reviewCount={hotel.nb_avis}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => scrollRight(selectionScrollRef)}
                className="absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 lg:p-3 shadow-lg transition-all duration-200 hover:scale-110 hidden lg:flex items-center justify-center cursor-pointer"
                aria-label={t('next_popular')}
              >
                <ChevronRightIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
              </button>

              <div className="flex justify-center gap-2 mt-6 lg:hidden">
                {selectionHotels.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToIndex(selectionScrollRef, index)}
                    className={`transition-all duration-300 cursor-pointer ${
                      selectionActiveIndex === index
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

        {/* Grille hôtels avec filtres */}
        <div
          ref={setHotelsRef}
          id="hotels-list"
          className={`transition-all duration-700 ease-out ${
            isHotelsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-800 mb-8">
            {t('hotels_title', { name: capitalizeWords(villeName) })}
          </h2>

          {currentHotels.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">{t('no_results')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentHotels.map((hotel, index) => (
                  <CardHotel
                    key={hotel.id}
                    imageUrl={hotel.photo_principale ?? ''}
                    name={hotel.nom}
                    ville={hotel.ville ?? undefined}
                    hotelId={hotel.id}
                    availability="Disponible"
                    price={hotel.prix_min ?? 0}
                    prixMga={hotel.prix_min_mga ?? undefined}
                    prixEur={hotel.prix_min_eur ?? undefined}
                    priority={index < 4}
                    etoiles={hotel.etoiles ?? undefined}
                    rating={hotel.note_moyenne ?? 0}
                    reviewCount={hotel.nb_avis}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'
                    }`}
                    aria-label={t('previous_page')}
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`w-8 h-8 rounded-full transition-all duration-200 cursor-pointer ${
                              currentPage === page ? 'bg-[#01BDA5] text-white' : 'hover:bg-gray-100 text-gray-600'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="w-8 h-8 flex items-center justify-center text-gray-400">...</span>
                      }
                      return null
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'
                    }`}
                    aria-label={t('next_page')}
                  >
                    <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              )}

              <div className="text-center mt-6 text-sm text-gray-500">
                {total} {total > 1 ? t('results_plural') : t('results_singular')}
              </div>
            </>
          )}
        </div>

      </div>
    </main>
  )
}