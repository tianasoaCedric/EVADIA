'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Share, Heart, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useOnScreen } from '@/hooks/useOnScreen'
import Bouton from '../../components/ui/Bouton'
import HotelPhoto from '../../components/ui/HotelPhoto'
import RoomCard from '../../components/ui/RoomCard'
import AvisClient from '@/app/components/ui/AvisClient'
import HotelInfo from '@/app/components/ui/HotelInfo'

interface HotelClientProps {
  hotelId: number
  hotelName: string
  slug: string
}

// Données mock (à remplacer par appel API)
const mockHotelData = {
  location: 'Antananarivo, Madagascar',
  rating: 4.8,
  reviewCount: 234,
  category: 'Hôtel de luxe',
  description: 'Situé au cœur d\'Antananarivo, cet établissement 5 étoiles offre une vue imprenable sur la ville. Les chambres spacieuses et élégantes sont équipées de tout le confort moderne. Le restaurant gastronomique propose une cuisine raffinée mêlant saveurs locales et internationales. Idéal pour les voyages d\'affaires comme pour les séjours de détente.',
  includedItems: [
    'Wi-Fi haut débit',
    'Serviettes de bain',
    'Gel douche et shampooing',
    'Sèche-cheveux',
    'Machine à café',
    'Eau minérale offerte'
  ]
}

