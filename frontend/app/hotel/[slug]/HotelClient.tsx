'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Share, Heart, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useOnScreen } from '@/hooks/useOnScreen'
import Bouton from '../../components/ui/Bouton'
import HotelPhoto from '../../components/ui/HotelPhoto'
import RoomCard from '../../components/ui/RoomCard'
import dynamic from 'next/dynamic'
const AvisClient = dynamic(() => import('@/app/components/ui/AvisClient'), { ssr: false })
import HotelInfo from '@/app/components/ui/HotelInfo'
import { hotelService } from '@/lib/services/hotel.service'
import { favoriService } from '@/lib/services/favori.service'
import { authService } from '@/lib/services/auth.service'
import type { HotelDetail } from '@/lib/types'

interface HotelClientProps {
  hotelId: number
  hotelName: string
  slug: string
}

export default function HotelClient({ hotelId, hotelName, slug }: HotelClientProps) {
  const router = useRouter()
  const t = useTranslations('HotelClient')
  const [isLoading, setIsLoading] = useState(true)
  const [hotelData, setHotelData] = useState<HotelDetail | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const [setRoomsRef, isRoomsVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true)
      try {
        const isAuth = authService.isAuthenticated()
        const [data, favoris] = await Promise.all([
          hotelService.get(hotelId),
          isAuth ? favoriService.list().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        ])
        setHotelData(data)
        setIsSaved((favoris as { data: { hotel_id: number }[] }).data.some(f => f.hotel_id === hotelId))
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAll()
  }, [hotelId])

  // Scroll pour le carrousel des chambres
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const update = () => setScrollPosition(container.scrollLeft)
    update()
    container.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    return () => {
      container.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const rooms = hotelData?.chambres ?? []

  const getActiveIndex = () => {
    if (!scrollContainerRef.current || rooms.length === 0) return 0
    const cardWidth = window.innerWidth < 640 ? 280 : window.innerWidth < 768 ? 320 : 340
    const gap = window.innerWidth < 640 ? 16 : window.innerWidth < 768 ? 20 : 24
    return Math.min(Math.max(0, Math.round(scrollPosition / (cardWidth + gap))), rooms.length - 1)
  }

  const activeIndex = getActiveIndex()

  const scrollLeft = () => {
    if (!scrollContainerRef.current) return
    const cardWidth = window.innerWidth < 640 ? 280 : window.innerWidth < 768 ? 320 : 340
    const gap = window.innerWidth < 640 ? 16 : window.innerWidth < 768 ? 20 : 24
    scrollContainerRef.current.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' })
  }

  const scrollRight = () => {
    if (!scrollContainerRef.current) return
    const cardWidth = window.innerWidth < 640 ? 280 : window.innerWidth < 768 ? 320 : 340
    const gap = window.innerWidth < 640 ? 16 : window.innerWidth < 768 ? 20 : 24
    scrollContainerRef.current.scrollBy({ left: cardWidth + gap, behavior: 'smooth' })
  }

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return
    const cardWidth = window.innerWidth < 640 ? 280 : window.innerWidth < 768 ? 320 : 340
    const gap = window.innerWidth < 640 ? 16 : window.innerWidth < 768 ? 20 : 24
    scrollContainerRef.current.scrollTo({ left: index * (cardWidth + gap), behavior: 'smooth' })
  }

  const handleSave = async () => {
    if (!authService.isAuthenticated()) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    try {
      if (isSaved) {
        await favoriService.remove(hotelId)
      } else {
        await favoriService.add(hotelId)
      }
      setIsSaved(!isSaved)
    } catch (error) {
      console.error(error)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: hotelName, text: t('share_text', { hotelName }), url: window.location.href })
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

  const hotel = hotelData?.hotel
  const photos = hotelData?.photos.map(p => p.url_photo) ?? ['/photos/bc.png']
  const location = hotel?.adresse
    ? `${hotel.adresse.ville}, ${hotel.adresse.pays}`
    : 'Madagascar'
  const category = hotel?.types?.[0]?.nom ?? ''
  const includedItems = hotelData?.services.map(s => s.nom) ?? []

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">

        {/* Header */}
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
              {hotel?.nom ?? hotelName}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Bouton size="medium" onClick={handleSave} className="flex items-center gap-2">
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{isSaved ? t('saved') : t('save')}</span>
            </Bouton>
            <Bouton size="medium" onClick={handleShare} className="flex items-center gap-2">
              <Share className="w-5 h-5" />
              <span className="hidden sm:inline">{t('share')}</span>
            </Bouton>
          </div>
        </div>

        {/* Photos */}
        <div className="py-4">
          <HotelPhoto
            imageUrl={photos.length > 0 ? photos : ['/photos/bc.png']}
            autoPlayInterval={5000}
            className="mb-4"
          />
        </div>

        {/* Infos hôtel */}
        <div className="mt-4 mb-4">
          <HotelInfo
            hotelName={hotel?.nom ?? hotelName}
            location={location}
            etoiles={hotel?.etoiles ?? undefined}
            rating={hotelData?.note_moyenne ?? 0}
            reviewCount={hotelData?.nb_avis ?? 0}
            category={category}
            description={hotel?.description ?? ''}
            includedItems={includedItems.length > 0 ? includedItems : undefined}
          />
        </div>

        {/* Chambres et disponibilités */}
        <div
          ref={setRoomsRef}
          className={`mt-4 mb-4 transition-all duration-700 ease-out ${
            isRoomsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-600 mb-4">
            {t('rooms_title')}
          </h2>

          {rooms.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucune chambre disponible</p>
          ) : rooms.length > 3 ? (
            /* Carrousel > 3 chambres */
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
                      imageUrl={room.photo ?? '/photos/bc.png'}
                      name={room.nom}
                      beds={room.nb_lits ?? 1}
                      bathrooms={room.nb_salles_bain ?? 1}
                      maxPersons={room.capacite}
                      price={room.prix_par_nuit ?? 0}
                      prixMga={room.prix_mga}
                      prixEur={room.prix_eur}
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
            /* ≤ 3 chambres : carrousel mobile / grille desktop */
            <>
              <div className="lg:hidden">
                <div className="relative overflow-visible">
                  <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto scroll-smooth gap-4 sm:gap-5 pb-6 scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {rooms.map((room) => (
                      <div key={room.id} className="flex-shrink-0 w-[320px]">
                        <RoomCard
                          hotelId={room.id}
                          imageUrl={room.photo ?? '/photos/bc.png'}
                          name={room.nom}
                          beds={room.nb_lits ?? 1}
                          bathrooms={room.nb_salles_bain ?? 1}
                          maxPersons={room.capacite}
                          price={room.prix_par_nuit ?? 0}
                          prixMga={room.prix_mga}
                          prixEur={room.prix_eur}
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
                    imageUrl={room.photo ?? '/photos/bc.png'}
                    name={room.nom}
                    beds={room.nb_lits ?? 1}
                    bathrooms={room.nb_salles_bain ?? 1}
                    maxPersons={room.capacite}
                    price={room.prix_par_nuit ?? 0}
                    prixMga={room.prix_mga}
                    prixEur={room.prix_eur}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Avis des voyageurs */}
        <div className="py-4">
          <AvisClient hotelId={hotelId} />
        </div>
      </div>
    </main>
  )
}
