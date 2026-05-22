'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { ChevronLeft, X, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react'
import Header from '../components/molecules/Header'
import CardHotel from '../components/ui/CardHotel'
import CardDestination from '../components/ui/CardDestination'
import OfferCard from '../components/ui/OfferCard'
import DiscoverCard from '../components/ui/DiscoverCard'

interface SearchClientProps {
  searchQuery: string
}

// Types de résultats
type ResultType = 'hotel' | 'destination' | 'offer' | 'city' | 'category' | 'discover'

interface SearchResult {
  id: number
  type: ResultType
  title: string
  subtitle?: string
  imageUrl: string
  href: string
  price?: number
  rating?: number
  reviewCount?: number
  availability?: string
  discount?: number
  startDay?: number
  endDay?: number
  month?: string
  hotelName?: string
  city?: string
  destination?: string
}

// Données mock (à remplacer par appel API)
const getMockResults = (query: string): SearchResult[] => {
  if (!query) return []
  
  const allResults: SearchResult[] = [
    // Hôtels
    {
      id: 1,
      type: 'hotel',
      title: 'Hôtel Le Meurice',
      subtitle: 'Paris, France',
      imageUrl: '/photos/hotels/ecolodge-1.jpg',
      href: '/hotel/1-hotel-le-meurice',
      price: 450000,
      rating: 4.8,
      reviewCount: 234,
      availability: 'Disponible'
    },
    {
      id: 2,
      type: 'hotel',
      title: 'Villa de Rêve',
      subtitle: 'Malé, Maldives',
      imageUrl: '/photos/hotels/villa-1.jpg',
      href: '/hotel/4-villa-de-reve',
      price: 250000,
      rating: 4.9,
      reviewCount: 187,
      availability: 'Disponible'
    },
    {
      id: 3,
      type: 'hotel',
      title: 'Palace Hôtel',
      subtitle: 'Antananarivo, Madagascar',
      imageUrl: '/photos/hotels/luxe-1.jpg',
      href: '/hotel/6-palace-hotel',
      price: 450000,
      rating: 4.9,
      reviewCount: 342,
      availability: '2 places restantes'
    },
    {
      id: 4,
      type: 'hotel',
      title: 'Ecolodge de la Forêt',
      subtitle: 'Antsirabe, Madagascar',
      imageUrl: '/photos/hotels/ecolodge-2.jpg',
      href: '/hotel/7-ecolodge',
      price: 85000,
      rating: 4.5,
      reviewCount: 128,
      availability: 'Disponible'
    },
    // Destinations
    {
      id: 5,
      type: 'destination',
      title: 'Paris',
      subtitle: 'France',
      imageUrl: '/photos/destinations/paris.jpg',
      href: '/destination/paris-1'
    },
    {
      id: 6,
      type: 'destination',
      title: 'Maldives',
      subtitle: 'Océan Indien',
      imageUrl: '/photos/destinations/maldives.jpg',
      href: '/destination/maldives-2'
    },
    // Offres
    {
      id: 7,
      type: 'offer',
      title: 'Offre spéciale Paris',
      subtitle: '-30% sur votre séjour',
      imageUrl: '/photos/offers/paris.jpg',
      href: '/offers/paris-offer-1',
      discount: 30,
      startDay: 1,
      endDay: 15,
      month: 'juin',
      hotelName: 'Hôtel Le Meurice',
      city: 'Paris',
      destination: 'Paris'
    },
    {
      id: 8,
      type: 'offer',
      title: 'Offre Maldives',
      subtitle: '-45% sur votre séjour',
      imageUrl: '/photos/offers/maldives.jpg',
      href: '/offers/maldives-offer-2',
      discount: 45,
      startDay: 1,
      endDay: 31,
      month: 'août',
      hotelName: 'Maldives Paradise',
      city: 'Malé',
      destination: 'les Maldives'
    },
    // Villes
    {
      id: 9,
      type: 'city',
      title: 'Antananarivo',
      subtitle: 'Madagascar',
      imageUrl: '/photos/destinations/tananarive.jpg',
      href: '/ville/antananarivo-1'
    },
    {
      id: 10,
      type: 'city',
      title: 'Nosy Be',
      subtitle: 'Madagascar',
      imageUrl: '/photos/destinations/nosy-be.jpg',
      href: '/ville/nosy-be-2'
    },
    // Catégories
    {
      id: 11,
      type: 'category',
      title: 'Ecolodge',
      subtitle: 'Hébergement écologique',
      imageUrl: '/photos/categories/ecolodge.jpg',
      href: '/hebergement/ecolodge-1'
    },
    {
      id: 12,
      type: 'category',
      title: 'Villas',
      subtitle: 'Luxe et intimité',
      imageUrl: '/photos/categories/villas.jpg',
      href: '/hebergement/villas-2'
    },
    // Découvertes
    {
      id: 13,
      type: 'discover',
      title: 'Paris, la ville lumière',
      subtitle: 'Découvrez les merveilles de Paris',
      imageUrl: '/photos/discover/paris.jpg',
      href: '/decouvrir/paris-1'
    },
    {
      id: 14,
      type: 'discover',
      title: 'Les plus belles plages du monde',
      subtitle: 'Guide des destinations paradisiaques',
      imageUrl: '/photos/discover/bali.jpg',
      href: '/decouvrir/plages-2'
    }
  ]

  return allResults.filter(result =>
    result.title.toLowerCase().includes(query.toLowerCase()) ||
    result.subtitle?.toLowerCase().includes(query.toLowerCase())
  )
}