export default function HotelClient({ hotelId, hotelName, slug }: HotelClientProps) {
  const router = useRouter()
  const t = useTranslations('HotelClient')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Animation au scroll pour la section des chambres
  const [setRoomsRef, isRoomsVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })

  // Données mock des chambres (à remplacer par appel API)
  const rooms = [
    {
      id: 1,
      imageUrl: '/photos/chambre.jpg',
      name: 'Suite de Luxe',
      beds: 1,
      bathrooms: 1,
      maxPersons: 2,
      price: 225000,
      availability: 'Disponible'
    },
    {
      id: 2,
      imageUrl: ['/photos/chambre.jpg', '/photos/bc.png'],
      name: 'Chambre Double',
      beds: 2,
      bathrooms: 1,
      maxPersons: 2,
      price: 125000,
      availability: 'Disponible'
    },
    {
      id: 3,
      imageUrl: ['/photos/chambre.jpg', '/photos/test.jpg'],
      name: 'Chambre Familiale',
      beds: 2,
      bathrooms: 1,
      maxPersons: 4,
      price: 185000,
      availability: '2 places restantes'
    },
  ]

  useEffect(() => {
    const fetchHotel = async () => {
      setIsLoading(true)
      try {
        console.log(`Chargement de l'hôtel ID: ${hotelId}`)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHotel()
  }, [hotelId])

  // Gestion du scroll pour le carrousel des chambres
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
    if (!scrollContainerRef.current || rooms.length === 0) return 0
    const cardWidth = window.innerWidth < 640 ? 280 : window.innerWidth < 768 ? 320 : 340
    const gap = window.innerWidth < 640 ? 16 : window.innerWidth < 768 ? 20 : 24
    const activeIndex = Math.round(scrollPosition / (cardWidth + gap))
    return Math.min(Math.max(0, activeIndex), rooms.length - 1)
  }

  const activeIndex = getActiveIndex()

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = window.innerWidth < 640 ? 280 : window.innerWidth < 768 ? 320 : 340
      const gap = window.innerWidth < 640 ? 16 : window.innerWidth < 768 ? 20 : 24
      scrollContainerRef.current.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = window.innerWidth < 640 ? 280 : window.innerWidth < 768 ? 320 : 340
      const gap = window.innerWidth < 640 ? 16 : window.innerWidth < 768 ? 20 : 24
      scrollContainerRef.current.scrollBy({ left: cardWidth + gap, behavior: 'smooth' })
    }
  }

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = window.innerWidth < 640 ? 280 : window.innerWidth < 768 ? 320 : 340
      const gap = window.innerWidth < 640 ? 16 : window.innerWidth < 768 ? 20 : 24
      scrollContainerRef.current.scrollTo({ 
        left: index * (cardWidth + gap), 
        behavior: 'smooth' 
      })
    }
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
    console.log(t('save_log'))
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: hotelName,
        text: t('share_text', { hotelName }),
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert(t('share_alert'))
    }
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
        {/* Header avec retour, titre et boutons */}
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
              {hotelName}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Bouton
              size="medium"
              onClick={handleSave}
              className="flex items-center gap-2"
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{isSaved ? t('saved') : t('save')}</span>
            </Bouton>

            <Bouton
              size="medium"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share className="w-5 h-5" />
              <span className="hidden sm:inline">{t('share')}</span>
            </Bouton>
          </div>
        </div>

        {/* Photos de l'hôtel */}
        <div className="py-4">
          <HotelPhoto
            imageUrl={[
              '/photos/chambre.jpg',
              '/photos/test.jpg',
              '/photos/chambre.jpg',
              '/photos/test.jpg',
              '/photos/chambre.jpg',
              '/photos/test.jpg',
            ]}
            autoPlayInterval={5000}
            className="mb-4"
          />
        </div>

        {/* HotelInfo - données dynamiques non traduites */}
        <div className="mt-4 mb-4">
          <HotelInfo 
            hotelName={hotelName}
            location={mockHotelData.location}
            rating={mockHotelData.rating}
            reviewCount={mockHotelData.reviewCount}
            category={mockHotelData.category}
            description={mockHotelData.description}
            includedItems={mockHotelData.includedItems}
          />
        </div>

        {/* Section Chambres et disponibilités */}
        <div 
          ref={setRoomsRef}
          className={`mt-4 mb-4 transition-all duration-700 ease-out ${
            isRoomsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-600 mb-4">
            {t('rooms_title')}
          </h2>

          {rooms.length > 3 ? (
            <div className="relative overflow-visible">
              <button
                onClick={scrollLeft}
                className="absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 lg:p-3 shadow-lg transition-all duration-200 hover:scale-110 hidden lg:flex items-center justify-center cursor-pointer"
                aria-label={t('previous_rooms')}
              >
                <ChevronLeftIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
              </button>

              <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto scroll-smooth gap-4 sm:gap-5 lg:gap-6 pb-6 lg:pb-8 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {rooms.map((room) => (
                  <div key={room.id} className="flex-shrink-0 w-[320px] sm:w-[320px] md:w-[340px] lg:w-[360px] xl:w-[380px]">
                    <RoomCard
                      hotelId={room.id}
                      imageUrl={room.imageUrl}
                      name={room.name}
                      beds={room.beds}
                      bathrooms={room.bathrooms}
                      maxPersons={room.maxPersons}
                      price={room.price}
                      availability={room.availability}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={scrollRight}
                className="absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 lg:p-3 shadow-lg transition-all duration-200 hover:scale-110 hidden lg:flex items-center justify-center cursor-pointer"
                aria-label={t('next_rooms')}
              >
                <ChevronRightIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
              </button>

              <div className="flex justify-center gap-2 mt-6 lg:mt-8">
                {rooms.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToIndex(index)}
                    className={`transition-all duration-300 cursor-pointer ${
                      activeIndex === index
                        ? 'w-6 h-2 rounded-full bg-[#01BDA5]'
                        : 'w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={t('go_to_room', { number: index + 1 })}
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="lg:hidden">
                <div className="relative overflow-visible">
                  <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto overflow-visible scroll-smooth gap-4 sm:gap-5 pb-6 scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {rooms.map((room) => (
                      <div key={room.id} className="flex-shrink-0 w-[320px]">
                        <RoomCard
                          hotelId={room.id}
                          imageUrl={room.imageUrl}
                          name={room.name}
                          beds={room.beds}
                          bathrooms={room.bathrooms}
                          maxPersons={room.maxPersons}
                          price={room.price}
                          availability={room.availability}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center gap-2 mt-6">
                    {rooms.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => scrollToIndex(index)}
                        className={`transition-all duration-300 cursor-pointer ${
                          activeIndex === index
                            ? 'w-6 h-2 rounded-full bg-[#01BDA5]'
                            : 'w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={t('go_to_room', { number: index + 1 })}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    hotelId={room.id}
                    imageUrl={room.imageUrl}
                    name={room.name}
                    beds={room.beds}
                    bathrooms={room.bathrooms}
                    maxPersons={room.maxPersons}
                    price={room.price}
                    availability={room.availability}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Avis des voyageurs */}
        <div className="py-4">
          <AvisClient />
        </div>
      </div>
    </main>
  )
}