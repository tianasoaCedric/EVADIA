'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Share, Heart, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react'
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

export default function HotelClient({ hotelId, hotelName, slug }: HotelClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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

  // Calcul de l'index actif basé sur la position de scroll
  const getActiveIndex = () => {
    if (!scrollContainerRef.current || rooms.length === 0) return 0
    // Largeur de la carte + gap (gap-4 = 16px, gap-5 = 20px sur sm)
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
    console.log('Hôtel sauvegardé')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: hotelName,
        text: `Découvrez ${hotelName} sur Evadia`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Lien copié dans le presse-papier !')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Chargement...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header avec retour, titre et boutons */}
        <div className="flex flex-row items-center justify-between gap-4 mb-6">
          {/* Partie gauche : chevron + titre */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="rounded-full transition-colors cursor-pointer"
              aria-label="Retour"
            >
              <ChevronLeft className="w-8 h-8 text-gray-600 hover:text-[#01BDA5] transition-colors" />
            </button>
            <h1 className="text-xl md:text-3xl lg:text-4xl font-medium text-gray-800">
              {hotelName}
            </h1>
          </div>

          {/* Partie droite : boutons Enregistrer et Partager */}
          <div className="flex items-center gap-3">
            <Bouton
              size="medium"
              onClick={handleSave}
              className="flex items-center gap-2"
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{isSaved ? 'Enregistré' : 'Enregistrer'}</span>
            </Bouton>

            <Bouton
              size="medium"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share className="w-5 h-5" />
              <span className="hidden sm:inline">Partager</span>
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

        <div className="mt-4 mb-4">
        <HotelInfo 
          hotelName={hotelName}
          location="Antananarivo, Madagascar"
          rating={4.8}
          reviewCount={234}
          category="Hôtel de luxe"
          description="Situé au cœur d'Antananarivo, cet établissement 5 étoiles offre une vue imprenable sur la ville. Les chambres spacieuses et élégantes sont équipées de tout le confort moderne. Le restaurant gastronomique propose une cuisine raffinée mêlant saveurs locales et internationales. Idéal pour les voyages d'affaires comme pour les séjours de détente."
          includedItems={[
            'Wi-Fi haut débit',
            'Serviettes de bain',
            'Gel douche et shampooing',
            'Sèche-cheveux',
            'Machine à café',
            'Eau minérale offerte'
          ]}
        />
      </div>

        {/* Section Chambres et disponibilités */}
        <div className="mt-4 mb-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-600 mb-4">
            Chambres et disponibilités
          </h2>

          {rooms.length > 3 ? (
            // Version carrousel horizontal (uniquement si + de 3 chambres)
            <div className="relative overflow-visible">
              {/* Flèche gauche */}
              <button
                onClick={scrollLeft}
                className="absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 lg:p-3 shadow-lg transition-all duration-200 hover:scale-110 hidden lg:flex items-center justify-center cursor-pointer"
                aria-label="Défiler vers la gauche"
              >
                <ChevronLeftIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
              </button>

              {/* Carrousel des chambres */}
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

              {/* Flèche droite */}
              <button
                onClick={scrollRight}
                className="absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 lg:p-3 shadow-lg transition-all duration-200 hover:scale-110 hidden lg:flex items-center justify-center cursor-pointer"
                aria-label="Défiler vers la droite"
              >
                <ChevronRightIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
              </button>

              {/* Indicateurs pour mobile et tablette */}
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
                    aria-label={`Aller à la chambre ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            // Version grille (quand moins de 4 chambres)
            <>
              {/* Version mobile : carrousel */}
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

                  {/* Indicateurs pour mobile */}
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
                        aria-label={`Aller à la chambre ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Version desktop : grille */}
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
        <div className="py-4">
        <AvisClient />
        </div>
      </div>
    </main>
  )
}