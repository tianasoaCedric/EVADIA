'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useOnScreen } from '@/hooks/useOnScreen'
import HeroSection from '../components/ui/HeroSection'
import Input from '../components/ui/Input'
import OfferCard from '../components/ui/OfferCard'
import { createSlug } from '@/lib/slug'
import { offreService } from '@/lib/services'
import type { Offre } from '@/lib/services'

const getMonthName = (monthNum: number, locale: string): string => {
  const date = new Date(2000, monthNum - 1, 1)
  return date.toLocaleDateString(locale, { month: 'long' })
}

export default function OfferClient() {
  const t = useTranslations('OfferClient')
  const locale = useLocale()

  const [offers, setOffers] = useState<Offre[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)

  const [setMainRef, isMainVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })

  const fetchOffers = async (page: number, search: string) => {
    setIsLoading(true)
    try {
      const res = await offreService.list({ page, search: search.trim() || undefined })
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

  useEffect(() => {
    fetchOffers(1, '')
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOffers(1, searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const goToPage = (page: number) => {
    const p = Math.max(1, Math.min(page, lastPage))
    fetchOffers(p, searchQuery)
    document.getElementById('offers-list')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen">
      <HeroSection
        title={t('hero_title')}
        subtitle={t('hero_subtitle')}
        backgroundImage="/photos/offers/hero-offers.jpg"
        showDownload={false}
        showScrollIndicator={true}
      />

      <div className="container mx-auto px-4 py-12">
        <div
          ref={setMainRef}
          className={`max-w-md mx-auto mb-12 transition-all duration-700 ease-out ${
            isMainVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
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

        <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-600 mb-4">
          {t('offer_title')}
        </h2>

        <div id="offers-list">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-pulse text-gray-500">{t('loading')}</div>
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">{t('no_results')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
    </main>
  )
}
