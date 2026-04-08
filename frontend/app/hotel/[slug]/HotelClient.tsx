'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Share, Heart, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react'
import Bouton from '../../components/ui/Bouton'
import HotelPhoto from '../../components/ui/HotelPhoto'
import RoomCard from '../../components/ui/RoomCard'

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
    // {
    //   id: 4,
    //   imageUrl: '/photos/chambre.jpg',
    //   name: 'Suite Royale',
    //   beds: 2,
    //   bathrooms: 2,
    //   maxPersons: 4,
    //   price: 350000,
    //   availability: 'Disponible'
    // },
    // {
    //   id: 5,
    //   imageUrl: '/photos/chambre.jpg',
    //   name: 'Chambre Simple',
    //   beds: 1,
    //   bathrooms: 1,
    //   maxPersons: 1,
    //   price: 89000,
    //   availability: 'Complet'
    // },
    // {
    //   id: 6,
    //   imageUrl: '/photos/chambre.jpg',
    //   name: 'Suite Junior',
    //   beds: 1,
    //   bathrooms: 1,
    //   maxPersons: 2,
    //   price: 175000,
    //   availability: 'Disponible'
    // }
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

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' })
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

  // Calculer l'index actif pour les indicateurs
  const getActiveIndex = () => {
    if (!scrollContainerRef.current) return 0
    const cardWidth = 320
    const activeIndex = Math.round(scrollPosition / cardWidth)
    return Math.min(activeIndex, rooms.length - 1)
  }

  const activeIndex = getActiveIndex()

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

        {/* Section Chambres et disponibilités */}
        <div className="">
          <h2 className="text-2xl md:text-3xl font-medium text-gray-600 mb-8">
            Chambres et disponibilités
          </h2>

          {rooms.length > 3 ? (
            // Version carrousel horizontal (uniquement si + de 3 chambres)
            <div className="relative overflow-visible">
              {/* Flèche gauche */}
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110 hidden md:flex items-center justify-center cursor-pointer"
                aria-label="Défiler vers la gauche"
              >
                <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
              </button>

              {/* Carrousel des chambres */}
              <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto scroll-smooth gap-5 pb-8 scrollbar-hide overflow-visible"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {rooms.map((room) => (
                  <div key={room.id} className="flex-shrink-0 w-[240px] sm:w-[240px] md:w-[280px] p-2">
                    <RoomCard
                      imageUrl={room.imageUrl}
                      name={room.name}
                      beds={room.beds}
                      bathrooms={room.bathrooms}
                      maxPersons={room.maxPersons}
                      price={room.price}
                      availability={room.availability}
                      href={`/hotel/${slug}/room/${room.id}`}
                    />
                  </div>
                ))}
              </div>

              {/* Flèche droite */}
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110 hidden md:flex items-center justify-center cursor-pointer"
                aria-label="Défiler vers la droite"
              >
                <ChevronRightIcon className="w-6 h-6 text-gray-700" />
              </button>

              {/* Indicateurs pour mobile */}
              <div className="flex justify-center gap-2 mt-4 md:hidden">
                {rooms.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (scrollContainerRef.current) {
                        scrollContainerRef.current.scrollTo({ left: index * 320, behavior: 'smooth' })
                      }
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${activeIndex === index ? 'bg-[#01BDA5] w-4' : 'bg-gray-300 hover:bg-gray-400'
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
                    className="flex overflow-x-auto scroll-smooth gap-5 pb-4 scrollbar-hide overflow-visible"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {rooms.map((room) => (
                      <div key={room.id} className="flex-shrink-0 w-[240px] p-2">
                        <RoomCard
                          imageUrl={room.imageUrl}
                          name={room.name}
                          beds={room.beds}
                          bathrooms={room.bathrooms}
                          maxPersons={room.maxPersons}
                          price={room.price}
                          availability={room.availability}
                          href={`/hotel/${slug}/room/${room.id}`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Indicateurs pour mobile */}
                  <div className="flex justify-center gap-2 mt-4 md:hidden">
                    {rooms.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (scrollContainerRef.current) {
                            scrollContainerRef.current.scrollTo({ left: index * 320, behavior: 'smooth' })
                          }
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${activeIndex === index ? 'bg-[#01BDA5] w-4' : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        aria-label={`Aller à la chambre ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Version desktop : grille */}
              <div className="hidden md:grid md:hidden lg:grid-cols-3 justify-between gap-6">
                {rooms.map((room) => (
                  <div key={room.id} className="w-[280px] p-4">
                    <RoomCard
                      imageUrl={room.imageUrl}
                      name={room.name}
                      beds={room.beds}
                      bathrooms={room.bathrooms}
                      maxPersons={room.maxPersons}
                      price={room.price}
                      availability={room.availability}
                      href={`/hotel/${slug}/room/${room.id}`}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}