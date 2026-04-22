'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useOnScreen } from '@/hooks/useOnScreen'
import HeroSection from '../components/ui/HeroSection'
import DiscoverCard from '../components/ui/DiscoverCard'
import Input from '../components/ui/Input'

// Données mock des découvertes (à remplacer par appel API)
const getDiscoverData = () => {
  return [
    {
      id: 1,
      imageUrl: '/photos/discover/paris.jpg',
      title: 'Paris, la ville lumière',
      href: '/decouvertes/paris'
    },
    {
      id: 2,
      imageUrl: '/photos/discover/kyoto.jpg',
      title: 'Kyoto, tradition et modernité',
      href: '/decouvertes/kyoto'
    },
    {
      id: 3,
      imageUrl: '/photos/discover/santorini.jpg',
      title: 'Santorini, île des amoureux',
      href: '/decouvertes/santorini'
    },
    {
      id: 4,
      imageUrl: '/photos/discover/bali.jpg',
      title: 'Bali, l\'île des dieux',
      href: '/decouvertes/bali'
    },
    {
      id: 5,
      imageUrl: '/photos/discover/rome.jpg',
      title: 'Rome, la cité éternelle',
      href: '/decouvertes/rome'
    },
    {
      id: 6,
      imageUrl: '/photos/discover/new-york.jpg',
      title: 'New York, la ville qui ne dort jamais',
      href: '/decouvertes/new-york'
    },
    {
      id: 7,
      imageUrl: '/photos/discover/tokyo.jpg',
      title: 'Tokyo, la ville du futur',
      href: '/decouvertes/tokyo'
    },
    {
      id: 8,
      imageUrl: '/photos/discover/londres.jpg',
      title: 'Londres, entre tradition et modernité',
      href: '/decouvertes/londres'
    },
    {
      id: 9,
      imageUrl: '/photos/discover/dubai.jpg',
      title: 'Dubai, la ville des records',
      href: '/decouvertes/dubai'
    },
    {
      id: 10,
      imageUrl: '/photos/discover/venise.jpg',
      title: 'Venise, la cité des canaux',
      href: '/decouvertes/venise'
    },
    {
      id: 11,
      imageUrl: '/photos/discover/barcelone.jpg',
      title: 'Barcelone, la ville de Gaudí',
      href: '/decouvertes/barcelone'
    },
    {
      id: 12,
      imageUrl: '/photos/discover/amsterdam.jpg',
      title: 'Amsterdam, la Venise du Nord',
      href: '/decouvertes/amsterdam'
    },
    {
      id: 13,
      imageUrl: '/photos/discover/prague.jpg',
      title: 'Prague, la ville aux cent clochers',
      href: '/decouvertes/prague'
    },
    {
      id: 14,
      imageUrl: '/photos/discover/vienne.jpg',
      title: 'Vienne, la ville de la musique',
      href: '/decouvertes/vienne'
    },
    {
      id: 15,
      imageUrl: '/photos/discover/berlin.jpg',
      title: 'Berlin, la ville de l\'histoire',
      href: '/decouvertes/berlin'
    },
    {
      id: 16,
      imageUrl: '/photos/discover/madrid.jpg',
      title: 'Madrid, la ville de l\'art',
      href: '/decouvertes/madrid'
    },
    {
      id: 17,
      imageUrl: '/photos/discover/lisbonne.jpg',
      title: 'Lisbonne, la ville des lumières',
      href: '/decouvertes/lisbonne'
    },
    {
      id: 18,
      imageUrl: '/photos/discover/athenes.jpg',
      title: 'Athènes, le berceau de la civilisation',
      href: '/decouvertes/athenes'
    }
  ]
}

export default function DiscoverClient() {
  const t = useTranslations('DiscoverClient')
  const [discoveries, setDiscoveries] = useState<any[]>([])
  const [filteredDiscoveries, setFilteredDiscoveries] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  // Animation au scroll - uniquement sur les éléments, pas sur le main
  const [setHeroRef, isHeroVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })
  const [setTitleRef, isTitleVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })
  const [setSearchRef, isSearchVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })
  const [setGridRef, isGridVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })

  useEffect(() => {
    const fetchDiscoveries = async () => {
      setIsLoading(true)
      try {
        const data = getDiscoverData()
        setDiscoveries(data)
        setFilteredDiscoveries(data)
        setCurrentPage(1)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDiscoveries()
  }, [])

  // Filtrer les découvertes par recherche
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDiscoveries(discoveries)
    } else {
      const filtered = discoveries.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredDiscoveries(filtered)
    }
    setCurrentPage(1)
  }, [searchQuery, discoveries])

  // Pagination
  const totalPages = Math.ceil(filteredDiscoveries.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentDiscoveries = filteredDiscoveries.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    document.getElementById('discover-list')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Fonction pour organiser les cartes avec la carte du milieu plus basse
  const renderDiscoverGrid = () => {
    const rows = []
    for (let i = 0; i < currentDiscoveries.length; i += 3) {
      const rowItems = currentDiscoveries.slice(i, i + 3)
      rows.push(
        <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 justify-items-center">
          {rowItems.map((item, index) => {
            // La carte du milieu (index 1) a une marge supérieure pour être plus basse
            const isMiddleCard = index === 1 && rowItems.length === 3
            return (
              <div
                key={item.id}
                className={`w-full max-w-[320px] transition-all duration-300 ${isMiddleCard ? 'md:mt-12' : ''}`}
              >
                <DiscoverCard
                  imageUrl={item.imageUrl}
                  title={item.title}
                  href={item.href}
                />
              </div>
            )
          })}
        </div>
      )
    }
    return rows
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
      {/* HeroSection avec animation */}
      <div
        ref={setHeroRef}
        className={`transition-all duration-700 ease-out ${
          isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <HeroSection
          title={t('hero_title')}
          subtitle={t('hero_subtitle')}
          backgroundImage="/photos/discover/hero-discover.jpg"
          showDownload={false}
          showScrollIndicator={true}
        />
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Titre et description - alignés à gauche */}
        <div
          ref={setTitleRef}
          className={`mb-12 transition-all duration-700 ease-out ${
            isTitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-gray-800 mb-4 text-left">
            {t('section_title')}
          </h2>
          <p className="text-gray-600 max-w-3xl leading-relaxed text-left">
            {t('section_description')}
          </p>
        </div>

        {/* Barre de recherche - centrée */}
        <div
          ref={setSearchRef}
          className={`max-w-md mx-auto mb-12 transition-all duration-700 ease-out ${
            isSearchVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
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

        {/* Liste des découvertes */}
        <div id="discover-list">
          {filteredDiscoveries.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">{t('no_results')}</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-6 py-2 rounded-full border border-[#01BDA5] text-[#01BDA5] hover:bg-[#01BDA5] hover:text-white transition-colors cursor-pointer"
                >
                  {t('clear_search')}
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Grille avec carte du milieu plus basse - cartes centrées */}
              <div
                className={`transition-all duration-700 ease-out `}
              >
                {renderDiscoverGrid()}
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
                {filteredDiscoveries.length} {filteredDiscoveries.length > 1 ? t('results_plural') : t('results_singular')}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}