'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useOnScreen } from '@/hooks/useOnScreen'
import HeroSection from '../components/ui/HeroSection'
import Input from '../components/ui/Input'
import OfferCard from '../components/ui/OfferCard'
import { createSlug } from '@/lib/slug'

// Données mock des offres (à remplacer par appel API)
const getOffersData = () => {
  return [
    {
      id: 1,
      imageUrl: '/photos/offers/paris.jpg',
      discount: 25,
      startDay: 1,
      endDay: 15,
      month: 'juin',
      hotelName: 'Hôtel Le Meurice',
      city: 'Paris',
      destination: 'Paris',
      href: `/offre/${createSlug(1, 'paris')}`
    },
    {
      id: 2,
      imageUrl: '/photos/offers/maldives.jpg',
      discount: 40,
      startDay: 1,
      endDay: 31,
      month: 'août',
      hotelName: 'Maldives Paradise Resort',
      city: 'Malé',
      destination: 'les Maldives',
      href: `/offre/${createSlug(2, 'maldives')}`
    },
    {
      id: 3,
      imageUrl: '/photos/offers/rome.jpg',
      discount: 20,
      startDay: 15,
      endDay: 30,
      month: 'septembre',
      hotelName: 'Hotel de Russie',
      city: 'Rome',
      destination: 'Rome',
      href: `/offre/${createSlug(3, 'rome')}`
    },
    {
      id: 4,
      imageUrl: '/photos/offers/tokyo.jpg',
      discount: 30,
      startDay: 1,
      endDay: 20,
      month: 'octobre',
      hotelName: 'Park Hyatt Tokyo',
      city: 'Tokyo',
      destination: 'Tokyo',
      href: `/offre/${createSlug(4, 'tokyo')}`
    },
    {
      id: 5,
      imageUrl: '/photos/offers/new-york.jpg',
      discount: 35,
      startDay: 10,
      endDay: 25,
      month: 'novembre',
      hotelName: 'The Plaza Hotel',
      city: 'New York',
      destination: 'New York',
      href: `/offre/${createSlug(5, 'new-york')}`
    },
    {
      id: 6,
      imageUrl: '/photos/offers/bali.jpg',
      discount: 45,
      startDay: 1,
      endDay: 31,
      month: 'décembre',
      hotelName: 'Four Seasons Bali',
      city: 'Bali',
      destination: 'Bali',
      href: `/offre/${createSlug(6, 'bali')}`
    },
    {
      id: 7,
      imageUrl: '/photos/offers/londres.jpg',
      discount: 15,
      startDay: 5,
      endDay: 20,
      month: 'janvier',
      hotelName: 'The Ritz London',
      city: 'Londres',
      destination: 'Londres',
      href: `/offre/${createSlug(7, 'londres')}`
    },
    {
      id: 8,
      imageUrl: '/photos/offers/dubai.jpg',
      discount: 50,
      startDay: 1,
      endDay: 28,
      month: 'février',
      hotelName: 'Burj Al Arab',
      city: 'Dubaï',
      destination: 'Dubaï',
      href: `/offre/${createSlug(8, 'dubai')}`
    },
    {
      id: 9,
      imageUrl: '/photos/offers/sydney.jpg',
      discount: 25,
      startDay: 1,
      endDay: 15,
      month: 'mars',
      hotelName: 'Sydney Harbour Hotel',
      city: 'Sydney',
      destination: 'Sydney',
      href: `/offre/${createSlug(9, 'sydney')}`
    },
    {
      id: 10,
      imageUrl: '/photos/offers/barcelone.jpg',
      discount: 30,
      startDay: 10,
      endDay: 25,
      month: 'avril',
      hotelName: 'Hotel Arts Barcelona',
      city: 'Barcelone',
      destination: 'Barcelone',
      href: `/offre/${createSlug(10, 'barcelone')}`
    },
    {
      id: 11,
      imageUrl: '/photos/offers/venise.jpg',
      discount: 20,
      startDay: 1,
      endDay: 15,
      month: 'mai',
      hotelName: 'Hotel Danieli',
      city: 'Venise',
      destination: 'Venise',
      href: `/offre/${createSlug(11, 'venise')}`
    },
    {
      id: 12,
      imageUrl: '/photos/offers/amsterdam.jpg',
      discount: 35,
      startDay: 1,
      endDay: 30,
      month: 'juin',
      hotelName: 'Waldorf Astoria Amsterdam',
      city: 'Amsterdam',
      destination: 'Amsterdam',
      href: `/offre/${createSlug(12, 'amsterdam')}`
    }
  ]
}

export default function OfferClient() {
  const t = useTranslations('OfferClient')
  const [searchQuery, setSearchQuery] = useState('')
  const [offers, setOffers] = useState<any[]>([])
  const [filteredOffers, setFilteredOffers] = useState<any[]>([])
  
  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9 // 3 colonnes x 3 lignes = 9 offres par page

  // Animation au scroll
  const [setMainRef, isMainVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })

  useEffect(() => {
    const fetchOffers = async () => {
      const data = getOffersData()
      setOffers(data)
      setFilteredOffers(data)
      setCurrentPage(1)
    }

    fetchOffers()
  }, [])

  // Filtrer les offres par recherche
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOffers(offers)
    } else {
      const filtered = offers.filter((offer) =>
        offer.hotelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.destination.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredOffers(filtered)
    }
    setCurrentPage(1)
  }, [searchQuery, offers])

  // Pagination
  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOffers = filteredOffers.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    document.getElementById('offers-list')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen">
      {/* HeroSection */}
      <HeroSection
        title={t('hero_title')}
        subtitle={t('hero_subtitle')}
        backgroundImage="/photos/offers/hero-offers.jpg"
        showDownload={false}
        showScrollIndicator={true}
      />

      <div className="container mx-auto px-4 py-12">
        {/* Barre de recherche */}
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
        {/* Section des offres */}
        <div id="offers-list">
          {currentOffers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">{t('no_results')}</p>
            </div>
          ) : (
            <>
              {/* Grille des offres - 3 colonnes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentOffers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    imageUrl={offer.imageUrl}
                    discount={offer.discount}
                    startDay={offer.startDay}
                    endDay={offer.endDay}
                    month={offer.month}
                    hotelName={offer.hotelName}
                    city={offer.city}
                    destination={offer.destination}
                    href={offer.href}
                  />
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
                    aria-label={t('next_page')}
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              )}

              {/* Nombre de résultats */}
              <div className="text-center mt-6 text-sm text-gray-500">
                {filteredOffers.length} {filteredOffers.length > 1 ? t('results_plural') : t('results_singular')}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}