// Configuration des types avec leurs labels et couleurs
const typeConfig: Record<ResultType, { label: string; color: string }> = {
  hotel: { label: 'Hôtels', color: 'bg-green-100 text-green-700' },
  destination: { label: 'Destinations', color: 'bg-blue-100 text-blue-700' },
  offer: { label: 'Offres', color: 'bg-red-100 text-red-700' },
  city: { label: 'Villes', color: 'bg-purple-100 text-purple-700' },
  category: { label: 'Catégories', color: 'bg-orange-100 text-orange-700' },
  discover: { label: 'Découvertes', color: 'bg-teal-100 text-teal-700' },
}

export default function SearchClient({ searchQuery }: SearchClientProps) {
  const router = useRouter()
  const t = useTranslations('Search')
  const [results, setResults] = useState<SearchResult[]>([])
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([])
  const [activeFilters, setActiveFilters] = useState<ResultType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Refs pour les sliders
  const scrollContainerRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))
      const data = getMockResults(searchQuery)
      setResults(data)
      setFilteredResults(data)
      setIsLoading(false)
    }

    fetchResults()
  }, [searchQuery])

  // Appliquer les filtres
  useEffect(() => {
    if (activeFilters.length === 0) {
      setFilteredResults(results)
    } else {
      setFilteredResults(results.filter(result => activeFilters.includes(result.type)))
    }
  }, [activeFilters, results])

  const toggleFilter = (type: ResultType) => {
    setActiveFilters(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const clearFilters = () => {
    setActiveFilters([])
  }

  const scrollLeft = (type: string) => {
    const container = scrollContainerRefs.current[type]
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = (type: string) => {
    const container = scrollContainerRefs.current[type]
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  // Grouper les résultats par type
  const groupedResults = filteredResults.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = []
    }
    acc[result.type].push(result)
    return acc
  }, {} as Record<ResultType, SearchResult[]>)

  const renderResultCard = (result: SearchResult) => {
    switch (result.type) {
      case 'hotel':
        return (
          <CardHotel
            key={result.id}
            imageUrl={result.imageUrl}
            name={result.title}
            hotelId={result.id}
            availability={result.availability || 'Disponible'}
            price={result.price || 0}
            rating={result.rating || 0}
            reviewCount={result.reviewCount}
          />
        )
      case 'destination':
        return (
          <CardDestination
            key={result.id}
            imageUrl={result.imageUrl}
            title={result.title}
            href={result.href}
            height="h-64"
            width="w-full"
            hoverEffect="zoom"
          />
        )
      case 'offer':
        return (
          <OfferCard
            key={result.id}
            imageUrl={result.imageUrl}
            discount={result.discount || 0}
            startDay={result.startDay || 1}
            endDay={result.endDay || 1}
            month={result.month || ''}
            hotelName={result.hotelName || result.title}
            city={result.city || ''}
            destination={result.destination || ''}
            href={result.href}
          />
        )
      case 'city':
        return (
          <CardDestination
            key={result.id}
            imageUrl={result.imageUrl}
            title={result.title}
            href={result.href}
            height="h-64"
            width="w-full"
            hoverEffect="zoom"
          />
        )
      case 'category':
        return (
          <CardDestination
            key={result.id}
            imageUrl={result.imageUrl}
            title={result.title}
            href={result.href}
            height="h-64"
            width="w-full"
            hoverEffect="zoom"
          />
        )
      case 'discover':
        return (
          <DiscoverCard
            key={result.id}
            imageUrl={result.imageUrl}
            title={result.title}
            href={result.href}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      <Header theme="dark" />
      <main className="min-h-screen pt-24 pb-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Titre */}
            <div className="mb-8">
              <div className='flex mb-4'>
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-gray-900 hover:text-[#01BDA5] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {t('title')}
                </h1>
              </div>
              <p className="text-gray-500 mt-1">
                {t('results_for', { query: searchQuery })}
              </p>
            </div>

            {/* Filtres */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-wrap gap-2">
                {Object.entries(typeConfig).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => toggleFilter(type as ResultType)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeFilters.includes(type as ResultType)
                        ? config.color + ' shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{config.label}</span>
                    {activeFilters.includes(type as ResultType) && (
                      <X className="w-3 h-3 ml-0.5" />
                    )}
                  </button>
                ))}
                
                {activeFilters.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
                  >
                    {t('clear_filters')}
                  </button>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  {filteredResults.length} {filteredResults.length > 1 ? t('results_plural') : t('results_singular')}
                </p>
              </div>
            </div>

            {/* Résultats par catégorie */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-pulse text-gray-500">{t('loading')}</div>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('no_results')}</h3>
                <p className="text-gray-500">{t('no_results_description')}</p>
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(groupedResults).map(([type, items]) => (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">
                        {typeConfig[type as ResultType].label}
                      </h2>
                      <span className="text-sm text-gray-400">({items.length})</span>
                    </div>
                    
                    {/* Version desktop : grille */}
                    <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {items.map(item => renderResultCard(item))}
                    </div>
                    
                    {/* Version mobile : slider */}
                    <div className="relative md:hidden">
                      {items.length > 2 && (
                        <>
                          <button
                            onClick={() => scrollLeft(type)}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110 cursor-pointer"
                            aria-label="Défiler vers la gauche"
                          >
                            <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
                          </button>
                          <button
                            onClick={() => scrollRight(type)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110 cursor-pointer"
                            aria-label="Défiler vers la droite"
                          >
                            <ChevronRightIcon className="w-5 h-5 text-gray-700" />
                          </button>
                        </>
                      )}
                      
                      <div
                        ref={(el) => { scrollContainerRefs.current[type] = el }}
                        className="flex overflow-x-auto scroll-smooth gap-4 pb-4 scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        {items.map(item => (
                          <div key={item.id} className="flex-shrink-0 w-[280px]">
                            {renderResultCard(item)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}