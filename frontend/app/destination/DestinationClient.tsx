'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import HeroSection from '../components/ui/HeroSection'
import CardDestination from '../components/ui/CardDestination'
import CardHotel from '../components/ui/CardHotel'
import { useOnScreen } from '@/hooks/useOnScreen'
import { createSlug } from '@/lib/slug'
import { destinationService, hotelService } from '@/lib/services'
import type { Destination, Hotel } from '@/lib/types'

// Images statiques par destination (remplacer par de vraies photos quand disponibles)
const DESTINATION_IMAGES: Record<string, string> = {
  'nord':                   '/photos/chambre.jpg',
  'sud':                    '/photos/test.jpg',
  'est':                    '/photos/chambre.jpg',
  'ouest':                  '/photos/test.jpg',
  'hautes terres centrales':'/photos/chambre.jpg',
}

const getDestinationImage = (nom: string): string => {
  return DESTINATION_IMAGES[nom.toLowerCase()] ?? '/photos/chambre.jpg'
}

export default function DestinationClient() {
  const t = useTranslations('DestinationClient')
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Animation au scroll
  const [setSpotsRef, isSpotsVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })
  const [setHotelsRef, isHotelsVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [destResponse, hotelsResponse] = await Promise.all([
          destinationService.list(),
          hotelService.list({ sort: 'note_desc', page: 1 }),
        ])
        setDestinations(destResponse.data)
        setHotels(hotelsResponse.data)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Gestion du scroll pour le carrousel des hôtels
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const updateScrollInfo = () => setScrollPosition(container.scrollLeft)
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
    return Math.min(Math.round(scrollPosition / (cardWidth + gap)), hotels.length - 1)
  }

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -(320 + 24), behavior: 'smooth' })
  }

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 320 + 24, behavior: 'smooth' })
  }

  // Organisation : 2 en haut, 1 pleine largeur, 2 en bas
  const topSpots = destinations.slice(0, 2)
  const middleSpot = destinations[2]
  const bottomSpots = destinations.slice(3, 5)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Chargement…</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      <HeroSection
        title={t('hero_title')}
        subtitle={t('hero_subtitle')}
        backgroundImage="/photos/chambre.jpg"
        showDownload={false}
        showScrollIndicator={true}
      />

      <div className="container mx-auto px-4 py-12">
        {/* Section destinations */}
        <div
          ref={setSpotsRef}
          className={`mb-16 transition-all duration-700 ease-out ${
            isSpotsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-800 mb-8">
            {t('where_to_go')}
          </h2>

          <div className="max-w-8xl mx-auto">
            {/* Ligne 1 : 2 colonnes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {topSpots.map((dest) => (
                <CardDestination
                  key={dest.id}
                  imageUrl={getDestinationImage(dest.nom)}
                  title={dest.nom}
                  href={`/destination/${createSlug(dest.id, dest.nom)}`}
                  height="h-72"
                  width="w-full"
                  hoverEffect="zoom"
                />
              ))}
            </div>

            {/* Ligne 2 : pleine largeur */}
            {middleSpot && (
              <div className="mb-6">
                <CardDestination
                  imageUrl={middleSpot.image_url ?? '/photos/destinations/default.jpg'}
                  title={middleSpot.nom}
                  href={`/destination/${createSlug(middleSpot.id, middleSpot.nom)}`}
                  height="h-72"
                  width="w-full"
                  hoverEffect="zoom"
                />
              </div>
            )}

            {/* Ligne 3 : 2 colonnes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bottomSpots.map((dest) => (
                <CardDestination
                  key={dest.id}
                  imageUrl={getDestinationImage(dest.nom)}
                  title={dest.nom}
                  href={`/destination/${createSlug(dest.id, dest.nom)}`}
                  height="h-72"
                  width="w-full"
                  hoverEffect="zoom"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Section hôtels */}
        {hotels.length > 0 && (
          <div
            ref={setHotelsRef}
            className={`transition-all duration-700 ease-out ${
              isHotelsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-800 mb-8">
              {t('our_selection')}
            </h2>

            <div className="relative overflow-visible">
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
                {hotels.map((hotel) => (
                  <div key={hotel.id} className="flex-shrink-0 w-[280px] p-2">
                    <CardHotel
                      imageUrl={hotel.photo_principale ?? ''}
                      name={hotel.nom}
                      hotelId={hotel.id}
                      availability="Disponible"
                      price={hotel.prix_min ?? 0}
                      rating={hotel.note_moyenne ?? 0}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={scrollRight}
                className="absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 lg:p-3 shadow-lg transition-all duration-200 hover:scale-110 hidden lg:flex items-center justify-center cursor-pointer"
                aria-label={t('next_hotels')}
              >
                <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
