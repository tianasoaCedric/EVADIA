'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import HeroSection from '../components/ui/HeroSection'
import CardDestination from '../components/ui/CardDestination'
import CardHotel from '../components/ui/CardHotel'
import { useOnScreen } from '@/hooks/useOnScreen'

// Données mock des destinations (à remplacer par appel API)
const destinationsData = {
  heroImage: '/photos/destinations/madagascar-hero.jpg',
  description: 'Découvrez l\'île rouge, ses paysages uniques et sa biodiversité exceptionnelle',
  popularSpots: [
    { id: 1, imageUrl: '/photos/destinations/paris.jpg', title: 'Paris', href: '/destinations/paris' },
    { id: 2, imageUrl: '/photos/destinations/maldives.jpg', title: 'Maldives', href: '/destinations/maldives' },
    { id: 3, imageUrl: '/photos/destinations/rome.jpg', title: 'Rome', href: '/destinations/rome' },
    { id: 4, imageUrl: '/photos/destinations/tokyo.jpg', title: 'Tokyo', href: '/destinations/tokyo' },
    { id: 5, imageUrl: '/photos/destinations/new-york.jpg', title: 'New York', href: '/destinations/new-york' }
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
    }
  ]
}

export default function DestinationClient() {
  const t = useTranslations('DestinationClient')
  const [scrollPosition, setScrollPosition] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Animation au scroll
  const [setSpotsRef, isSpotsVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })
  const [setHotelsRef, isHotelsVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })

  // Gestion du scroll pour le carrousel des hôtels
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const updateScrollInfo = () => {
      setScrollPosition(container.scrollLeft)
    }

    updateScrollInfo()
    container.addEventListener('scroll', updateScrollInfo)
    window.addEventListener('resize', updateScrollInfo)

    return () => {
      container.removeEventListener('scroll', updateScrollInfo)
      window.removeEventListener('resize', updateScrollInfo)
    }
  }, [])

  const getActiveIndex = () => {
    if (!scrollContainerRef.current) return 0
    const cardWidth = 320
    const gap = 24
    const activeIndex = Math.round(scrollPosition / (cardWidth + gap))
    return Math.min(activeIndex, destinationsData.hotels.length - 1)
  }

  const activeIndex = getActiveIndex()

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 320
      const gap = 24
      scrollContainerRef.current.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 320
      const gap = 24
      scrollContainerRef.current.scrollBy({ left: cardWidth + gap, behavior: 'smooth' })
    }
  }

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = 320
      const gap = 24
      scrollContainerRef.current.scrollTo({ left: index * (cardWidth + gap), behavior: 'smooth' })
    }
  }

  // Organisation des spots populaires : 2 en haut, 1 au milieu pleine largeur, 2 en bas
  const topSpots = destinationsData.popularSpots?.slice(0, 2) || []
  const middleSpot = destinationsData.popularSpots?.[2]
  const bottomSpots = destinationsData.popularSpots?.slice(3, 5) || []

  return (
    <main className="min-h-screen">
      {/* HeroSection */}
      <HeroSection
        title={t('hero_title')}
        subtitle={destinationsData.description}
        backgroundImage={destinationsData.heroImage}
        showDownload={false}
        showScrollIndicator={true}
      />

      <div className="container mx-auto px-4 py-12">
        {/* Section "Où voulez-vous partir ?" */}
        <div
          ref={setSpotsRef}
          className={`mb-16 transition-all duration-700 ease-out ${
            isSpotsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-800 mb-8">
            {t('where_to_go')}
          </h2>

          {/* Grille de destinations */}
          <div className="max-w-8xl mx-auto">
            {/* Ligne 1 : 2 colonnes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {topSpots.map((spot: any) => (
                <CardDestination
                  key={spot.id}
                  imageUrl={spot.imageUrl}
                  title={spot.title}
                  href={spot.href}
                  height="h-72"
                  width="w-full"
                  hoverEffect="zoom"
                />
              ))}
            </div>

            {/* Ligne 2 : 1 colonne pleine largeur */}
            {middleSpot && (
              <div className="mb-6">
                <CardDestination
                  imageUrl={middleSpot.imageUrl}
                  title={middleSpot.title}
                  href={middleSpot.href}
                  height="h-72"
                  width="w-full"
                  hoverEffect="zoom"
                />
              </div>
            )}

            {/* Ligne 3 : 2 colonnes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bottomSpots.map((spot: any) => (
                <CardDestination
                  key={spot.id}
                  imageUrl={spot.imageUrl}
                  title={spot.title}
                  href={spot.href}
                  height="h-72"
                  width="w-full"
                  hoverEffect="zoom"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Section "Notre sélection d'hébergements" */}
        <div
          ref={setHotelsRef}
          className={`transition-all duration-700 ease-out ${
            isHotelsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-800 mb-8">
            {t('our_selection')}
          </h2>

{/* Carrousel des hôtels */}
<div className="relative overflow-visible">
  {/* Flèche gauche */}
  <button
    onClick={scrollLeft}
    className="absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 lg:p-3 shadow-lg transition-all duration-200 hover:scale-110 hidden lg:flex items-center justify-center cursor-pointer"
    aria-label={t('previous_hotels')}
  >
    <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
  </button>

  <div
    ref={scrollContainerRef}
    className="flex overflow-x-auto scroll-smooth pb-8 lg:pb-10 scrollbar-hide overflow-visible"
    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
  >
    {destinationsData.hotels?.map((hotel: any) => (
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

  {/* Flèche droite */}
  <button
    onClick={scrollRight}
    className="absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 lg:p-3 shadow-lg transition-all duration-200 hover:scale-110 hidden lg:flex items-center justify-center cursor-pointer"
    aria-label={t('next_hotels')}
  >
    <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
  </button>
</div>        </div>
      </div>
    </main>
  )
}