'use client'

import { useState, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useOnScreen } from '@/hooks/useOnScreen'
import HeroSection from '../components/ui/HeroSection'
import OfferCard from '../components/ui/OfferCard'
import { createSlug } from '@/lib/slug'
import { offreService } from '@/lib/services'
import type { Offre, PaginatedOffres } from '@/lib/services'
import Loading from '../components/ui/Loading'
import Filters, { FilterValues } from '../components/ui/Filters'

const getMonthName = (monthNum: number, locale: string): string => {
  const date = new Date(2000, monthNum - 1, 1)
  return date.toLocaleDateString(locale, { month: 'long' })
}

interface OfferClientProps {
  initialData?: PaginatedOffres
}

export default function OfferClient({ initialData }: OfferClientProps) {
  const t = useTranslations('OfferClient')
  const locale = useLocale()

  const [offers, setOffers] = useState<Offre[]>(initialData?.data ?? [])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(initialData?.current_page ?? 1)
  const [lastPage, setLastPage] = useState(initialData?.last_page ?? 1)
  const [total, setTotal] = useState(initialData?.total ?? 0)
  
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

  const [setMainRef, isMainVisible] = useOnScreen({ threshold: 0.2 })
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchOffers = async (page: number, currentFilters: FilterValues) => {
    setIsLoading(true)
    try {
      const res = await offreService.list({
        page,
        search: currentFilters.search.trim() || undefined,
        start_date: currentFilters.checkIn ? currentFilters.checkIn.toISOString().split('T')[0] : undefined,
        end_date: currentFilters.checkOut ? currentFilters.checkOut.toISOString().split('T')[0] : undefined,
        offre_type: currentFilters.offreType !== 'all' ? currentFilters.offreType : undefined,
        discount_min: currentFilters.discountMin ?? undefined,
      })
      setOffers(res.data)
      setCurrentPage(res.current_page)
      setLastPage(res.last_page)
      setTotal(res.total)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters)
    if (newFilters.search !== filters.search) {
      if (searchTimer.current) clearTimeout(searchTimer.current)
      searchTimer.current = setTimeout(() => fetchOffers(1, newFilters), 300)
    } else {
      fetchOffers(1, newFilters)
    }
  }

  const goToPage = (page: number) => {
    const p = Math.max(1, Math.min(page, lastPage))
    fetchOffers(p, filters)
    document.getElementById('offers-list')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen">
      <HeroSection
        title={t('hero_title')}
        subtitle={t('hero_subtitle')}
        backgroundImage="/photos/offers/hero-offers.jpg"
        videoSrc="/videos/offres.mp4"
        showDownload={false}
        showScrollIndicator={true}
      />

      <div className="container mx-auto px-4 py-12">
        <div
          ref={setMainRef}
          className={`transition-all duration-700 ease-out ${
            isMainVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Composant Filters - inclut recherche, dates et type d'offre */}
          <Filters 
            onFilterChange={handleFilterChange}
            initialFilters={filters}
            enabledFilters={['dates', 'offre', 'discount']}
            className="mb-8"
          />

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-600 mb-4">
            {t('offer_title')}
          </h2>

          <div id="offers-list">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loading />
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">{t('no_results')}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 w-full sm:grid-cols-2 lg:grid-cols-3 gap-12">
                  {offers.map((offer) => (
                    <OfferCard
                      key={offer.id}
                      imageUrl={offer.photo ?? '/photos/chambre.jpg'}
                      discount={offer.discount}
                      startDay={offer.start_day}
                      endDay={offer.end_day}
                      month={getMonthName(offer.month_num, locale)}
                      hotelName={offer.hotel_nom}
                      city={offer.city}
                      destination={offer.destination}
                      href={`/offre/${createSlug(offer.id, offer.hotel_nom)}`}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {lastPage > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-full transition-all duration-200 ${
                        currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'
                      }`}
                      aria-label={t('previous_page')}
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
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
                      <ChevronRight className="w-5 h-5 text-gray-600" />
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
      </div>
    </main>
  )
}