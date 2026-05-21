'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronLeft, Search, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react'
import { useOnScreen } from '@/hooks/useOnScreen'
import CardHotel from '../../components/ui/CardHotel'
import Input from '../../components/ui/Input'
import { apiClient } from '@/lib/api-client'

interface VilleClientProps {
  villeId: number
  villeName: string
  slug: string
}

interface ApiHotel {
  id: number
  nom: string
  etoiles: number | null
  photo_principale: string | null
  ville: string | null
  prix_min: number | null
  note_moyenne: number | null
  nb_avis: number
}

interface PaginatedHotels {
  data: ApiHotel[]
  current_page: number
  last_page: number
  total: number
}

export default function VilleClient({ villeId, villeName, slug }: VilleClientProps) {
  const router = useRouter()
  const t = useTranslations('VilleClient')

  const [hotels, setHotels] = useState<ApiHotel[]>([])
  const [selectionHotels, setSelectionHotels] = useState<ApiHotel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)

  // Carrousel sélection
  const selectionScrollRef = useRef<HTMLDivElement | null>(null)
  const [selectionScrollPos, setSelectionScrollPos] = useState(0)

  // Animations
  const [setSelectionRef, isSelectionVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })
  const [setHotelsRef, isHotelsVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })

  // suppress unused warning for slug (used by parent for metadata)
  void slug

  const fetchHotels = async (page: number, search: string) => {
    const params = new URLSearchParams({ page: String(page) })
    if (search.trim()) params.set('search', search.trim())
    const res = await apiClient.get<PaginatedHotels>(`/villes/${villeId}/hotels?${params}`)
    setHotels(res.data)
    setCurrentPage(res.current_page)
    setLastPage(res.last_page)
    setTotal(res.total)
  }

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true)
      try {
        const [hotelsRes, selectionRes] = await Promise.all([
          apiClient.get<PaginatedHotels>(`/villes/${villeId}/hotels`),
          apiClient.get<{ data: ApiHotel[] }>(`/villes/${villeId}/hotels?selection=1`),
        ])
        setHotels(hotelsRes.data)
        setCurrentPage(hotelsRes.current_page)
        setLastPage(hotelsRes.last_page)
        setTotal(hotelsRes.total)
        setSelectionHotels(selectionRes.data)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAll()
  }, [villeId])

  // Re-fetch on search change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHotels(1, searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery]) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll listener sélection
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
    const p = Math.max(1, Math.min(page, lastPage))
    fetchHotels(p, searchQuery)
    document.getElementById('hotels-list')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">{t('loading')}</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
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
            {villeName}
          </h1>
        </div>

        {/* Barre de recherche */}
        <div className="max-w-md mx-auto mb-12">
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

        {/* Section sélection d'hébergement (Signature) */}
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
                      hotelId={hotel.id}
                      availability="Disponible"
                      price={hotel.prix_min ?? 0}
                      prixMga={hotel.prix_min_mga}
                      prixEur={hotel.prix_min_eur}
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

        {/* Section tous les hôtels — grille paginée */}
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

          {hotels.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">{t('no_results')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {hotels.map((hotel) => (
                  <CardHotel
                    key={hotel.id}
                    imageUrl={hotel.photo_principale ?? ''}
                    name={hotel.nom}
                    hotelId={hotel.id}
                    availability="Disponible"
                    price={hotel.prix_min ?? 0}
                    etoiles={hotel.etoiles ?? undefined}
                    rating={hotel.note_moyenne ?? 0}
                    reviewCount={hotel.nb_avis}
                  />
                ))}
              </div>

              {/* Pagination */}
              {lastPage > 1 && (
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
                    {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => {
                      if (page === 1 || page === lastPage || (page >= currentPage - 1 && page <= currentPage + 1)) {
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
                        return (
                          <span key={page} className="w-8 h-8 flex items-center justify-center text-gray-400">...</span>
                        )
                      }
                      return null
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      currentPage === lastPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'
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
